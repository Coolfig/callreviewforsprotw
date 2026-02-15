import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlayCard from "@/components/play/PlayCard";
import type { RulePanelProps } from "@/components/play/RulePanel";

const leagues = ["All", "NFL", "NBA", "MLB", "NHL"];

// Real sports video feed data - verified sports content only
const sportsVideos = [
  {
    id: "1",
    title: "Dez Bryant Catch Overturned - Cowboys vs Packers",
    description: "Fourth-down reception ruled incomplete after review in the 2014 NFC Divisional Round. Dez Bryant's spectacular contested catch was controversially overturned, sparking the infamous 'catch rule' debate that ultimately led to league-wide rule changes.",
    league: "NFL",
    teams: "Cowboys vs Packers",
    date: "Jan 11, 2015",
    gameContext: "Q4 4:42 - Cowboys Down 5",
    isHot: true,
    voteCount: 45892,
    commentCount: 312,
    videoUrl: "/videos/dez-bryant-catch.mp4",
    videoSource: "native" as const,
    ruleData: {
      season: "2014-15 Season",
      rules: [
        {
          ruleNumber: "Rule 3, Section 2, Article 7",
          ruleTitle: "Player Possession — Going to the Ground",
          ruleText: "A player who goes to the ground in the process of attempting to secure possession of a loose ball… must maintain control of the ball throughout the process of contacting the ground. If he loses control of the ball, and the ball touches the ground before he regains control, there is no possession.",
          highlightedPart: "must maintain control of the ball throughout the process of contacting the ground",
        },
        {
          ruleNumber: "Rule 8 — Catch Definition",
          ruleTitle: "Completing a Catch",
          ruleText: "If the ball touches the ground after the player secures control of it, it is a catch, provided that the player continues to maintain control.",
          highlightedPart: "continues to maintain control",
        },
      ],
      keyInterpretation: "Because Dez Bryant was falling as he reached for the ball, officials ruled he was 'going to the ground in the process of the catch' and therefore had to maintain control through ground contact. When the ball shifted upon hitting the turf, the catch was overturned — despite Bryant appearing to have possession mid-air.",
      rulebookPdfUrl: "/docs/2014-nfl-rulebook.pdf",
    },
  },
  {
    id: "2",
    title: "Out-of-Bounds No-Call - Warriors vs Rockets",
    description: "With the score tied at 132–132, a potential game-deciding step out of bounds went unwhistled late in regulation. The missed call allowed play to continue, leaving fans and analysts debating whether the outcome should have been different.",
    league: "NBA",
    teams: "Warriors vs Rockets",
    date: "2024",
    gameContext: "Q4 - Tied 132-132",
    isHot: true,
    voteCount: 38421,
    commentCount: 245,
    videoUrl: "/videos/warriors-rockets-oob.mp4",
    videoSource: "native" as const,
    ruleData: {
      season: "2024-25 Season",
      rules: [
        {
          ruleNumber: "Rule 8, Section XIII",
          ruleTitle: "Out-of-Bounds — Player & Ball",
          ruleText: "A player is out-of-bounds when any part of his body is touching the floor on or outside the boundary line. The ball is out-of-bounds when it touches a player who is out-of-bounds or any other person, the floor, or any object on, above, or outside of a boundary.",
          highlightedPart: "any part of his body is touching the floor on or outside the boundary line",
        },
      ],
      keyInterpretation: "The question is whether the player's foot was on the line before or during the dribble. If the foot touched the line before releasing the ball, the play should have been whistled dead.",
    },
  },
  {
    id: "3",
    title: "Controversial 9th Inning Out - Cleveland vs Detroit",
    description: "A game-deciding tag/force out ruling at the top of the 9th inning changed the outcome of this divisional matchup. The close play at the bag left both dugouts arguing as replays proved inconclusive.",
    league: "MLB",
    teams: "Cleveland vs Detroit",
    date: "2024",
    gameContext: "Top 9th - Close Game",
    isHot: false,
    voteCount: 29847,
    commentCount: 178,
    videoUrl: "/videos/cleveland-detroit-out.mp4",
    videoSource: "native" as const,
    ruleData: {
      season: "2024 Season",
      rules: [
        {
          ruleNumber: "Rule 7.09(e)",
          ruleTitle: "Tag and Force Outs",
          ruleText: "Any runner is out when he fails to reach the next base before a fielder tags him or the base after he has been forced to advance by reason of the batter becoming a runner.",
          highlightedPart: "before a fielder tags him or the base",
        },
      ],
      keyInterpretation: "The timing of the tag vs. the runner reaching the base is razor-thin. Replay angles were inconclusive, making the umpire's real-time judgment the deciding factor.",
    },
  },
  {
    id: "4",
    title: "The Fail Mary - Packers vs Seahawks",
    description: "The most infamous blown call in Monday Night Football history. A Hail Mary pass was ruled a simultaneous catch touchdown for the Seahawks, despite Packers DB M.D. Jennings appearing to have clear possession. The play accelerated the end of the replacement referee era.",
    league: "NFL",
    teams: "Packers vs Seahawks",
    date: "Sep 24, 2012",
    gameContext: "Q4 0:00 - Packers Up 12-7",
    isHot: true,
    voteCount: 52341,
    commentCount: 387,
    videoUrl: "/videos/fail-mary.mp4",
    videoSource: "native" as const,
    ruleData: {
      season: "2012 Season",
      rules: [
        {
          ruleNumber: "Rule 8, Section 1, Article 3",
          ruleTitle: "Simultaneous Catch",
          ruleText: "If a pass is caught simultaneously by two eligible opponents, and both players retain it, the ball belongs to the passers. It is not a simultaneous catch if a player gains control first and an opponent subsequently gains joint control.",
          highlightedPart: "the ball belongs to the passers",
        },
      ],
      keyInterpretation: "The rule states the ball goes to the offense (passers) on a simultaneous catch — but the debate is whether M.D. Jennings had sole possession first, which would make it an interception, not a simultaneous catch.",
    },
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
    embedUrl: "https://www.youtube.com/embed/vCkGD9_pNUM?start=15&end=50",
    videoSource: "youtube" as const,
  },
  {
    id: "6",
    title: "Immaculate Reception - Steelers vs Raiders",
    description: "The most controversial play in NFL history. Franco Harris catches the ball that appeared to hit a Steelers player. Was it a legal catch? The debate continues 50+ years later.",
    league: "NFL",
    teams: "Steelers vs Raiders",
    date: "Dec 23, 1972",
    gameContext: "Q4 0:22 - Steelers Down 1",
    isHot: false,
    voteCount: 67234,
    commentCount: 489,
    embedUrl: "https://www.youtube.com/embed/dHIXFKrrUhg?start=10&end=45",
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
              embedUrl={'embedUrl' in video ? (video as any).embedUrl : undefined}
              videoUrl={'videoUrl' in video ? (video as any).videoUrl : undefined}
              videoSource={video.videoSource}
              ruleData={'ruleData' in video ? (video as any).ruleData : undefined}
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
