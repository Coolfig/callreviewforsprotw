import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllClips } from "@/lib/api/clips";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, ChevronUp, ChevronDown, Loader2, Film } from "lucide-react";


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

function ReelItem({
  clip,
  active,
  muted,
}: {
  clip: any;
  active: boolean;
  muted: boolean;
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

  // play/pause + loop based on active
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
            p.seekTo(clip.start_seconds, true);
            p.playVideo();
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
  }, [active, ready, clip.start_seconds, clip.end_seconds]);

  // mute toggle
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    try {
      muted ? playerRef.current.mute() : playerRef.current.unMute();
    } catch {}
  }, [muted, ready]);

  return (
    <section
      data-reel-id={clip.id}
      className="snap-start h-[calc(100vh-104px)] w-full flex items-center justify-center relative bg-black"
    >
      <div className="relative h-full aspect-[9/16] max-h-full bg-black overflow-hidden">
        {youtubeId ? (
          <div id={containerId} className="absolute inset-0 w-full h-full pointer-events-auto" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Film className="h-10 w-10 opacity-40" />
            <p className="text-sm">Video unavailable</p>
          </div>
        )}

        {/* Overlay info */}
        <div className="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
          <h2 className="text-white font-semibold text-base mb-1 line-clamp-2">
            {clip.clip_title}
          </h2>
          {clip.notes && (
            <p className="text-white/80 text-xs mb-2 line-clamp-2">{clip.notes}</p>
          )}
          {clip.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {clip.tags.slice(0, 4).map((t: string) => (
                <Badge key={t} variant="outline" className="text-[10px] border-white/30 text-white">
                  {t}
                </Badge>
              ))}
            </div>
          )}
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

  // keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j") scrollBy(1);
      if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") scrollBy(-1);
      if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="relative flex-1">
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
                />
              ))}
            </div>

            {/* Side controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => scrollBy(-1)}
                className="rounded-full h-11 w-11 bg-background/70 backdrop-blur"
                aria-label="Previous"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => scrollBy(1)}
                className="rounded-full h-11 w-11 bg-background/70 backdrop-blur"
                aria-label="Next"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setMuted((m) => !m)}
                className="rounded-full h-11 w-11 bg-background/70 backdrop-blur"
                aria-label={muted ? "Unmute" : "Mute"}
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
