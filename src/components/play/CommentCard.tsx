import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Clock, BookOpen, ChevronDown, Smile, Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import EmojiPicker, { Theme, EmojiClickData, EmojiStyle } from "emoji-picker-react";
import { timeAgo } from "@/lib/utils/timeAgo";
import type { CommentData } from "@/types/comments";

interface CommentCardProps {
  comment: CommentData;
  isReply?: boolean;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onBookmark: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}

const CommentCard = ({ comment, isReply = false, onLike, onDislike, onBookmark, onReply, onDelete }: CommentCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedReplies, setExpandedReplies] = useState(false);
  const [replyingTo, setReplyingTo] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleReplySubmit = async () => {
    const success = await onReply(comment.id, replyText);
    if (success) {
      setReplyingTo(false);
      setReplyText("");
      setExpandedReplies(true);
    }
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
    setShowEmoji(false);
  };

  const initials = comment.username.slice(0, 2).toUpperCase();

  // Parse GIF content
  const gifMatch = comment.content.match(/\[gif\](https?:\/\/[^\s]+)\[\/gif\]/);
  const textContent = comment.content.replace(/\[gif\]https?:\/\/[^\s]+\[\/gif\]/, "").trim();

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

          {textContent && <p className="text-sm leading-relaxed text-secondary-foreground">{textContent}</p>}
          {gifMatch && <img src={gifMatch[1]} alt="GIF" className="mt-2 rounded-lg max-h-48 object-contain" />}

          <div className="flex items-center gap-4 mt-2.5">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${comment.liked_by_me ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{comment.likes_count}</span>
            </button>
            <button
              onClick={() => onDislike(comment.id)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${comment.disliked_by_me ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{comment.dislikes_count}</span>
            </button>
            <button
              onClick={() => onBookmark(comment.id)}
              className={`flex items-center text-xs transition-colors ${comment.bookmarked_by_me ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${comment.bookmarked_by_me ? "fill-primary" : ""}`} />
            </button>
            {!isReply && (
              <button
                onClick={() => { if (!user) { navigate("/auth"); return; } setReplyingTo(!replyingTo); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reply
              </button>
            )}
            {user && comment.user_id === user.id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {comment.replies.length > 0 && (
              <button onClick={() => setExpandedReplies(!expandedReplies)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedReplies ? "rotate-180" : ""}`} />
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {replyingTo && (
            <div className="mt-3">
              <div className="flex gap-2 relative">
                <input
                  ref={replyInputRef}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply…"
                  className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  onKeyDown={e => e.key === "Enter" && handleReplySubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowEmoji(v => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <Button size="sm" onClick={handleReplySubmit}>Reply</Button>
                {showEmoji && (
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

      {comment.replies.length > 0 && expandedReplies && (
        <div className="space-y-4 mt-4">
          {comment.replies.map(reply => (
            <CommentCard
              key={reply.id}
              comment={reply}
              isReply
              onLike={onLike}
              onDislike={onDislike}
              onBookmark={onBookmark}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
