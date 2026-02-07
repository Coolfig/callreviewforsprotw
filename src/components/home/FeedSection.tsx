import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlayCard from "@/components/play/PlayCard";

const leagues = ["All", "NFL", "NBA", "MLB", "NHL"];

const FeedSection = () => {
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
            {/* League filters */}
            <div className="flex gap-2">
              {leagues.map((league, index) => (
                <Badge 
                  key={league}
                  variant={index === 0 ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    index === 0 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'hover:bg-secondary'
                  }`}
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
          <PlayCard 
            id="1"
            title="Controversial Blocking Foul - Lakers vs Celtics"
            description="LeBron James drives to the basket and is called for an offensive foul on Jayson Tatum. The call negated what would have been a game-tying basket with 12 seconds remaining. Replays show Tatum may have still been moving when contact occurred."
            league="NBA"
            teams="Lakers vs Celtics"
            date="Jan 28, 2025"
            gameContext="Q4 0:12 - Game Tied"
            isHot={true}
            voteCount={12847}
            commentCount={47}
          />
          
          <PlayCard 
            id="2"
            title="Roughing the Passer - Chiefs vs Ravens"
            description="Patrick Mahomes is sacked on a crucial third down, but a roughing the passer penalty is called on the defensive end. Critics argue the defender landed with body weight on the quarterback, while supporters say he made a clean football play."
            league="NFL"
            teams="Chiefs vs Ravens"
            date="Jan 26, 2025"
            gameContext="Q4 2:34 - Chiefs Down 3"
            isHot={true}
            voteCount={28391}
            commentCount={156}
          />
        </div>

        {/* Load more */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Controversies
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeedSection;
