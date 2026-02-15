import { useState } from "react";
import { Calendar, Users, ChevronRight, Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VideoPlayer from "./VideoPlayer";
import RulePanel, { type RulePanelProps } from "./RulePanel";
import VotingSection from "./VotingSection";
import CommentSection from "./CommentSection";

type VideoSource = "native" | "youtube" | "twitter" | "tiktok" | "instagram";

interface PlayCardProps {
  id: string;
  title: string;
  description: string;
  league: string;
  teams: string;
  date: string;
  gameContext: string;
  isHot?: boolean;
  voteCount?: number;
  commentCount?: number;
  embedUrl?: string;
  videoUrl?: string;
  videoSource?: VideoSource;
  ruleData?: Omit<RulePanelProps, 'league'>;
}

const PlayCard = ({
  id,
  title = "Controversial Blocking Foul - Lakers vs Celtics",
  description = "LeBron James drives to the basket and is called for an offensive foul on Jayson Tatum. The call negated what would have been a game-tying basket with 12 seconds remaining. Replays show Tatum may have still been moving when contact occurred.",
  league = "NBA",
  teams = "Lakers vs Celtics",
  date = "Jan 28, 2025",
  gameContext = "Q4 0:12 - Game Tied",
  isHot = true,
  voteCount = 12847,
  commentCount = 47,
  embedUrl,
  videoUrl,
  videoSource = "native",
  ruleData,
}: PlayCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            {league}
          </Badge>
          {isHot && (
            <Badge variant="outline" className="border-vote-missed/50 text-vote-missed gap-1">
              <Flame className="w-3 h-3" />
              Trending
            </Badge>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {(voteCount / 1000).toFixed(1)}K votes
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold mb-3">{title}</h2>
        
        <p className="text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-foreground font-medium">{teams}</span>
          <span className="text-muted-foreground">•</span>
          <span className="flex items-center gap-1.5 text-accent font-medium">
            <Clock className="w-4 h-4" />
            {gameContext}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video + Voting */}
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer embedUrl={embedUrl} videoUrl={videoUrl} source={videoSource} />
            <VotingSection totalVotes={voteCount} />
          </div>

          {/* Rule Panel */}
          <div className="lg:col-span-1">
            <RulePanel league={league} {...ruleData} />
          </div>
        </div>

        {/* Comments */}
        <div className="mt-6">
          <CommentSection playId={id} />
        </div>
      </div>
    </article>
  );
};

export default PlayCard;
