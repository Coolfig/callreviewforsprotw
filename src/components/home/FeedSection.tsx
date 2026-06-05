import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Check, ChevronDown, ChevronUp, HelpCircle, Maximize2, MessageCircle, Minimize2, Users, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { sportsVideos, type SportVideo } from "@/data/sportsVideos";
import { supabase } from "@/integrations/supabase/client";

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

function ShortsCard({ video, active, muted, fullscreen, voteCount, commentCount, onEnded }: { video: SportVideo; active: boolean; muted: boolean; fullscreen: boolean; voteCount: number; commentCount: number; onEnded: () => void }) {
  const youtube = parseYouTube(video.embedUrl);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const containerId = `short-player-${video.id}`;

  useEffect(() => {
    if (!youtube || !active) return;
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
        events: {
          onReady: () => setReady(true),
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
  }, [active, containerId, youtube?.id, youtube?.start, youtube?.end]);

  useEffect(() => {
    if (!youtube || !ready) return;
    const player = playerRef.current;
    if (!player) return;
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
        player.mute();
        player.pauseVideo?.();
        player.stopVideo?.();
        player.clearVideo?.();
      } catch {}
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, muted, onEnded, youtube, ready]);

  useEffect(() => {
    if (active) return;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      playerRef.current?.mute?.();
      playerRef.current?.pauseVideo?.();
      playerRef.current?.stopVideo?.();
      playerRef.current?.clearVideo?.();
      playerRef.current?.destroy?.();
    } catch {}
    playerRef.current = null;
    setReady(false);
  }, [active]);


  const tweetId = video.videoSource === "twitter" ? getTwitterId(video.embedUrl) : "";
  const rules = video.ruleData?.rules ?? [];
  const season = video.ruleData?.season;

  return (
    <section data-short-id={video.id} className={`flex snap-start items-center justify-center ${fullscreen ? "h-screen px-0 py-0" : "h-[calc(100vh-104px)] px-4 py-6"}`}>
      <div className={`flex items-stretch justify-center gap-4 ${fullscreen ? "h-full w-full max-h-none" : "h-full max-h-[760px]"}`}>
        {/* Left: Rulebook panel */}
        {!fullscreen && (
        <aside className="hidden w-[300px] flex-col gap-4 overflow-y-auto lg:flex" style={{ scrollbarWidth: "none" }}>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Official Rulebook</div>
                  <div className="text-xs text-muted-foreground">{video.league} {season ?? ""}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">{video.league}</Badge>
            </div>
            <Accordion type="single" collapsible className="mt-3">
              <AccordionItem value="explain" className="border-border">
                <AccordionTrigger className="py-3 text-sm font-semibold">Rule Explanation</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">
                  {video.ruleData?.ruleExplanation?.plainEnglishSummary ?? video.ruleData?.keyInterpretation ?? "No explanation available for this play yet."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="text" className="border-border">
                <AccordionTrigger className="py-3 text-sm font-semibold">Official Rule Text</AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs text-muted-foreground">
                  {rules.length === 0 ? (
                    <p>No rule citation provided.</p>
                  ) : (
                    rules.map((r, i) => (
                      <div key={i}>
                        <div className="text-xs font-semibold text-foreground">Rule {r.ruleNumber} · {r.ruleTitle}</div>
                        <p className="mt-1 leading-relaxed">{r.ruleText}</p>
                      </div>
                    ))
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>
        )}

        {/* Center: Player */}
        <div className={`relative overflow-hidden border border-border bg-card shadow-2xl ${fullscreen ? "h-full w-full rounded-none" : "h-full aspect-[9/16] rounded-2xl"}`}>
          {youtube && active ? (
            <div id={containerId} className="absolute inset-0 h-full w-full" />
          ) : youtube ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-muted-foreground">Loading next call…</div>
          ) : tweetId && active ? (
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

        {/* Right: What's Your Call + Discussion (condensed) */}
        {!fullscreen && (
        <aside className="hidden w-[300px] flex-col gap-2 overflow-y-auto lg:flex" style={{ scrollbarWidth: "none" }}>
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground">What's Your Call?</h3>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Users className="h-3 w-3" /> {voteCount.toLocaleString()} votes
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[
                { icon: <Check className="h-3.5 w-3.5" />, label: "Correct" },
                { icon: <X className="h-3.5 w-3.5" />, label: "Missed" },
                { icon: <HelpCircle className="h-3.5 w-3.5" />, label: "Unclear" },
              ].map((opt) => (
                <Link
                  key={opt.label}
                  to={`/play/${video.id}`}
                  className="flex flex-col items-center gap-1 rounded-md border border-border bg-background/40 py-2 text-[11px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {opt.icon}
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to={`/play/${video.id}#discussion`}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <MessageCircle className="h-4 w-4 text-primary" /> Discussion
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{commentCount.toLocaleString()}</span>
            </div>
            <span className="text-[11px] font-semibold text-primary">Open →</span>
          </Link>
        </aside>
        )}

      </div>
    </section>
  );
}

const FeedSection = () => {
  const videos = useMemo(() => sportsVideos.filter((video) => video.embedUrl), []);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(videos[0]?.id ?? null);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

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
    <section id="feed" className={`bg-background ${fullscreen ? "fixed inset-0 z-50" : ""}`}>
      <div ref={scrollerRef} className={`${fullscreen ? "h-screen" : "h-[calc(100vh-104px)]"} overflow-y-scroll snap-y snap-mandatory scroll-smooth`} style={{ scrollbarWidth: "none" }}>
        {videos.map((video) => (
          <ShortsCard key={video.id} video={video} active={activeId === video.id} muted={muted} fullscreen={fullscreen} onEnded={() => scrollByCard(1)} />
        ))}
      </div>

      <div className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <Button size="icon" variant="secondary" onClick={() => scrollByCard(-1)} className="h-12 w-12 rounded-full border border-border shadow-lg" aria-label="Previous video">
          <ChevronUp className="h-6 w-6" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => scrollByCard(1)} className="h-12 w-12 rounded-full border border-border shadow-lg" aria-label="Next video">
          <ChevronDown className="h-6 w-6" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => setMuted((value) => !value)} className="mt-2 h-12 w-12 rounded-full border border-border shadow-lg" aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <Button size="icon" variant="secondary" onClick={() => setFullscreen((v) => !v)} className="h-12 w-12 rounded-full border border-border shadow-lg" aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
          {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>
    </section>
  );
};

export default FeedSection;