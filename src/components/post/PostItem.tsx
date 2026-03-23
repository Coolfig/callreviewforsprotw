import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Trash2, Share, Send, Search, X, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ShareDialog from "./ShareDialog";

interface PostItemProps {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  image_url?: string | null;
  video_url?: string | null;
  onDelete?: () => void;
  onLikeToggle?: () => void;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
}

const renderContent = (text: string) => {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const uname = part.slice(1);
      return (
        <Link key={i} to={`/profile/${uname}`} className="text-primary hover:underline font-medium">
          {part}
        </Link>
      );
    }
    return part;
  });
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (url.includes("youtube.com/embed/")) return url;
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (url.includes("youtube.com/watch")) {
    videoId = new URLSearchParams(url.split("?")[1]).get("v") || "";
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const PostItem = ({
  id, content, created_at, user_id, username, avatar_url,
  likes_count, replies_count, is_liked, image_url, video_url,
  onDelete, onLikeToggle,
}: PostItemProps) => {
  const { user, username: myUsername } = useAuth();
  const [liked, setLiked] = useState(is_liked);
  const [likesNum, setLikesNum] = useState(likes_count);
  const [shareOpen, setShareOpen] = useState(false);

  // Reply state
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [repliesCount, setRepliesCount] = useState(replies_count);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // GIF state for replies
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const toggleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", id).eq("user_id", user.id);
      setLiked(false);
      setLikesNum((c) => c - 1);
    } else {
      await supabase.from("post_likes").insert({ post_id: id, user_id: user.id });
      setLiked(true);
      setLikesNum((c) => c + 1);
    }
    onLikeToggle?.();
  };

  const handleDelete = async () => {
    await supabase.from("posts").delete().eq("id", id);
    onDelete?.();
  };

  const fetchReplies = async () => {
    setLoadingReplies(true);
    const { data: repliesData } = await supabase
      .from("post_replies")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (repliesData && repliesData.length > 0) {
      const userIds = [...new Set(repliesData.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setReplies(repliesData.map(r => ({
        id: r.id,
        content: r.content,
        created_at: r.created_at,
        user_id: r.user_id,
        username: profileMap.get(r.user_id)?.username || "Unknown",
        avatar_url: profileMap.get(r.user_id)?.avatar_url || null,
      })));
    } else {
      setReplies([]);
    }
    setLoadingReplies(false);
  };

  const toggleReplies = () => {
    if (!showReplies) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) { setGifResults([]); return; }
    setGifLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gif-search', {
        body: { query, type: 'search' },
      });
      if (error) throw error;
      setGifResults(data?.results || []);
    } catch { /* ignore */ } finally { setGifLoading(false); }
  };

  const fetchTrendingGifs = async () => {
    setGifLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gif-search', {
        body: { type: 'trending' },
      });
      if (error) throw error;
      setGifResults(data?.results || []);
    } catch { /* ignore */ } finally { setGifLoading(false); }
  };

  const handleReply = async () => {
    if (!user || (!replyText.trim() && !selectedGifUrl)) return;
    setReplying(true);

    let finalContent = replyText.trim();
    if (selectedGifUrl) {
      finalContent = finalContent ? `${finalContent}\n[gif]${selectedGifUrl}[/gif]` : `[gif]${selectedGifUrl}[/gif]`;
    }

    await supabase.from("post_replies").insert({
      post_id: id,
      user_id: user.id,
      content: finalContent,
    });

    setReplyText("");
    setSelectedGifUrl(null);
    setShowGifPicker(false);
    setRepliesCount(c => c + 1);
    setReplying(false);
    fetchReplies();
  };

  const handleDeleteReply = async (replyId: string) => {
    await supabase.from("post_replies").delete().eq("id", replyId).eq("user_id", user?.id || "");
    setRepliesCount(c => Math.max(0, c - 1));
    setReplies(prev => prev.filter(r => r.id !== replyId));
  };

  const renderReplyContent = (text: string) => {
    const gifRegex = /\[gif\](.*?)\[\/gif\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    while ((match = gifRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{renderContent(text.slice(lastIndex, match.index))}</span>);
      }
      parts.push(
        <img key={match.index} src={match[1]} alt="GIF" className="rounded-lg max-h-40 mt-1" />
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{renderContent(text.slice(lastIndex))}</span>);
    }
    return parts;
  };

  const youtubeEmbed = video_url ? getYouTubeEmbedUrl(video_url) : null;
  const isDirectVideo = video_url && !youtubeEmbed && (video_url.match(/\.(mp4|webm|mov)$/i) || video_url.startsWith("blob:"));

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden mb-3 hover:border-border transition-colors">
      {/* Author bar */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link to={`/profile/${username}`}>
          <Avatar className="w-9 h-9 ring-2 ring-primary/20">
            {avatar_url ? <AvatarImage src={avatar_url} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${username}`} className="font-semibold text-sm hover:text-primary transition-colors">{username}</Link>
        </div>
        <span className="text-muted-foreground text-xs bg-secondary/50 px-2 py-0.5 rounded-full">{formatDate(created_at)}</span>
      </div>

      {/* Content */}
      {content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderContent(content)}</p>
        </div>
      )}

      {/* Media */}
      {image_url && (
        <div className="px-4 pb-3">
          <div className="rounded-lg overflow-hidden border border-border/30">
            <img src={image_url} alt="Post media" className="max-h-96 w-full object-cover" />
          </div>
        </div>
      )}
      {youtubeEmbed && (
        <div className="px-4 pb-3">
          <div className="rounded-lg overflow-hidden border border-border/30 aspect-video">
            <iframe src={youtubeEmbed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </div>
      )}
      {isDirectVideo && (
        <div className="px-4 pb-3">
          <div className="rounded-lg overflow-hidden border border-border/30">
            <video src={video_url!} className="max-h-96 w-full" controls playsInline />
          </div>
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center border-t border-border/30 px-4 py-2.5 bg-secondary/20">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${liked ? "bg-red-500/15 text-red-500" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
            <span>{likesNum}</span>
          </button>
          <button
            onClick={toggleReplies}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${showReplies ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{repliesCount}</span>
          </button>
          <button onClick={() => setShareOpen(true)} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all" title="Share">
            <Share className="w-3.5 h-3.5" />
          </button>
        </div>
        {user?.id === user_id && (
          <button onClick={handleDelete} className="ml-auto p-1.5 rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Replies section */}
      {showReplies && (
        <div className="border-t border-border/30 bg-secondary/10">
          {/* Reply input */}
          {user && (
            <div className="px-4 py-3 border-b border-border/20">
              <div className="flex items-start gap-2">
                <Avatar className="w-7 h-7 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {myUsername?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      ref={replyInputRef}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                      placeholder="Write a reply…"
                      className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => { setShowGifPicker(v => !v); if (!showGifPicker) fetchTrendingGifs(); }}
                      className="px-2 py-2 rounded-lg text-xs font-bold text-primary hover:bg-secondary transition-colors"
                      title="Add GIF"
                    >
                      GIF
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={(!replyText.trim() && !selectedGifUrl) || replying}
                      className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                    >
                      {replying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Selected GIF preview */}
                  {selectedGifUrl && (
                    <div className="relative mt-2 inline-block">
                      <img src={selectedGifUrl} alt="GIF" className="rounded-lg max-h-32" />
                      <button onClick={() => setSelectedGifUrl(null)} className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5">
                        <X className="w-3 h-3 text-foreground" />
                      </button>
                    </div>
                  )}

                  {/* GIF picker */}
                  {showGifPicker && (
                    <div className="mt-2 bg-card border border-border rounded-lg p-2 max-h-56 overflow-hidden flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          value={gifSearch}
                          onChange={(e) => setGifSearch(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") searchGifs(gifSearch); }}
                          placeholder="Search GIFs…"
                          className="flex-1 bg-secondary/50 border-none rounded px-2 py-1 text-xs placeholder:text-muted-foreground focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto subtle-scroll flex-1">
                        {gifLoading ? (
                          <p className="text-xs text-muted-foreground text-center py-3">Loading…</p>
                        ) : (
                          <div className="grid grid-cols-4 gap-1">
                            {gifResults.map((gif: any) => {
                              const url = gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url || "";
                              return (
                                <button
                                  key={gif.id}
                                  onClick={() => { setSelectedGifUrl(url); setShowGifPicker(false); }}
                                  className="rounded overflow-hidden hover:opacity-80 transition-opacity"
                                >
                                  <img src={url} alt="" className="w-full h-16 object-cover" loading="lazy" />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Replies list */}
          <div className="px-4 py-2">
            {loadingReplies ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : replies.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No replies yet. Be the first!</p>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="flex gap-2 py-2.5 border-b border-border/10 last:border-0">
                  <Link to={`/profile/${reply.username}`}>
                    <Avatar className="w-6 h-6">
                      {reply.avatar_url ? <AvatarImage src={reply.avatar_url} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {reply.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${reply.username}`} className="text-xs font-semibold hover:text-primary transition-colors">{reply.username}</Link>
                      <span className="text-[10px] text-muted-foreground">{formatDate(reply.created_at)}</span>
                    </div>
                    <div className="text-sm mt-0.5 whitespace-pre-wrap">{renderReplyContent(reply.content)}</div>
                  </div>
                  {user?.id === reply.user_id && (
                    <button onClick={() => handleDeleteReply(reply.id)} className="p-1 rounded-full text-muted-foreground hover:text-destructive transition-colors shrink-0 self-start" title="Delete reply">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        postId={id}
        postContent={content}
        username={username}
      />
    </div>
  );
};

export default PostItem;
