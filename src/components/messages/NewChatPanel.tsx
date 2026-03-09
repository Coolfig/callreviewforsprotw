import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NewChatPanelProps {
  userId: string;
  onCancel: () => void;
  onCreated: (convoId: string) => void;
  createConversation: (users: { user_id: string; username: string }[], groupName: string) => Promise<string | null>;
}

const NewChatPanel = ({ userId, onCancel, onCreated, createConversation }: NewChatPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState<{ user_id: string; username: string; avatar_url: string | null }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ user_id: string; username: string }[]>([]);
  const [groupName, setGroupName] = useState("");

  const searchForUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setFoundUsers([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .ilike("username", `%${q}%`)
      .neq("user_id", userId)
      .limit(10);
    setFoundUsers(data || []);
  };

  const handleCreate = async () => {
    const convoId = await createConversation(selectedUsers, groupName);
    if (convoId) onCreated(convoId);
  };

  return (
    <div className="p-4 border-b border-border bg-card space-y-3">
      <div className="flex items-center gap-2">
        <Input placeholder="Search users..." value={searchQuery} onChange={(e) => searchForUsers(e.target.value)} />
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      {selectedUsers.length > 1 && (
        <Input placeholder="Group name (optional)" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
      )}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedUsers.map(u => (
            <span key={u.user_id} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
              {u.username}
              <button onClick={() => setSelectedUsers(prev => prev.filter(s => s.user_id !== u.user_id))} className="hover:text-destructive">×</button>
            </span>
          ))}
        </div>
      )}
      {foundUsers.map(u => (
        <button
          key={u.user_id}
          onClick={() => {
            if (!selectedUsers.find(s => s.user_id === u.user_id)) {
              setSelectedUsers(prev => [...prev, { user_id: u.user_id, username: u.username }]);
            }
          }}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-secondary">{u.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">@{u.username}</span>
        </button>
      ))}
      {selectedUsers.length > 0 && (
        <Button size="sm" className="w-full" onClick={handleCreate}>
          Start {selectedUsers.length > 1 ? "Group Chat" : "Conversation"}
        </Button>
      )}
    </div>
  );
};

export default NewChatPanel;
