import { useState, useCallback } from "react";
import { MessageSquare, ThumbsUp, Clock, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  user: string;
  avatar: string;
  timestamp: string;
  content: string;
  likes: number;
  liked?: boolean;
  ruleReference?: string;
  timestampReference?: string;
  replies?: Comment[];
}

const initialComments: Comment[] = [
  {
    id: "1",
    user: "RefExpert22",
    avatar: "RE",
    timestamp: "2 hours ago",
    content: "Looking at frame 847, you can clearly see the defender's left foot is still sliding when contact initiates. According to Rule 3, Section 2, Article 7, this fails the 'maintain control throughout the process of contacting the ground' requirement.",
    likes: 234,
    ruleReference: "Rule 3, Section 2, Art. 7",
    timestampReference: "0:35",
    replies: [
      {
        id: "1a",
        user: "HoopsAnalyst",
        avatar: "HA",
        timestamp: "1 hour ago",
        content: "I see your point, but I'd argue the slide was complete by the time the shoulder contact occurred. The initial hip contact is what's being called.",
        likes: 89,
        timestampReference: "0:34",
      }
    ]
  },
  {
    id: "2",
    user: "GameTapeBreakdown",
    avatar: "GT",
    timestamp: "4 hours ago",
    content: "Great analysis on this play. The key question is whether we consider the moment of 'established position' to be when the feet stop moving, or when the torso is squared. The rulebook is ambiguous here.",
    likes: 156,
    ruleReference: "Rule 8 — Catch Definition",
  }
];

const moreComments: Comment[] = [
  {
    id: "3",
    user: "OfficialRulings",
    avatar: "OR",
    timestamp: "5 hours ago",
    content: "Worth noting that the league later acknowledged this rule was too ambiguous and revised the catch definition in the 2018 rulebook. This play was a catalyst for that change.",
    likes: 312,
    ruleReference: "Rule 8 (2018 revision)",
  },
  {
    id: "4",
    user: "DallasFanatic",
    avatar: "DF",
    timestamp: "6 hours ago",
    content: "He took three steps and reached for the goal line. In any common sense definition, that's a catch. The rule was broken, not the play.",
    likes: 478,
  },
];

type SortMode = "top" | "recent" | "debated";

const CommentSection = () => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [ruleRef, setRuleRef] = useState("");
  const [timeRef, setTimeRef] = useState("");
  const [showRuleInput, setShowRuleInput] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleLike = useCallback((commentId: string, isReply?: boolean, parentId?: string) => {
    setComments(prev => prev.map(c => {
      if (isReply && parentId && c.id === parentId && c.replies) {
        return {
          ...c,
          replies: c.replies.map(r =>
            r.id === commentId
              ? { ...r, likes: r.liked ? r.likes - 1 : r.likes + 1, liked: !r.liked }
              : r
          )
        };
      }
      if (c.id === commentId) {
        return { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked };
      }
      return c;
    }));
  }, []);

  const handlePost = () => {
    if (!newComment.trim()) {
      toast({ title: "Empty comment", description: "Write something before posting.", variant: "destructive" });
      return;
    }
    const comment: Comment = {
      id: Date.now().toString(),
      user: "You",
      avatar: "YO",
      timestamp: "Just now",
      content: newComment.trim(),
      likes: 0,
      ruleReference: ruleRef.trim() || undefined,
      timestampReference: timeRef.trim() || undefined,
    };
    setComments(prev => [comment, ...prev]);
    setNewComment("");
    setRuleRef("");
    setTimeRef("");
    setShowRuleInput(false);
    setShowTimeInput(false);
    toast({ title: "Posted!", description: "Your analysis has been added." });
  };

  const handleReply = (parentId: string) => {
    if (!replyText.trim()) return;
    const reply: Comment = {
      id: Date.now().toString(),
      user: "You",
      avatar: "YO",
      timestamp: "Just now",
      content: replyText.trim(),
      likes: 0,
    };
    setComments(prev => prev.map(c =>
      c.id === parentId
        ? { ...c, replies: [...(c.replies || []), reply] }
        : c
    ));
    setReplyingTo(null);
    setReplyText("");
    if (!expandedReplies.includes(parentId)) {
      setExpandedReplies(prev => [...prev, parentId]);
    }
  };

  const handleLoadMore = () => {
    setComments(prev => [...prev, ...moreComments]);
    setHasMore(false);
  };

  const sorted = [...comments].sort((a, b) => {
    if (sortMode === "top") return b.likes - a.likes;
    if (sortMode === "debated") return (b.replies?.length || 0) - (a.replies?.length || 0);
    return 0; // recent = insertion order
  });

  const CommentCard = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <div className={`${isReply ? 'ml-12 mt-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-secondary text-xs font-medium">
            {comment.avatar}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user}</span>
            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {comment.ruleReference && (
              <Badge variant="outline" className="text-xs gap-1 bg-accent/10 border-accent/30 text-accent">
                <BookOpen className="w-3 h-3" />
                {comment.ruleReference}
              </Badge>
            )}
            {comment.timestampReference && (
              <Badge variant="outline" className="text-xs gap-1 bg-primary/10 border-primary/30 text-primary">
                <Clock className="w-3 h-3" />
                {comment.timestampReference}
              </Badge>
            )}
          </div>

          <p className="text-sm text-secondary-foreground leading-relaxed">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => handleLike(comment.id, isReply, parentId)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${comment.liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{comment.likes}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reply
              </button>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedReplies.includes(comment.id) ? 'rotate-180' : ''}`} />
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={e => e.key === 'Enter' && handleReply(comment.id)}
              />
              <Button size="sm" onClick={() => handleReply(comment.id)}>Reply</Button>
            </div>
          )}
        </div>
      </div>

      {comment.replies && expandedReplies.includes(comment.id) && (
        <div className="space-y-4 mt-4">
          {comment.replies.map(reply => (
            <CommentCard key={reply.id} comment={reply} isReply parentId={comment.id} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Evidence-Based Discussion</h3>
          <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
        </div>
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          className="bg-secondary text-sm rounded-md px-2 py-1 border border-border cursor-pointer"
        >
          <option value="top">Top Evidence</option>
          <option value="recent">Most Recent</option>
          <option value="debated">Most Debated</option>
        </select>
      </div>

      {/* Add comment */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
              YO
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add evidence-based analysis… Reference a rule or timestamp to strengthen your argument."
              className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
            />

            {/* Inline inputs for rule / timestamp */}
            {showRuleInput && (
              <input
                value={ruleRef}
                onChange={e => setRuleRef(e.target.value)}
                placeholder="e.g. Rule 3, Section 2, Art. 7"
                className="mt-2 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
            {showTimeInput && (
              <input
                value={timeRef}
                onChange={e => setTimeRef(e.target.value)}
                placeholder="e.g. 0:35"
                className="mt-2 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}

            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <Button
                  variant={showRuleInput ? "default" : "outline"}
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setShowRuleInput(v => !v)}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Cite Rule
                </Button>
                <Button
                  variant={showTimeInput ? "default" : "outline"}
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setShowTimeInput(v => !v)}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Add Timestamp
                </Button>
              </div>
              <Button size="sm" onClick={handlePost}>Post Analysis</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="p-4 space-y-6">
        {sorted.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}

        {hasMore && (
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLoadMore}>
            Load more comments
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
