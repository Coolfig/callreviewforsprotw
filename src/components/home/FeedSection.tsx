import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlayCard from "@/components/play/PlayCard";
import { sportsVideos } from "@/data/sportsVideos";

const leagues = ["All", "NFL", "NBA", "MLB", "NHL"];
const INITIAL_COUNT = 10;

const FeedSection = () => {
  const [activeLeague, setActiveLeague] = useState("All");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const filtered = activeLeague === "All"
    ? sportsVideos
    : sportsVideos.filter((v) => v.league === activeLeague);

  const visible = filtered.slice(0, visibleCount);

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
                  onClick={() => { setActiveLeague(league); setVisibleCount(INITIAL_COUNT); }}
                >
                  {league}
                </Badge>
              ))}
            </div>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
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

        {/* Load more */}
        {visibleCount < filtered.length && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((c) => c + 10)}
            >
              Load More Controversies ({filtered.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedSection;
