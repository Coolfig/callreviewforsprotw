import { createContext, useContext, useCallback, useRef, useState, ReactNode } from "react";
import { Trophy, Heart, Flame } from "lucide-react";

type CelebrationType = "post" | "like" | "vote";

interface Celebration {
  id: number;
  points: number;
  label: string;
  type: CelebrationType;
}

interface CelebrationContextValue {
  celebrate: (type: CelebrationType) => void;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

// Rewarding "level up" / coin chime — free, CORS-friendly hosted
const CHEER_URL =
  "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg";
const REWARD_URL =
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_3c7e9ef6c7.mp3?filename=success-1-6297.mp3";

const CONFIG: Record<CelebrationType, { points: number; label: string }> = {
  post: { points: 1, label: "" },
  like: { points: 1, label: "" },
  vote: { points: 1, label: "" },
};

const COLORS = [
  "hsl(358 78% 52%)", // red
  "hsl(48 100% 55%)", // yellow
  "hsl(210 100% 56%)", // blue
  "hsl(142 70% 45%)", // green
  "#ffffff",
];

export const CelebrationProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Celebration[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlay = useRef(0);

  const celebrate = useCallback((type: CelebrationType) => {
    const cfg = CONFIG[type];
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, points: cfg.points, label: cfg.label, type }]);

    // Sound — throttle to avoid spam
    const now = Date.now();
    if (now - lastPlay.current > 400) {
      lastPlay.current = now;
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(REWARD_URL);
          audioRef.current.volume = 0.5;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } catch {}
    }

    setTimeout(() => {
      setItems((prev) => prev.filter((c) => c.id !== id));
    }, 2200);
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {items.map((c) => (
          <CelebrationOverlay key={c.id} celebration={c} />
        ))}
      </div>
    </CelebrationContext.Provider>
  );
};

const CelebrationOverlay = ({ celebration }: { celebration: Celebration }) => {
  const Icon = celebration.type === "like" ? Heart : celebration.type === "vote" ? Flame : Trophy;
  const confetti = Array.from({ length: 40 });

  return (
    <>
      {/* Pulsing ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="ring-pulse rounded-full border-4"
          style={{
            width: 200,
            height: 200,
            borderColor: "hsl(48 100% 55% / 0.6)",
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Confetti */}
      {confetti.map((_, i) => {
        const left = Math.random() * 100;
        const dx = (Math.random() - 0.5) * 200;
        const dur = 1.6 + Math.random() * 1.2;
        const color = COLORS[i % COLORS.length];
        const delay = Math.random() * 0.25;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={
              {
                left: `${left}%`,
                background: color,
                animationDelay: `${delay}s`,
                ["--dur" as any]: `${dur}s`,
                ["--dx" as any]: `${dx}px`,
              } as React.CSSProperties
            }
          />
        );
      })}

      {/* Center points badge */}
      <div
        className="celebration-badge absolute top-1/2 left-1/2"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex items-center gap-3 px-7 py-4 rounded-2xl border-2 shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(358 78% 52%), hsl(358 90% 60%))",
              borderColor: "hsl(48 100% 55%)",
              boxShadow:
                "0 20px 60px -10px hsl(358 78% 52% / 0.7), 0 0 40px hsl(48 100% 55% / 0.4)",
            }}
          >
            <Icon className="w-8 h-8 text-white fill-white drop-shadow-lg" />
            <div className="text-white">
              <div className="text-4xl font-extrabold leading-none tabular-nums drop-shadow-lg">
                +{celebration.points}
              </div>
              <div className="text-[10px] font-bold tracking-[0.2em] opacity-90">
                POINTS
              </div>
            </div>
          </div>
          <div
            className="text-sm font-extrabold tracking-[0.3em] uppercase"
            style={{ color: "hsl(48 100% 55%)", textShadow: "0 2px 12px hsl(48 100% 55% / 0.5)" }}
          >
            {celebration.label}
          </div>
        </div>
      </div>
    </>
  );
};

export const useCelebration = () => {
  const ctx = useContext(CelebrationContext);
  if (!ctx) {
    return { celebrate: (_t: CelebrationType) => {} };
  }
  return ctx;
};
