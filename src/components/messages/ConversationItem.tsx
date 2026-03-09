import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import type { Conversation } from "@/types/messages";
import { timeAgo } from "@/lib/utils/timeAgo";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  displayName: string;
  onClick: () => void;
}

const ConversationItem = ({ conversation: c, isActive, displayName, onClick }: ConversationItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors border-b border-border/30 ${isActive ? "bg-secondary/50" : ""}`}
  >
    <div className="relative">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="text-xs bg-secondary font-bold">
          {c.is_group ? <Users className="w-4 h-4" /> : displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {c.unread_count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {c.unread_count}
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0 text-left">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold truncate">{displayName}</span>
        <span className="text-[10px] text-muted-foreground">{timeAgo(c.updated_at)}</span>
      </div>
      {c.last_message && (
        <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
      )}
    </div>
  </button>
);

export default ConversationItem;
