import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, Repeat2, Share2, ThumbsDown, ThumbsUp, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sportsVideos, type SportVideo } from "@/data/sportsVideos";

const ytReadyPromise: { current: Promise<void> | null } = { current: null };

function loadYT(): Promise<void> {
  if (ytReadyPromise.current) return ytReadyPromise.current;
  ytReadyPromise.current = new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };
  });
  return ytReadyPromise.current;
}

function parseYouTube(embedUrl?: string) {
  if (!embedUrl) return null;
  const id = embedUrl.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{11})/)?.[1];
  if (!id) return null;
  const query = embedUrl.split("?")[1] || "";
  const params = new URLSearchParams(query);
  const start = Number(params.get("start") || 0);
  const end = Number(params.get("end") || start + 28);
  return { id, start, end };
}

function getTwitterId(url?: string) {
  return url?.match(/status\/(\d+)/)?.[1] || "";
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 text-foreground transition-colors hover:text-primary">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-lg">
        {icon}
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

function ShortsCard({ video, active, muted, onEnded }: { video: SportVideo; active: boolean; muted: boolean; onEnded: () => void }) {
  const youtube = parseYouTube(video.embedUrl);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const containerId = `short-player-${video.id}`;

  useEffect(() => {
    if (!youtube) return;
    let cancelled = false;
    loadYT().then(() => {
      if (cancelled || playerRef.current) return;
      playerRef.current = new window.YT.Player(containerId, {
        videoId: youtube.id,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start: youtube.start,
          end: youtube.end,
          mute: 1,
        },
      });
    });
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
    };
  }, [containerId, youtube?.id, youtube?.start, youtube?.end]);

  useEffect(() => {
    if (!youtube || !playerRef.current) return;
    const player = playerRef.current;
    if (active) {
      try {
        muted ? player.mute() : player.unMute();
        player.seekTo(youtube.start, true);
        player.playVideo();
      } catch {}
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        try {
          if (player.getCurrentTime() >= youtube.end) {
            player.pauseVideo();
            onEnded();
          }
        } catch {}
      }, 300);
    } else {
      try {
        player.pauseVideo();
      } catch {}
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, muted, onEnded, youtube]);

  const tweetId = video.videoSource === "twitter" ? getTwitterId(video.embedUrl) : "";

  return (
    <section data-short-id={video.id} className="flex h-[calc(100vh-104px)] snap-start items-center justify-center px-4 py-6">
      <div className="flex h-full max-h-[720px] items-end justify-center gap-4">
        <div className="relative h-full aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {youtube ? (
            <div id={containerId} className="absolute inset-0 h-full w-full" />
          ) : tweetId ? (
            <iframe
              src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark`}
              className="absolute inset-0 h-full w-full border-0"
              title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-muted-foreground">Video unavailable</div>
          )}

          <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-background via-background/80 to-transparent p-4 pt-20">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{video.league}</Badge>
              {video.isHot && <Badge>Trending</Badge>}
            </div>
            <h2 className="line-clamp-2 text-lg font-bold text-foreground">{video.title}</h2>
            <p className="line-clamp-2 text-sm text-muted-foreground">{video.teams} · {video.gameContext}</p>
          </div>
        </div>

        <div className="hidden flex-col items-center gap-4 pb-6 lg:flex">
          <ActionButton icon={<ThumbsUp className="h-5 w-5" />} label="Like" />
          <ActionButton icon={<ThumbsDown className="h-5 w-5" />} label="Missed" />
          <ActionButton icon={<MessageCircle className="h-5 w-5" />} label={`${video.commentCount}`} />
          <ActionButton icon={<Share2 className="h-5 w-5" />} label="Share" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/#${video.id}`)} />
          {youtube && (
            <ActionButton
              icon={<Repeat2 className="h-5 w-5" />}
              label="Replay"
              onClick={() => {
                try {
                  playerRef.current?.seekTo(youtube.start, true);
                  playerRef.current?.playVideo();
                } catch {}
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

const FeedSection = () => {
  const videos = useMemo(() => sportsVideos.filter((video) => video.embedUrl), []);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(videos[0]?.id ?? null);
  const [muted, setMuted] = useState(true);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const root = scrollerRef.current;
    if (!root) return;
    root.scrollBy({ top: direction * root.clientHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = (visible?.target as HTMLElement | undefined)?.dataset.shortId;
        if (id) setActiveId(id);
      },
      { root, threshold: 0.65 }
    );
    root.querySelectorAll("[data-short-id]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [videos]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target?.matches('input, textarea, [contenteditable="true"]')) return;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key.toLowerCase() === "j") {
        event.preventDefault();
        scrollByCard(1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp" || event.key.toLowerCase() === "k") {
        event.preventDefault();
        scrollByCard(-1);
      } else if (event.key.toLowerCase() === "m") {
        setMuted((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollByCard]);

  return (
    <section id="feed" className="bg-background">
      <div ref={scrollerRef} className="h-[calc(100vh-104px)] overflow-y-scroll snap-y snap-mandatory scroll-smooth" style={{ scrollbarWidth: "none" }}>
        {videos.map((video) => (
          <ShortsCard key={video.id} video={video} active={activeId === video.id} muted={muted} onEnded={() => scrollByCard(1)} />
        ))}
      </div>

      <div className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <Button size="icon" variant="secondary" onClick={() => scrollByCard(-1)} className="h-12 w-12 rounded-full border border-border shadow-lg" aria-label="Previous video">
          <ChevronUp className="h-6 w-6" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => scrollByCard(1)} className="h-12 w-12 rounded-full border border-border shadow-lg" aria-label="Next video">
          <ChevronDown className="h-6 w-6" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => setMuted((value) => !value)} className="mt-2 h-12 w-12 rounded-full border border-border shadow-lg" aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
    </section>
  );
};

export default FeedSection;