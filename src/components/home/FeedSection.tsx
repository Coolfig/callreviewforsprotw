import { useState, useEffect, useRef, useCallback } from "react";
import { Filter, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlayCard from "@/components/play/PlayCard";
import { sportsVideos } from "@/data/sportsVideos";

const leagues = ["All", "NFL", "NBA", "MLB", "NHL"];
const BATCH_SIZE = 10;

const FeedSection = () => {
  const [activeLeague, setActiveLeague] = useState("All");
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
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section id="feed" className="py-24 bg-card/50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Controversy Feed</h2>
            <p className="text-muted-foreground">
              The latest disputed calls across all major leagues
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {leagues.map((league) => (
                <Badge 
                  key={league}
                  variant={activeLeague === league ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    activeLeague === league 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => { setActiveLeague(league); setVisibleCount(BATCH_SIZE); }}
                >
                  {league}
                </Badge>
              ))}
            </div>

            <a
              href="https://forms.gle/SticowSatRJgssuY9"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Send className="w-4 h-4" />
                Submit a Clip
              </Button>
            </a>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-8">
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
        </div>

        {/* Infinite scroll loader */}
        <div ref={loaderRef} className="flex justify-center py-12">
          {isLoading && (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedSection;
