import { useState } from "react";
import { Heart, MessageCircle, Trash2, Share } from "lucide-react";
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

const renderContent = (text: string) => {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const username = part.slice(1);
      return (
        <Link key={i} to={`/profile/${username}`} className="text-primary hover:underline font-medium">
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
  const { user } = useAuth();
  const [liked, setLiked] = useState(is_liked);
  const [likesNum, setLikesNum] = useState(likes_count);

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

  const [shareOpen, setShareOpen] = useState(false);

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
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{replies_count}</span>
          </button>
          <button onClick={handleCopyLink} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all" title="Share">
            <Share className="w-3.5 h-3.5" />
          </button>
        </div>
        {user?.id === user_id && (
          <button onClick={handleDelete} className="ml-auto p-1.5 rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PostItem;
