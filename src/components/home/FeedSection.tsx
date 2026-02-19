import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Send, TrendingUp, Users, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PlayCard from "@/components/play/PlayCard";
import { sportsVideos } from "@/data/sportsVideos";
import { Link } from "react-router-dom";

const leagues = ["All", "NFL", "NBA", "MLB", "NHL"];
const BATCH_SIZE = 10;

const LEAGUE_ACCENT: Record<string, string> = {
  NFL: "text-blue-400",
  NBA: "text-orange-400",
  MLB: "text-red-400",
  NHL: "text-sky-400",
};

// Suggested users sidebar widget
const SUGGESTED_USERS = [
  { username: "EmilyS", role: "NBA Analyst", initials: "ES" },
  { username: "RefGuys4", role: "Officiating Expert", initials: "RG" },
  { username: "DavidR", role: "MLB Scout", initials: "DR" },
];

// Trending sidebar widget
const trendingVideos = sportsVideos.slice(0, 3);

const FeedSection = () => {
  const [activeLeague, setActiveLeague] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filtered = activeLeague === "All"
    ? sportsVideos
    : sportsVideos.filter((v) => v.league === activeLeague);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((c) => c + BATCH_SIZE);
      setIsLoading(false);
    }, 800);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section id="feed" className="py-10 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Filter strip */}
        <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
          {["All", "Controversial", "Call Reviews", "Rule Changes"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {leagues.filter(l => l !== "All").map((league) => (
              <button
                key={league}
                onClick={() => { setActiveLeague(league === activeLeague ? "All" : league); setVisibleCount(BATCH_SIZE); }}
                className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                  activeLeague === league
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {league}
              </button>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* Main feed */}
          <div className="space-y-6">
            {visible.map((video) => (
              <PlayCard
                key={video.id}
                id={video.id}
                title={video.title}
                description={video.description}
                league={video.league}
                teams={video.teams}
                date={video.date}
                gameContext={video.gameContext}
                isHot={video.isHot}
                voteCount={video.voteCount}
                commentCount={video.commentCount}
                embedUrl={video.embedUrl}
                videoUrl={video.videoUrl}
                videoSource={video.videoSource}
                ruleData={video.ruleData}
              />
            ))}

            <div ref={loaderRef} className="flex justify-center py-8">
              {isLoading && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:flex flex-col gap-6 sticky top-20">

            {/* Trending */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="font-semibold text-sm tracking-wide uppercase">Trending</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="divide-y divide-border">
                {trendingVideos.map((v) => (
                  <div key={v.id} className="flex items-start gap-3 px-5 py-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <div className="w-16 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                      <Play className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug line-clamp-2">{v.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{v.date}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{(v.voteCount / 1000).toFixed(1)}K votes</span>
                        <span className="text-xs text-primary hover:underline cursor-pointer">Open</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3">
                <a
                  href="https://forms.gle/SticowSatRJgssuY9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Submit a Clip
                </a>
              </div>
            </div>

            {/* Who to Follow */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="font-semibold text-sm tracking-wide uppercase">Who to Follow</span>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="divide-y divide-border">
                {SUGGESTED_USERS.map((u) => (
                  <div key={u.username} className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className="bg-secondary text-xs font-bold">{u.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight">{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.role}</p>
                    </div>
                    <button className="text-xs font-semibold text-primary border border-primary/40 rounded-full px-3 py-1 hover:bg-primary/10 transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* League jump */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <span className="font-semibold text-sm tracking-wide uppercase">Explore by League</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {["NFL", "NBA", "MLB", "NHL"].map((lg) => (
                  <button
                    key={lg}
                    onClick={() => { setActiveLeague(lg); setVisibleCount(BATCH_SIZE); }}
                    className={`rounded-lg py-3 text-sm font-bold transition-all border ${
                      activeLeague === lg
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-secondary text-foreground"
                    }`}
                  >
                    {lg}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default FeedSection;
