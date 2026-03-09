import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConversationItem from "./ConversationItem";
import NewChatPanel from "./NewChatPanel";
import type { Conversation } from "@/types/messages";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConvoId: string | null;
  userId: string;
  showNewChat: boolean;
  getConvoName: (c: Conversation) => string;
  onSelectConvo: (id: string) => void;
  onNewChat: () => void;
  onCancelNewChat: () => void;
  onConvoCreated: (id: string) => void;
  createConversation: (users: { user_id: string; username: string }[], groupName: string) => Promise<string | null>;
}

const ConversationSidebar = ({
  conversations,
  activeConvoId,
  userId,
  showNewChat,
  getConvoName,
  onSelectConvo,
  onNewChat,
  onCancelNewChat,
  onConvoCreated,
  createConversation,
}: ConversationSidebarProps) => (
  <div className={`w-full md:w-80 border-r border-border flex flex-col ${activeConvoId ? "hidden md:flex" : "flex"}`}>
    <div className="p-4 border-b border-border flex items-center justify-between">
      <h2 className="text-lg font-bold">Messages</h2>
      <Button size="icon" variant="ghost" onClick={onNewChat}>
        <Plus className="w-5 h-5" />
      </Button>
    </div>

    <NewChatPanel
      userId={userId}
      open={showNewChat}
      onClose={onCancelNewChat}
      onCreated={onConvoCreated}
      createConversation={createConversation}
    />

    <div className="flex-1 overflow-y-auto">
      {conversations.map(c => (
        <ConversationItem
          key={c.id}
          conversation={c}
          isActive={activeConvoId === c.id}
          displayName={getConvoName(c)}
          onClick={() => onSelectConvo(c.id)}
        />
      ))}
      {conversations.length === 0 && !showNewChat && (
        <div className="p-8 text-center text-muted-foreground text-sm">
          <p>No conversations yet</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onNewChat}>Start a Chat</Button>
        </div>
      )}
    </div>
  </div>
);

export default ConversationSidebar;
