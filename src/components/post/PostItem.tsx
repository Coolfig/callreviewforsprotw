import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

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
  onDelete?: () => void;
  onLikeToggle?: () => void;
}

// Parse @mentions into links
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

const PostItem = ({
  id, content, created_at, user_id, username, avatar_url,
  likes_count, replies_count, is_liked, onDelete, onLikeToggle,
}: PostItemProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(is_liked);
  const [likesNum, setLikesNum] = useState(likes_count);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
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

  return (
    <div className="flex gap-3 p-4 border-b border-border/50 hover:bg-secondary/20 transition-colors">
      <Link to={`/profile/${username}`}>
        <Avatar className="w-10 h-10 shrink-0">
          {avatar_url ? <AvatarImage src={avatar_url} /> : null}
          <AvatarFallback className="bg-secondary text-sm font-bold">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${username}`} className="font-bold text-sm hover:underline">{username}</Link>
          <span className="text-muted-foreground text-xs">@{username.toLowerCase()}</span>
          <span className="text-muted-foreground text-xs">· {timeAgo(created_at)}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{renderContent(content)}</p>
        <div className="flex items-center gap-6 mt-3">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-xs">
            <MessageCircle className="w-4 h-4" />
            <span>{replies_count}</span>
          </button>
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 transition-colors text-xs ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span>{likesNum}</span>
          </button>
          {user?.id === user_id && (
            <button onClick={handleDelete} className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors text-xs ml-auto">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostItem;
