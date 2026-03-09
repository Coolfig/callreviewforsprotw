import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MessageSquare, ThumbsUp, ThumbsDown, Clock, BookOpen, ChevronDown, Smile, Bookmark, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import EmojiPicker, { Theme, EmojiClickData, EmojiStyle } from "emoji-picker-react";

interface CommentData {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  content: string;
  likes_count: number;
  dislikes_count: number;
  score: number;
  rule_reference: string | null;
  timestamp_reference: string | null;
  created_at: string;
  liked_by_me: boolean;
  disliked_by_me: boolean;
  bookmarked_by_me: boolean;
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
  const [authAvatarUrl, setAuthAvatarUrl] = useState<string | null>(null);
  const PAGE_SIZE = 10;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Fetch current user's avatar
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("avatar_url").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setAuthAvatarUrl(data.avatar_url);
    });
  }, [user]);

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
    const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", userIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, { username: p.username, avatar_url: p.avatar_url }]) ?? []);

    const commentIds = rawComments?.map(c => c.id) ?? [];
    const { data: replies } = await supabase.from("comments").select("*").in("parent_id", commentIds).order("created_at", { ascending: true });

    const replyUserIds = replies?.map(r => r.user_id).filter(id => !profileMap.has(id)) ?? [];
    if (replyUserIds.length > 0) {
      const { data: replyProfiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", replyUserIds);
      replyProfiles?.forEach(p => profileMap.set(p.user_id, { username: p.username, avatar_url: p.avatar_url }));
    }

    let myLikes = new Set<string>();
    let myDislikes = new Set<string>();
    let myBookmarks = new Set<string>();
    if (user) {
      const allIds = [...commentIds, ...(replies?.map(r => r.id) ?? [])];
      if (allIds.length > 0) {
        const [likesRes, dislikesRes, bookmarksRes] = await Promise.all([
          supabase.from("comment_likes").select("comment_id").eq("user_id", user.id).in("comment_id", allIds),
          supabase.from("comment_dislikes").select("comment_id").eq("user_id", user.id).in("comment_id", allIds),
          supabase.from("comment_bookmarks").select("comment_id").eq("user_id", user.id).in("comment_id", allIds),
        ]);
        myLikes = new Set(likesRes.data?.map(l => l.comment_id) ?? []);
        myDislikes = new Set(dislikesRes.data?.map(l => l.comment_id) ?? []);
        myBookmarks = new Set(bookmarksRes.data?.map(l => l.comment_id) ?? []);
      }
    }

    const mapComment = (c: any): CommentData => {
      const profile = profileMap.get(c.user_id);
      return {
        id: c.id, user_id: c.user_id,
        username: profile?.username || "Unknown",
        avatar_url: profile?.avatar_url || null,
        content: c.content, likes_count: c.likes_count, dislikes_count: c.dislikes_count ?? 0, score: c.score,
        rule_reference: c.rule_reference, timestamp_reference: c.timestamp_reference,
        created_at: c.created_at, liked_by_me: myLikes.has(c.id), disliked_by_me: myDislikes.has(c.id),
        bookmarked_by_me: myBookmarks.has(c.id), replies: [],
      };
    };

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
      const update = (item: CommentData): CommentData => {
        if (item.id !== commentId) return item;
        // If already liked, remove like
        if (item.liked_by_me) return { ...item, liked_by_me: false, likes_count: item.likes_count - 1 };
        // If disliked, remove dislike and add like
        if (item.disliked_by_me) return { ...item, liked_by_me: true, disliked_by_me: false, likes_count: item.likes_count + 1, dislikes_count: item.dislikes_count - 1 };
        return { ...item, liked_by_me: true, likes_count: item.likes_count + 1 };
      };
      return { ...update(c), replies: c.replies.map(update) };
    }));
    const { data: existing } = await supabase.from("comment_likes").select("id").eq("comment_id", commentId).eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("comment_likes").delete().eq("id", existing.id);
    } else {
      // Remove dislike if exists, then add like
      await supabase.from("comment_dislikes").delete().eq("comment_id", commentId).eq("user_id", user.id);
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user.id });
    }
  }, [user, navigate]);

  const handleDislike = useCallback(async (commentId: string) => {
    if (!user) { toast({ title: "Sign up to participate" }); navigate("/auth"); return; }
    setComments(prev => prev.map(c => {
      const update = (item: CommentData): CommentData => {
        if (item.id !== commentId) return item;
        if (item.disliked_by_me) return { ...item, disliked_by_me: false, dislikes_count: item.dislikes_count - 1 };
        if (item.liked_by_me) return { ...item, disliked_by_me: true, liked_by_me: false, dislikes_count: item.dislikes_count + 1, likes_count: item.likes_count - 1 };
        return { ...item, disliked_by_me: true, dislikes_count: item.dislikes_count + 1 };
      };
      return { ...update(c), replies: c.replies.map(update) };
    }));
    const { data: existing } = await supabase.from("comment_dislikes").select("id").eq("comment_id", commentId).eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("comment_dislikes").delete().eq("id", existing.id);
    } else {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id);
      await supabase.from("comment_dislikes").insert({ comment_id: commentId, user_id: user.id });
    }
  }, [user, navigate]);

  const handleBookmark = useCallback(async (commentId: string) => {
    if (!user) { toast({ title: "Sign up to participate" }); navigate("/auth"); return; }
    setComments(prev => prev.map(c => {
      const update = (item: CommentData): CommentData => item.id === commentId ? { ...item, bookmarked_by_me: !item.bookmarked_by_me } : item;
      return { ...update(c), replies: c.replies.map(update) };
    }));
    const { data: existing } = await supabase.from("comment_bookmarks").select("id").eq("comment_id", commentId).eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("comment_bookmarks").delete().eq("id", existing.id);
    } else {
      await supabase.from("comment_bookmarks").insert({ comment_id: commentId, user_id: user.id });
      toast({ title: "Comment bookmarked" });
    }
  }, [user, navigate]);

  const handlePost = async () => {
    if (!user) { toast({ title: "Sign up to participate" }); navigate("/auth"); return; }
    if (!newComment.trim() && !selectedGifUrl) { toast({ title: "Write something first", variant: "destructive" }); return; }
    let finalContent = newComment.trim();
    if (selectedGifUrl) {
      finalContent = finalContent ? `${finalContent} [gif]${selectedGifUrl}[/gif]` : `[gif]${selectedGifUrl}[/gif]`;
    }
    const { error } = await supabase.from("comments").insert({ user_id: user.id, play_id: playId, content: finalContent, rule_reference: ruleRef.trim() || null, timestamp_reference: timeRef.trim() || null });
    if (error) { toast({ title: "Error", description: "Failed to post.", variant: "destructive" }); return; }
    setNewComment(""); setRuleRef(""); setTimeRef(""); setShowRuleInput(false); setShowTimeInput(false); setShowEmojiPicker(false); setSelectedGifUrl(null); setShowGifPicker(false);
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

  // GIF picker state
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);

  const searchGifs = async (query: string) => {
    if (!query.trim()) { setGifResults([]); return; }
    setGifLoading(true);
    try {
      const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&client_key=callreview&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setGifResults(data.results || []);
    } catch (e) {
      console.error("GIF search failed:", e);
    } finally {
      setGifLoading(false);
    }
  };

  const fetchTrendingGifs = async () => {
    setGifLoading(true);
    try {
      const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&client_key=callreview&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setGifResults(data.results || []);
    } catch (e) {
      console.error("GIF fetch failed:", e);
    } finally {
      setGifLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
    } else {
      toast({ title: "Comment deleted" });
      fetchComments(0);
    }
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
            {comment.avatar_url && <AvatarImage src={comment.avatar_url} alt={comment.username} />}
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

            {/* Render text content, detecting embedded GIF URLs */}
            {(() => {
              const gifMatch = comment.content.match(/\[gif\](https?:\/\/[^\s]+)\[\/gif\]/);
              const textContent = comment.content.replace(/\[gif\]https?:\/\/[^\s]+\[\/gif\]/, "").trim();
              return (
                <>
                  {textContent && <p className="text-sm leading-relaxed text-secondary-foreground">{textContent}</p>}
                  {gifMatch && (
                    <img src={gifMatch[1]} alt="GIF" className="mt-2 rounded-lg max-h-48 object-contain" />
                  )}
                </>
              );
            })()}

            <div className="flex items-center gap-4 mt-2.5">
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${comment.liked_by_me ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{comment.likes_count}</span>
              </button>
              <button
                onClick={() => handleDislike(comment.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${comment.disliked_by_me ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{comment.dislikes_count}</span>
              </button>
              <button
                onClick={() => handleBookmark(comment.id)}
                className={`flex items-center text-xs transition-colors ${comment.bookmarked_by_me ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${comment.bookmarked_by_me ? "fill-primary" : ""}`} />
              </button>
              {!isReply && (
                <button
                  onClick={() => { if (!user) { navigate("/auth"); return; } setReplyingTo(replyingTo === comment.id ? null : comment.id); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reply
                </button>
              )}
              {user && comment.user_id === user.id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {comment.replies.length > 0 && (
                <button onClick={() => toggleReplies(comment.id)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedReplies.includes(comment.id) ? "rotate-180" : ""}`} />
                  {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>

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

      <div className="px-5 py-4 border-b border-border">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            {authAvatarUrl && <AvatarImage src={authAvatarUrl} alt={authUsername || "You"} />}
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
                <Button variant={showRuleInput ? "default" : "ghost"} size="sm" className="text-xs gap-1 h-7 px-2.5" onClick={() => setShowRuleInput(v => !v)}>
                  <BookOpen className="w-3.5 h-3.5" />Cite Rule
                </Button>
                <Button variant={showTimeInput ? "default" : "ghost"} size="sm" className="text-xs gap-1 h-7 px-2.5" onClick={() => setShowTimeInput(v => !v)}>
                  <Clock className="w-3.5 h-3.5" />Timestamp
                </Button>
              </div>
              <Button size="sm" className="h-8 px-4" onClick={handlePost}>Post</Button>
            </div>
          </div>
        </div>
      </div>

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
