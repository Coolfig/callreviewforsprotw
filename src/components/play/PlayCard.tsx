import { useState, useCallback, useEffect } from "react";
import { Calendar, Users, MessageSquare, ChevronRight, Flame, Play, Bookmark, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VideoPlayer from "./VideoPlayer";
import RulePanel, { type RulePanelProps } from "./RulePanel";
import VotingSection from "./VotingSection";
import CommentSection from "./CommentSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  onUnavailable?: () => void;
  defaultExpanded?: boolean;
}

const LEAGUE_COLORS: Record<string, string> = {
  NFL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  NBA: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MLB: "bg-red-500/10 text-red-400 border-red-500/20",
  NHL: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const PlayCard = ({
  id,
  title = "Controversial Blocking Foul - Lakers vs Celtics",
  description = "LeBron James drives to the basket and is called for an offensive foul on Jayson Tatum. The call negated what would have been a game-tying basket with 12 seconds remaining.",
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
  onUnavailable,
  defaultExpanded = false,
}: PlayCardProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hidden, setHidden] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (defaultExpanded) setIsExpanded(true);
  }, [defaultExpanded]);

  useEffect(() => {
    if (!user) return;
    supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("play_id", id).maybeSingle().then(({ data }) => {
      setIsBookmarked(!!data);
    });
  }, [user, id]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("play_id", id);
      setIsBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, play_id: id });
      setIsBookmarked(true);
    }
  };

  const handleVideoError = useCallback(() => {
    setHidden(true);
    onUnavailable?.();
  }, [onUnavailable]);

  if (hidden) return null;

  const leagueColor = LEAGUE_COLORS[league] || "bg-primary/10 text-primary border-primary/20";

  // Compact card (collapsed)
  if (!isExpanded) {
    return (
      <article className="bg-card rounded-2xl border border-border hover:border-border/80 transition-all duration-200 overflow-hidden group">
        <div className="p-6">
          {/* Top row: league + trending + date + menu */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${leagueColor}`}>
              {league}
            </span>
            {isHot && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-orange-500/30 text-orange-400 bg-orange-500/10">
                <Flame className="w-3 h-3" />
                Trending
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">{date}</span>
          </div>

          {/* Title + optional media thumbnail */}
          <div className={`flex gap-4 ${(embedUrl || videoUrl) ? 'items-start' : ''}`}>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                {description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{teams}</span>
                <span>·</span>
                <span>{gameContext}</span>
              </div>
            </div>

            {/* Video thumbnail */}
            {(embedUrl || videoUrl) && (() => {
              const ytMatch = embedUrl?.match(/(?:embed\/|v=)([\w-]+)/);
              const thumbUrl = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg` : null;
              return (
                <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary border border-border flex items-center justify-center">
                  {thumbUrl && <img src={thumbUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                      <Play className="w-4 h-4 text-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom row: stats + CTA */}
          <div className="flex items-center mt-5 pt-4 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">{voteCount.toLocaleString()}</span> votes
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="font-medium">{commentCount}</span> comments
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {user && (
                <button onClick={toggleBookmark} className="text-muted-foreground hover:text-primary transition-colors">
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Open
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Expanded card (full detail)
  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${leagueColor}`}>
            {league}
          </span>
          {isHot && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-orange-500/30 text-orange-400 bg-orange-500/10">
              <Flame className="w-3 h-3" />
              Trending
            </span>
          )}
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {voteCount.toLocaleString()} votes
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs underline underline-offset-2"
            >
              Collapse
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground leading-relaxed mb-4 max-w-3xl">{description}</p>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-foreground">{teams}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{gameContext}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Two-column: video+voting left, rule panel right */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer embedUrl={embedUrl} videoUrl={videoUrl} source={videoSource} onError={handleVideoError} />
            <VotingSection totalVotes={voteCount} />
          </div>
          <div className="lg:col-span-1">
            <RulePanel league={league} playDate={date} {...ruleData} />
          </div>
        </div>

        {/* Comments */}
        <div>
          <CommentSection playId={id} />
        </div>
      </div>
    </article>
  );
};

export default PlayCard;
