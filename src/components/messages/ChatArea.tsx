import { useState, RefObject } from "react";
import { ArrowLeft, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MessageBubble from "./MessageBubble";
import type { Message, Conversation } from "@/types/messages";

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  userId: string;
  displayName: string;
  typingUsers: string[];
  messagesEndRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
  onClearTyping: () => Promise<void>;
}

const ChatArea = ({
  conversation,
  messages,
  userId,
  displayName,
  typingUsers,
  messagesEndRef,
  onBack,
  onSend,
  onTyping,
  onClearTyping,
}: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await onSend(newMessage.trim());
    setNewMessage("");
    await onClearTyping();
  };

  return (
    <>
      <div className="p-4 border-b border-border flex items-center gap-3">
        <button className="md:hidden" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs bg-secondary font-bold">
            {conversation.is_group ? <Users className="w-3 h-3" /> : displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{displayName}</p>
          {conversation.is_group && (
            <p className="text-[10px] text-muted-foreground">{conversation.members.length} members</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.sender_id === userId}
            isGroup={conversation.is_group}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-muted-foreground italic">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      <div className="p-4 border-t border-border flex items-center gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => { setNewMessage(e.target.value); onTyping(); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
};

export default ChatArea;
