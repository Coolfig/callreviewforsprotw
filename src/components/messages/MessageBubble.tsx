import { Check, CheckCheck } from "lucide-react";
import type { Message } from "@/types/messages";
import { timeAgo } from "@/lib/utils/timeAgo";

interface MessageBubbleProps {
  msg: Message;
  isOwn: boolean;
  isGroup: boolean;
}

const isImageUrl = (text: string) =>
  /^https?:\/\/.+\.(gif|png|jpg|jpeg|webp)(\?.*)?$/i.test(text) ||
  text.includes("tenor.com") || text.includes("giphy.com");

const MessageBubble = ({ msg, isOwn, isGroup }: MessageBubbleProps) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
      {!isOwn && isGroup && (
        <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.sender_username}</p>
      )}
      {isImageUrl(msg.content) ? (
        <img src={msg.content} alt="GIF" className="rounded-lg max-w-full max-h-48 object-contain" loading="lazy" />
      ) : (
        <p className="text-sm">{msg.content}</p>
      )}
      <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
        <span className="text-[10px] opacity-60">{timeAgo(msg.created_at)}</span>
        {isOwn && (msg.is_read ? <CheckCheck className="w-3 h-3 opacity-60" /> : <Check className="w-3 h-3 opacity-40" />)}
      </div>
    </div>
  </div>
);

export default MessageBubble;
