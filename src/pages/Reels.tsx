import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllClips } from "@/lib/api/clips";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Loader2,
  Film,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Repeat2,
} from "lucide-react";


const ytReadyPromise: { current: Promise<void> | null } = { current: null };
function loadYT(): Promise<void> {
  if (ytReadyPromise.current) return ytReadyPromise.current;
  ytReadyPromise.current = new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });
  return ytReadyPromise.current;
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <span className="h-12 w-12 rounded-full bg-secondary/80 hover:bg-secondary text-foreground flex items-center justify-center transition-colors">
        {icon}
      </span>
      {label && (
        <span className="text-xs text-foreground/80 font-medium">{label}</span>
      )}
    </button>
  );
}

function ReelItem({
  clip,
  active,
  muted,
  onEnded,
}: {
  clip: any;
  active: boolean;
  muted: boolean;
  onEnded: () => void;
}) {
  const video = clip.videos;
  const youtubeId = video?.youtube_id;
  const containerId = `reel-${clip.id}`;
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!youtubeId) return;
    let cancelled = false;
    loadYT().then(() => {
      if (cancelled || playerRef.current) return;
      playerRef.current = new window.YT.Player(containerId, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          start: clip.start_seconds,
          end: clip.end_seconds,
          modestbranding: 1,
          rel: 0,
          controls: 1,
          playsinline: 1,
          mute: 1,
        },
        events: {
          onReady: () => setReady(true),
        },
      });
    });
    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
    };
  }, [youtubeId, clip.id, clip.start_seconds, clip.end_seconds, containerId]);

  // play/pause + auto-advance when clip ends
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    const p = playerRef.current;
    if (active) {
      try {
        p.seekTo(clip.start_seconds, true);
        p.playVideo();
      } catch {}
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        try {
          const t = p.getCurrentTime();
          if (t >= clip.end_seconds) {
            p.pauseVideo();
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            onEnded();
          }
        } catch {}
      }, 300);
    } else {
      try {
        p.pauseVideo();
      } catch {}
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, ready, clip.start_seconds, clip.end_seconds, onEnded]);

  // mute toggle
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    try {
      muted ? playerRef.current.mute() : playerRef.current.unMute();
    } catch {}
  }, [muted, ready]);

  const shareClip = async () => {
    const url = `${window.location.origin}/reels#${clip.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <section
      data-reel-id={clip.id}
      className="snap-start h-[calc(100vh-104px)] w-full flex items-center justify-center relative bg-background"
    >
      <div className="relative h-full flex items-center justify-center gap-4 py-6">
        {/* Vertical 9:16 video */}
        <div className="relative h-full max-h-[calc(100vh-140px)] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl">
          {youtubeId ? (
            <div id={containerId} className="absolute inset-0 w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Film className="h-10 w-10 opacity-40" />
              <p className="text-sm">Video unavailable</p>
            </div>
          )}

          {/* Bottom-left title/info overlay */}
          <div className="absolute left-0 right-16 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
            <h2 className="text-white font-semibold text-base mb-1 line-clamp-2">
              {clip.clip_title}
            </h2>
            {video?.title && (
              <p className="text-white/70 text-xs line-clamp-1 mb-1">
                {video.title}
              </p>
            )}
            {clip.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {clip.tags.slice(0, 3).map((t: string) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="text-[10px] border-white/30 text-white bg-black/30"
                  >
                    #{t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right action rail */}
        <div className="flex flex-col items-center gap-4 pb-12">
          <ActionButton icon={<ThumbsUp className="h-5 w-5" />} label="Like" />
          <ActionButton icon={<ThumbsDown className="h-5 w-5" />} label="Dislike" />
          <ActionButton icon={<MessageCircle className="h-5 w-5" />} label="0" />
          <ActionButton icon={<Share2 className="h-5 w-5" />} label="Share" onClick={shareClip} />
          <ActionButton icon={<Repeat2 className="h-5 w-5" />} label="Replay" onClick={() => {
            try {
              playerRef.current?.seekTo(clip.start_seconds, true);
              playerRef.current?.playVideo();
            } catch {}
          }} />
        </div>
      </div>
    </section>
  );
}

export default function Reels() {
  const { data: clips = [], isLoading } = useQuery({
    queryKey: ["all-clips"],
    queryFn: fetchAllClips,
  });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = (visible.target as HTMLElement).dataset.reelId;
          if (id) setActiveId(id);
        }
      },
      { root, threshold: [0.6] }
    );
    const nodes = root.querySelectorAll("[data-reel-id]");
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [clips]);

  // set initial active
  useEffect(() => {
    if (!activeId && clips.length > 0) setActiveId(clips[0].id);
  }, [clips, activeId]);

  const scrollBy = (dir: 1 | -1) => {
    const root = scrollerRef.current;
    if (!root) return;
    root.scrollBy({ top: dir * root.clientHeight, behavior: "smooth" });
  };

  // keyboard nav: arrows/J/K to navigate, M to mute
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.matches('input, textarea, [contenteditable="true"]')) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j") {
        e.preventDefault();
        scrollBy(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") {
        e.preventDefault();
        scrollBy(-1);
      } else if (e.key === "m") {
        setMuted((m) => !m);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // auto-advance to next when a clip's end is reached
  const handleEnded = () => {
    scrollBy(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Reels — Controversial Call Clips | Under Review"
        description="Swipe through short clips of the most disputed sports calls, one play at a time, and react as you scroll."
        path="/reels"
      />
      <Header />
      <main className="relative flex-1">
        <h1 className="sr-only">Controversial call reels</h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-104px)]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-104px)] text-muted-foreground">
            <Film className="h-12 w-12 mb-3 opacity-30" />
            <p>No clips available</p>
          </div>
        ) : (
          <>
            <div
              ref={scrollerRef}
              className="h-[calc(100vh-104px)] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: "none" }}
            >
              {clips.map((clip: any) => (
                <ReelItem
                  key={clip.id}
                  clip={clip}
                  active={activeId === clip.id}
                  muted={muted}
                  onEnded={handleEnded}
                />
              ))}
            </div>

            {/* Far-right up/down nav (YouTube Shorts style) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => scrollBy(-1)}
                className="rounded-full h-12 w-12 bg-secondary/80 hover:bg-secondary"
                aria-label="Previous"
                title="Up arrow"
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => scrollBy(1)}
                className="rounded-full h-12 w-12 bg-secondary/80 hover:bg-secondary"
                aria-label="Next"
                title="Down arrow"
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setMuted((m) => !m)}
                className="rounded-full h-12 w-12 bg-secondary/80 hover:bg-secondary mt-2"
                aria-label={muted ? "Unmute" : "Mute"}
                title="M to toggle"
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
