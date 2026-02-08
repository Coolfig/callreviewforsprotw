import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlayCard from "@/components/play/PlayCard";

const leagues = ["All", "NFL", "NBA", "MLB", "NHL"];

// Real sports video feed data - verified sports content only
const sportsVideos = [
  {
    id: "1",
    title: "Dez Bryant Catch Overturned - Cowboys vs Packers",
    description: "One of the most controversial calls in NFL playoff history. Dez Bryant's incredible catch was overturned on review, changing the outcome of the 2014 NFC Divisional game. The 'catch rule' debate that followed led to rule changes.",
    league: "NFL",
    teams: "Cowboys vs Packers",
    date: "Jan 11, 2015",
    gameContext: "Q4 4:42 - Cowboys Down 5",
    isHot: true,
    voteCount: 45892,
    commentCount: 312,
    embedUrl: "https://www.youtube.com/watch?v=1khK6is-Bfs",
    videoSource: "youtube" as const,
  },
  {
    id: "2",
    title: "LeBron James Blocking Foul vs Charge Debate",
    description: "LeBron's chase-down block on Andre Iguodala in the 2016 Finals sparked massive debate. Was he in the restricted area? Did he establish position? One of the most analyzed plays in NBA history.",
    league: "NBA",
    teams: "Cavaliers vs Warriors",
    date: "Jun 19, 2016",
    gameContext: "Q4 1:50 - Game Tied",
    isHot: true,
    voteCount: 38421,
    commentCount: 245,
    embedUrl: "https://www.youtube.com/watch?v=wgVOgGLtPtc",
    videoSource: "youtube" as const,
  },
  {
    id: "3",
    title: "Immaculate Reception - Steelers vs Raiders",
    description: "The most controversial play in NFL history. Franco Harris catches the ball that appeared to hit a Steelers player. Was it a legal catch? The debate continues 50+ years later.",
    league: "NFL",
    teams: "Steelers vs Raiders",
    date: "Dec 23, 1972",
    gameContext: "Q4 0:22 - Steelers Down 1",
    isHot: false,
    voteCount: 67234,
    commentCount: 489,
    embedUrl: "https://www.youtube.com/watch?v=GMuUBZ_DAeM",
    videoSource: "youtube" as const,
  },
  {
    id: "4",
    title: "Steve Bartman Incident - Cubs vs Marlins",
    description: "The infamous fan interference play in Game 6 of the 2003 NLCS. Bartman reached for a foul ball, preventing Moises Alou from making the catch. Cubs collapsed afterward, fueling decades of debate.",
    league: "MLB",
    teams: "Cubs vs Marlins",
    date: "Oct 14, 2003",
    gameContext: "8th Inning - Cubs Up 3-0",
    isHot: false,
    voteCount: 29847,
    commentCount: 178,
    embedUrl: "https://www.youtube.com/watch?v=vq8G81oOHhY",
    videoSource: "youtube" as const,
  },
  {
    id: "5",
    title: "Brett Hull's Crease Goal - Stars vs Sabres",
    description: "The Stanley Cup-winning goal in 1999 remains controversial. Brett Hull's skate was in the crease when he scored in triple OT. The NHL's crease rule interpretation sparked outrage in Buffalo.",
    league: "NHL",
    teams: "Stars vs Sabres",
    date: "Jun 20, 1999",
    gameContext: "3OT - Game 6 Stanley Cup Finals",
    isHot: false,
    voteCount: 21456,
    commentCount: 134,
    embedUrl: "https://www.youtube.com/watch?v=vCkGD9_pNUM",
    videoSource: "youtube" as const,
  },
  {
    id: "6",
    title: "Tuck Rule Game - Patriots vs Raiders",
    description: "Tom Brady's apparent fumble was ruled an incomplete pass due to the 'tuck rule.' This 2001 AFC Divisional playoff call changed the trajectory of the Patriots dynasty.",
    league: "NFL",
    teams: "Patriots vs Raiders",
    date: "Jan 19, 2002",
    gameContext: "Q4 1:50 - Patriots Down 3",
    isHot: true,
    voteCount: 52341,
    commentCount: 387,
    embedUrl: "https://www.youtube.com/watch?v=Kl_VvJTyMwo",
    videoSource: "youtube" as const,
  },
];

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
          {sportsVideos.map((video) => (
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
              videoSource={video.videoSource}
            />
          ))}
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
