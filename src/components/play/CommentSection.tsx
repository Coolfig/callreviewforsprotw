import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MessageSquare, ThumbsUp, Clock, BookOpen, ChevronDown, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import EmojiPicker, { Theme, EmojiClickData, EmojiStyle } from "emoji-picker-react";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyShowEmoji, setReplyShowEmoji] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
        setReplyShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchComments = useCallback(async (pageNum = 0, append = false) => {
    const { data: rawComments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("play_id", playId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (error) { console.error("Error fetching comments:", error); return; }
    if (!rawComments || rawComments.length < PAGE_SIZE) setHasMore(false);

    const userIds = rawComments?.map(c => c.user_id) ?? [];
    const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", userIds);
    const usernameMap = new Map(profiles?.map(p => [p.user_id, p.username]) ?? []);

    const commentIds = rawComments?.map(c => c.id) ?? [];
    const { data: replies } = await supabase.from("comments").select("*").in("parent_id", commentIds).order("created_at", { ascending: true });

    const replyUserIds = replies?.map(r => r.user_id).filter(id => !usernameMap.has(id)) ?? [];
    if (replyUserIds.length > 0) {
      const { data: replyProfiles } = await supabase.from("profiles").select("user_id, username").in("user_id", replyUserIds);
      replyProfiles?.forEach(p => usernameMap.set(p.user_id, p.username));
    }

    let myLikes = new Set<string>();
    if (user) {
      const allIds = [...commentIds, ...(replies?.map(r => r.id) ?? [])];
      if (allIds.length > 0) {
        const { data: likes } = await supabase.from("comment_likes").select("comment_id").eq("user_id", user.id).in("comment_id", allIds);
        myLikes = new Set(likes?.map(l => l.comment_id) ?? []);
      }
    }

    const mapComment = (c: any): CommentData => ({
      id: c.id, user_id: c.user_id,
      username: usernameMap.get(c.user_id) || "Unknown",
      content: c.content, likes_count: c.likes_count, score: c.score,
      rule_reference: c.rule_reference, timestamp_reference: c.timestamp_reference,
      created_at: c.created_at, liked_by_me: myLikes.has(c.id), replies: [],
    });

    const repliesByParent = new Map<string, CommentData[]>();
    replies?.forEach(r => {
      const mapped = mapComment(r);
      if (!repliesByParent.has(r.parent_id!)) repliesByParent.set(r.parent_id!, []);
      repliesByParent.get(r.parent_id!)!.push(mapped);
    });

    const mapped = rawComments?.map(c => ({ ...mapComment(c), replies: repliesByParent.get(c.id) || [] })) ?? [];
    if (append) setComments(prev => [...prev, ...mapped]);
    else setComments(mapped);
    setLoading(false);
  }, [playId, user]);

  useEffect(() => { fetchComments(0); }, [fetchComments]);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]);
  };

  const handleLike = useCallback(async (commentId: string) => {
    if (!user) { toast({ title: "Sign up to participate" }); navigate("/auth"); return; }
    setComments(prev => prev.map(c => {
      if (c.id === commentId) return { ...c, liked_by_me: !c.liked_by_me, likes_count: c.liked_by_me ? c.likes_count - 1 : c.likes_count + 1 };
      return { ...c, replies: c.replies.map(r => r.id === commentId ? { ...r, liked_by_me: !r.liked_by_me, likes_count: r.liked_by_me ? r.likes_count - 1 : r.likes_count + 1 } : r) };
    }));
    const { data: existing } = await supabase.from("comment_likes").select("id").eq("comment_id", commentId).eq("user_id", user.id).maybeSingle();
    if (existing) await supabase.from("comment_likes").delete().eq("id", existing.id);
    else await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user.id });
  }, [user, navigate]);

  const handlePost = async () => {
    if (!user) { toast({ title: "Sign up to participate" }); navigate("/auth"); return; }
    if (!newComment.trim()) { toast({ title: "Write something first", variant: "destructive" }); return; }
    const { error } = await supabase.from("comments").insert({ user_id: user.id, play_id: playId, content: newComment.trim(), rule_reference: ruleRef.trim() || null, timestamp_reference: timeRef.trim() || null });
    if (error) { toast({ title: "Error", description: "Failed to post.", variant: "destructive" }); return; }
    setNewComment(""); setRuleRef(""); setTimeRef(""); setShowRuleInput(false); setShowTimeInput(false); setShowEmojiPicker(false);
    toast({ title: "Posted!" });
    fetchComments(0);
  };

  const handleReply = async (parentId: string) => {
    if (!user) { navigate("/auth"); return; }
    if (!replyText.trim()) return;
    const { error } = await supabase.from("comments").insert({ user_id: user.id, play_id: playId, parent_id: parentId, content: replyText.trim() });
    if (error) { toast({ title: "Error", variant: "destructive" }); return; }
    setReplyingTo(null); setReplyText("");
    if (!expandedReplies.includes(parentId)) setExpandedReplies(prev => [...prev, parentId]);
    fetchComments(0);
  };

  // Insert emoji at cursor position in main textarea
  const onEmojiClick = (emojiData: EmojiClickData) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const updated = newComment.slice(0, start) + emojiData.emoji + newComment.slice(end);
      setNewComment(updated);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length); }, 0);
    } else {
      setNewComment(prev => prev + emojiData.emoji);
    }
    setShowEmojiPicker(false);
  };

  const onReplyEmojiClick = (emojiData: EmojiClickData) => {
    const inp = replyInputRef.current;
    if (inp) {
      const start = inp.selectionStart ?? replyText.length;
      const end = inp.selectionEnd ?? replyText.length;
      const updated = replyText.slice(0, start) + emojiData.emoji + replyText.slice(end);
      setReplyText(updated);
      setTimeout(() => { inp.focus(); inp.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length); }, 0);
    } else {
      setReplyText(prev => prev + emojiData.emoji);
    }
    setReplyShowEmoji(false);
  };

  const sorted = [...comments].sort((a, b) => {
    if (sortMode === "top") return b.score - a.score;
    if (sortMode === "debated") return b.replies.length - a.replies.length;
    return 0;
  });

  const CommentCard = ({ comment, isReply = false }: { comment: CommentData; isReply?: boolean }) => {
    const initials = comment.username.slice(0, 2).toUpperCase();
    return (
      <div className={`${isReply ? "ml-10 pl-4 border-l-2 border-border" : ""}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-secondary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Link to={`/profile/${comment.username}`} className="font-semibold text-sm hover:underline">{comment.username}</Link>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
            </div>

            {(comment.rule_reference || comment.timestamp_reference) && (
              <div className="flex flex-wrap gap-1.5 mb-2">
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
            )}

            <p className="text-sm leading-relaxed text-secondary-foreground">{comment.content}</p>

            <div className="flex items-center gap-4 mt-2.5">
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${comment.liked_by_me ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{comment.likes_count}</span>
              </button>
              {!isReply && (
                <button
                  onClick={() => { if (!user) { navigate("/auth"); return; } setReplyingTo(replyingTo === comment.id ? null : comment.id); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reply
                </button>
              )}
              {comment.replies.length > 0 && (
                <button onClick={() => toggleReplies(comment.id)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedReplies.includes(comment.id) ? "rotate-180" : ""}`} />
                  {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <div className="flex gap-2 relative">
                  <input
                    ref={replyInputRef}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    onKeyDown={e => e.key === "Enter" && handleReply(comment.id)}
                  />
                  <button
                    type="button"
                    onClick={() => setReplyShowEmoji(v => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <Button size="sm" onClick={() => handleReply(comment.id)}>Reply</Button>
                  {replyShowEmoji && (
                    <div ref={emojiPickerRef} className="absolute top-10 left-0 z-50">
                      <EmojiPicker
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.NATIVE}
                        onEmojiClick={onReplyEmojiClick}
                        width={320}
                        height={400}
                        searchPlaceHolder="Search emojis…"
                        previewConfig={{ showPreview: false }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
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
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Discussion</h3>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{comments.length}</span>
        </div>
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          className="bg-transparent text-xs text-muted-foreground rounded-md px-2 py-1 border border-border cursor-pointer focus:outline-none"
        >
          <option value="top">Top</option>
          <option value="recent">Recent</option>
          <option value="debated">Debated</option>
        </select>
      </div>

      {/* Comment composer */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {authUsername ? authUsername.slice(0, 2).toUpperCase() : "YO"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your take on this call…"
                className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 pr-10"
                rows={3}
              />
              {/* Emoji button inside textarea */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(v => !v)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute top-12 right-0 z-50">
                  <EmojiPicker
                    theme={Theme.DARK}
                    emojiStyle={EmojiStyle.NATIVE}
                    onEmojiClick={onEmojiClick}
                    width={350}
                    height={450}
                    searchPlaceHolder="Search emojis…"
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>

            {showRuleInput && (
              <input value={ruleRef} onChange={e => setRuleRef(e.target.value)} placeholder="e.g. Rule 3, Section 2, Art. 7"
                className="mt-2 w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            )}
            {showTimeInput && (
              <input value={timeRef} onChange={e => setTimeRef(e.target.value)} placeholder="e.g. 0:35"
                className="mt-2 w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            )}

            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <Button
                  variant={showRuleInput ? "default" : "ghost"}
                  size="sm"
                  className="text-xs gap-1 h-7 px-2.5"
                  onClick={() => setShowRuleInput(v => !v)}
                >
                  <BookOpen className="w-3.5 h-3.5" />Cite Rule
                </Button>
                <Button
                  variant={showTimeInput ? "default" : "ghost"}
                  size="sm"
                  className="text-xs gap-1 h-7 px-2.5"
                  onClick={() => setShowTimeInput(v => !v)}
                >
                  <Clock className="w-3.5 h-3.5" />Timestamp
                </Button>
              </div>
              <Button size="sm" className="h-8 px-4" onClick={handlePost}>Post</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="px-5 py-4 space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading discussion…</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to break it down!</p>
        ) : (
          sorted.map(comment => <CommentCard key={comment.id} comment={comment} />)
        )}
        {hasMore && !loading && sorted.length > 0 && (
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs" onClick={() => { const next = page + 1; setPage(next); fetchComments(next, true); }}>
            Load more
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
