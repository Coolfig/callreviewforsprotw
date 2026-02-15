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
    embedUrl: "https://www.youtube.com/embed/FqJsp5qW8CE",
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
  {
    id: "7",
    title: "Saints No-Call Pass Interference - Rams vs Saints",
    description: "One of the most catastrophic no-calls in NFL history. A blatant pass interference and helmet-to-helmet hit went ignored in the 2018 NFC Championship, costing the Saints a Super Bowl trip and prompting a league-wide rule change.",
    league: "NFL",
    teams: "Rams vs Saints",
    date: "Jan 20, 2019",
    gameContext: "Q4 1:49 - Game Tied",
    isHot: true,
    voteCount: 61234,
    commentCount: 412,
    embedUrl: "https://www.youtube.com/embed/xjvZHMod_3E",
    videoSource: "youtube" as const,
  },
  {
    id: "8",
    title: "The Tuck Rule Game - Patriots vs Raiders",
    description: "Controversial ruling on Tom Brady's apparent fumble was overturned to an incomplete pass via the 'Tuck Rule.' The call preserved the Patriots' playoff run and is widely seen as pivotal in launching their dynasty.",
    league: "NFL",
    teams: "Patriots vs Raiders",
    date: "Jan 19, 2002",
    gameContext: "Q4 1:50 - Raiders Up 13-10",
    isHot: true,
    voteCount: 58912,
    commentCount: 367,
    embedUrl: "https://www.youtube.com/embed/uDLh4qJ1SpM",
    videoSource: "youtube" as const,
  },
  {
    id: "9",
    title: "Fail Mary - Replacement Refs Edition",
    description: "Golden Tate's controversial Hail Mary touchdown catch featured a blatant push-off that went uncalled by replacement referees. The play accelerated the end of the referee lockout.",
    league: "NFL",
    teams: "Seahawks vs Packers",
    date: "Sep 24, 2012",
    gameContext: "Q4 0:00 - Packers Up 12-7",
    isHot: false,
    voteCount: 49321,
    commentCount: 298,
    embedUrl: "https://www.youtube.com/embed/iZWUm7JxoiU",
    videoSource: "youtube" as const,
  },
  {
    id: "10",
    title: "2002 WCF Game 6 - Kings vs Lakers Officiating Scandal",
    description: "Widely accused of biased officiating favoring the Lakers, Game 6 of the 2002 Western Conference Finals remains one of the most controversial games in NBA history, spawning conspiracy theories that persist today.",
    league: "NBA",
    teams: "Kings vs Lakers",
    date: "May 31, 2002",
    gameContext: "Series Tied 2-2 → Lakers Win G6",
    isHot: true,
    voteCount: 55678,
    commentCount: 445,
    embedUrl: "https://www.youtube.com/embed/f896aWnoseg",
    videoSource: "youtube" as const,
  },
  {
    id: "11",
    title: "Tim Donaghy Era - Referee Betting Scandal",
    description: "NBA referee Tim Donaghy admitted to betting on games he officiated, casting a shadow over numerous playoff outcomes including the infamous 2002 WCF. The scandal rocked professional basketball to its core.",
    league: "NBA",
    teams: "Multiple Teams",
    date: "2007",
    gameContext: "League-wide Scandal",
    isHot: false,
    voteCount: 42156,
    commentCount: 312,
    embedUrl: "https://www.youtube.com/embed/X2zonUdXJkQ",
    videoSource: "youtube" as const,
  },
  {
    id: "12",
    title: "Aaron Gordon Foul on Jimmy Butler - Missed Challenge",
    description: "A brutal missed challenge on a leg-kick foul call against Aaron Gordon during the 2019 playoffs. The play highlighted flaws in the NBA's challenge system and officiating review process.",
    league: "NBA",
    teams: "Magic vs Raptors",
    date: "2019",
    gameContext: "Playoffs - Close Game",
    isHot: false,
    voteCount: 18934,
    commentCount: 145,
    embedUrl: "https://www.youtube.com/embed/nUOLVYwwSiQ",
    videoSource: "youtube" as const,
  },
  {
    id: "13",
    title: "Armando Galarraga's Blown Perfect Game",
    description: "One of the most heartbreaking umpire errors in modern baseball. Jim Joyce's incorrect safe call on the 27th out robbed Galarraga of a perfect game, leading to widespread calls for expanded instant replay.",
    league: "MLB",
    teams: "Tigers vs Indians",
    date: "Jun 2, 2010",
    gameContext: "9th Inning - 26 Consecutive Outs",
    isHot: true,
    voteCount: 47823,
    commentCount: 356,
    embedUrl: "https://www.youtube.com/embed/gKaMaNctMWY",
    videoSource: "youtube" as const,
  },
  {
    id: "14",
    title: "Angel Hernandez Worst Calls Compilation",
    description: "A collection of the most egregious blown calls by MLB umpire Angel Hernandez, including missed strikes, incorrect safe/out calls, and questionable ejections that fueled the push for automated strike zones.",
    league: "MLB",
    teams: "Various Teams",
    date: "2000-2023",
    gameContext: "Multiple Games",
    isHot: false,
    voteCount: 38456,
    commentCount: 278,
    embedUrl: "https://www.youtube.com/embed/2c1qKb2WX4A",
    videoSource: "youtube" as const,
  },
  {
    id: "15",
    title: "NHL No-Goal Controversies - Crease & Offside Calls",
    description: "Multiple debated no-goals and incorrectly allowed goals from the crease violation and offside challenge era. These calls reshaped how the NHL approaches video review.",
    league: "NHL",
    teams: "Various Teams",
    date: "1999-2020",
    gameContext: "Multiple Playoff Games",
    isHot: false,
    voteCount: 19876,
    commentCount: 167,
    embedUrl: "https://www.youtube.com/embed/5h75Rw9cScY",
    videoSource: "youtube" as const,
  },
  {
    id: "16",
    title: "NHL Controversial Calls - High Sticks & Offside Misses",
    description: "Compilation of post-2000 high-stick no-calls and offside misses that changed game outcomes, echoing historic controversies like Gretzky's 1993 high-stick.",
    league: "NHL",
    teams: "Various Teams",
    date: "2000-2024",
    gameContext: "Multiple Games",
    isHot: false,
    voteCount: 15432,
    commentCount: 123,
    embedUrl: "https://www.youtube.com/embed/pBRvA3Aeb5A",
    videoSource: "youtube" as const,
  },
  {
    id: "17",
    title: "Top Controversial Calls Across All Sports",
    description: "A broad compilation hitting the NFL Tuck Rule, NBA 2002 WCF, NHL Hull crease goal, and MLB blown calls — the most debated officiating moments post-2000.",
    league: "NFL",
    teams: "Cross-League",
    date: "2000-2024",
    gameContext: "Multiple Historic Moments",
    isHot: true,
    voteCount: 72345,
    commentCount: 534,
    embedUrl: "https://www.youtube.com/embed/Ijgn6Sd0gT4",
    videoSource: "youtube" as const,
  },
  {
    id: "18",
    title: "Most Controversial Calls in Sports History",
    description: "Features NFL no-calls, NBA phantom fouls, NHL crease violations, and MLB umpire blunders — the definitive collection of calls that changed the course of sports history.",
    league: "NBA",
    teams: "Cross-League",
    date: "1999-2024",
    gameContext: "Historic Compilation",
    isHot: false,
    voteCount: 63891,
    commentCount: 478,
    embedUrl: "https://www.youtube.com/embed/c1tbXSysOPw",
    videoSource: "youtube" as const,
  },
  {
    id: "19",
    title: "Calls That Changed History - NFL/NBA/MLB/NHL",
    description: "The Tuck Rule, Fail Mary, 2002 NBA scandal, Galarraga's perfect game — every call that altered championships, careers, and the rules themselves.",
    league: "NFL",
    teams: "Cross-League",
    date: "2000-2024",
    gameContext: "Championship-Altering Moments",
    isHot: true,
    voteCount: 58234,
    commentCount: 401,
    embedUrl: "https://www.youtube.com/embed/Z4XZnQK_LJQ",
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
