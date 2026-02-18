import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MessageSquare, ThumbsUp, Clock, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface CommentData {
  id: string;
  user_id: string;
  username: string;
  content: string;
  likes_count: number;
  score: number;
  rule_reference: string | null;
  timestamp_reference: string | null;
  created_at: string;
  liked_by_me: boolean;
  replies: CommentData[];
}

type SortMode = "top" | "recent" | "debated";

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const CommentSection = ({ playId }: { playId: string }) => {
  const { user, username: authUsername } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [ruleRef, setRuleRef] = useState("");
  const [timeRef, setTimeRef] = useState("");
  const [showRuleInput, setShowRuleInput] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const fetchComments = useCallback(async (pageNum = 0, append = false) => {
    const { data: rawComments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("play_id", playId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    if (!rawComments || rawComments.length < PAGE_SIZE) {
      setHasMore(false);
    }

    // Fetch usernames for all comment authors
    const userIds = rawComments?.map(c => c.user_id) ?? [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", userIds);
    const usernameMap = new Map(profiles?.map(p => [p.user_id, p.username]) ?? []);

    // Fetch replies for these comments
    const commentIds = rawComments?.map(c => c.id) ?? [];
    const { data: replies } = await supabase
      .from("comments")
      .select("*")
      .in("parent_id", commentIds)
      .order("created_at", { ascending: true });

    // Fetch reply author usernames
    const replyUserIds = replies?.map(r => r.user_id).filter(id => !usernameMap.has(id)) ?? [];
    if (replyUserIds.length > 0) {
      const { data: replyProfiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", replyUserIds);
      replyProfiles?.forEach(p => usernameMap.set(p.user_id, p.username));
    }

    // Fetch my likes
    let myLikes = new Set<string>();
    if (user) {
      const allIds = [...commentIds, ...(replies?.map(r => r.id) ?? [])];
      if (allIds.length > 0) {
        const { data: likes } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", allIds);
        myLikes = new Set(likes?.map(l => l.comment_id) ?? []);
      }
    }

    const mapComment = (c: any): CommentData => ({
      id: c.id,
      user_id: c.user_id,
      username: usernameMap.get(c.user_id) || "Unknown",
      content: c.content,
      likes_count: c.likes_count,
      score: c.score,
      rule_reference: c.rule_reference,
      timestamp_reference: c.timestamp_reference,
      created_at: c.created_at,
      liked_by_me: myLikes.has(c.id),
      replies: [],
    });

    const repliesByParent = new Map<string, CommentData[]>();
    replies?.forEach(r => {
      const mapped = mapComment(r);
      if (!repliesByParent.has(r.parent_id!)) repliesByParent.set(r.parent_id!, []);
      repliesByParent.get(r.parent_id!)!.push(mapped);
    });

    const mapped = rawComments?.map(c => ({
      ...mapComment(c),
      replies: repliesByParent.get(c.id) || [],
    })) ?? [];

    if (append) {
      setComments(prev => [...prev, ...mapped]);
    } else {
      setComments(mapped);
    }
    setLoading(false);
  }, [playId, user]);

  useEffect(() => {
    fetchComments(0);
  }, [fetchComments]);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev =>
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  const handleLike = useCallback(async (commentId: string) => {
    if (!user) {
      toast({ title: "Sign up to participate", description: "You need an account to like comments." });
      navigate("/auth");
      return;
    }

    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, liked_by_me: !c.liked_by_me, likes_count: c.liked_by_me ? c.likes_count - 1 : c.likes_count + 1 };
      }
      return {
        ...c,
        replies: c.replies.map(r =>
          r.id === commentId
            ? { ...r, liked_by_me: !r.liked_by_me, likes_count: r.liked_by_me ? r.likes_count - 1 : r.likes_count + 1 }
            : r
        ),
      };
    }));

    // Check if already liked
    const { data: existing } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("comment_likes").delete().eq("id", existing.id);
    } else {
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user.id });
    }
  }, [user, navigate]);

  const handlePost = async () => {
    if (!user) {
      toast({ title: "Sign up to participate", description: "You need an account to comment." });
      navigate("/auth");
      return;
    }
    if (!newComment.trim()) {
      toast({ title: "Empty comment", description: "Write something before posting.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("comments").insert({
      user_id: user.id,
      play_id: playId,
      content: newComment.trim(),
      rule_reference: ruleRef.trim() || null,
      timestamp_reference: timeRef.trim() || null,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
      return;
    }

    setNewComment("");
    setRuleRef("");
    setTimeRef("");
    setShowRuleInput(false);
    setShowTimeInput(false);
    toast({ title: "Posted!", description: "Your analysis has been added." });
    fetchComments(0);
  };

  const handleReply = async (parentId: string) => {
    if (!user) { navigate("/auth"); return; }
    if (!replyText.trim()) return;

    const { error } = await supabase.from("comments").insert({
      user_id: user.id,
      play_id: playId,
      parent_id: parentId,
      content: replyText.trim(),
    });

    if (error) {
      toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
      return;
    }

    setReplyingTo(null);
    setReplyText("");
    if (!expandedReplies.includes(parentId)) {
      setExpandedReplies(prev => [...prev, parentId]);
    }
    fetchComments(0);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  const sorted = [...comments].sort((a, b) => {
    if (sortMode === "top") return b.score - a.score;
    if (sortMode === "debated") return b.replies.length - a.replies.length;
    return 0; // recent = default DB order
  });

  const CommentCard = ({ comment, isReply = false }: { comment: CommentData; isReply?: boolean }) => {
    const initials = comment.username.slice(0, 2).toUpperCase();
    return (
      <div className={`${isReply ? 'ml-12 mt-4' : ''}`}>
        <div className="flex gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-secondary text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/profile/${comment.username}`} className="font-medium text-sm hover:underline">{comment.username}</Link>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {comment.rule_reference && (
                <Badge variant="outline" className="text-xs gap-1 bg-accent/10 border-accent/30 text-accent">
                  <BookOpen className="w-3 h-3" />{comment.rule_reference}
                </Badge>
              )}
              {comment.timestamp_reference && (
                <Badge variant="outline" className="text-xs gap-1 bg-primary/10 border-primary/30 text-primary">
                  <Clock className="w-3 h-3" />{comment.timestamp_reference}
                </Badge>
              )}
            </div>
            <p className="text-sm text-secondary-foreground leading-relaxed">{comment.content}</p>
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${comment.liked_by_me ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /><span>{comment.likes_count}</span>
              </button>
              {!isReply && (
                <button
                  onClick={() => {
                    if (!user) { toast({ title: "Sign up to participate" }); navigate("/auth"); return; }
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >Reply</button>
              )}
              {comment.replies.length > 0 && (
                <button onClick={() => toggleReplies(comment.id)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedReplies.includes(comment.id) ? 'rotate-180' : ''}`} />
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
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
        {comment.replies.length > 0 && expandedReplies.includes(comment.id) && (
          <div className="space-y-4 mt-4">
            {comment.replies.map(reply => (
              <CommentCard key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
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
              {authUsername ? authUsername.slice(0, 2).toUpperCase() : "YO"}
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
            {showRuleInput && (
              <input value={ruleRef} onChange={e => setRuleRef(e.target.value)} placeholder="e.g. Rule 3, Section 2, Art. 7"
                className="mt-2 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            )}
            {showTimeInput && (
              <input value={timeRef} onChange={e => setTimeRef(e.target.value)} placeholder="e.g. 0:35"
                className="mt-2 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            )}
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <Button variant={showRuleInput ? "default" : "outline"} size="sm" className="text-xs gap-1.5" onClick={() => setShowRuleInput(v => !v)}>
                  <BookOpen className="w-3.5 h-3.5" />Cite Rule
                </Button>
                <Button variant={showTimeInput ? "default" : "outline"} size="sm" className="text-xs gap-1.5" onClick={() => setShowTimeInput(v => !v)}>
                  <Clock className="w-3.5 h-3.5" />Add Timestamp
                </Button>
              </div>
              <Button size="sm" onClick={handlePost}>Post Analysis</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="p-4 space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading discussion…</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to analyze this play!</p>
        ) : (
          sorted.map(comment => <CommentCard key={comment.id} comment={comment} />)
        )}
        {hasMore && !loading && sorted.length > 0 && (
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLoadMore}>
            Load more comments
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
