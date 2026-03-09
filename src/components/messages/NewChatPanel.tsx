import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Users, X } from "lucide-react";

interface NewChatPanelProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onCreated: (convoId: string) => void;
  createConversation: (users: { user_id: string; username: string }[], groupName: string) => Promise<string | null>;
}

const NewChatPanel = ({ userId, open, onClose, onCreated, createConversation }: NewChatPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState<{ user_id: string; username: string; avatar_url: string | null }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ user_id: string; username: string; avatar_url: string | null }[]>([]);
  const [mode, setMode] = useState<"search" | "group">("search");
  const [groupName, setGroupName] = useState("");
  const [allUsers, setAllUsers] = useState<{ user_id: string; username: string; avatar_url: string | null }[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadAllUsers = async () => {
    if (loaded) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .neq("user_id", userId)
      .order("username")
      .limit(50);
    setAllUsers(data || []);
    setFoundUsers(data || []);
    setLoaded(true);
  };

  const searchForUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length === 0) {
      setFoundUsers(allUsers);
      return;
    }
    if (q.length < 2) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .ilike("username", `%${q}%`)
      .neq("user_id", userId)
      .limit(20);
    setFoundUsers(data || []);
  };

  const toggleUser = (u: { user_id: string; username: string; avatar_url: string | null }) => {
    setSelectedUsers(prev =>
      prev.find(s => s.user_id === u.user_id)
        ? prev.filter(s => s.user_id !== u.user_id)
        : [...prev, u]
    );
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    const convoId = await createConversation(
      selectedUsers.map(u => ({ user_id: u.user_id, username: u.username })),
      groupName
    );
    if (convoId) {
      resetAndClose();
      onCreated(convoId);
    }
  };

  const resetAndClose = () => {
    setSearchQuery("");
    setFoundUsers([]);
    setSelectedUsers([]);
    setMode("search");
    setGroupName("");
    setLoaded(false);
    setAllUsers([]);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      loadAllUsers();
    } else {
      resetAndClose();
    }
  };

  const isGroup = mode === "group" || selectedUsers.length > 2;
  const displayUsers = foundUsers.filter(u => !selectedUsers.find(s => s.user_id === u.user_id));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[80vh] flex flex-col">
        <DialogHeader className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              {isGroup ? "Create a group" : "New message"}
            </DialogTitle>
          </div>
          {isGroup && (
            <p className="text-sm text-muted-foreground mt-0">Add people</p>
          )}
        </DialogHeader>

        {/* Next / Start button for group */}
        {selectedUsers.length > 0 && (
          <div className="px-4 pb-2 flex-shrink-0">
            <Button className="w-full" size="sm" onClick={handleCreate}>
              {isGroup ? "Next" : "Start Conversation"}
            </Button>
          </div>
        )}

        {/* Group name input */}
        {isGroup && (
          <div className="px-4 pb-2 flex-shrink-0">
            <Input
              placeholder="Group name (optional)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-secondary/50"
            />
          </div>
        )}

        {/* Search input */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or username"
              value={searchQuery}
              onChange={(e) => searchForUsers(e.target.value)}
              className="pl-9 bg-secondary/30 border-secondary"
            />
          </div>
        </div>

        {/* Selected users chips */}
        {selectedUsers.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
            {selectedUsers.map(u => (
              <span
                key={u.user_id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {u.username}
                <button
                  onClick={() => toggleUser(u)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Create a group option */}
        {mode === "search" && selectedUsers.length === 0 && (
          <button
            onClick={() => setMode("group")}
            className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-primary border-b border-border"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Create a group</span>
          </button>
        )}

        {/* User list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {displayUsers.map(u => (
            <button
              key={u.user_id}
              onClick={() => toggleUser(u)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary/50 transition-colors"
            >
              <Avatar className="w-10 h-10">
                {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                <AvatarFallback className="text-sm bg-secondary font-medium">
                  {u.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">{u.username}</p>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </div>
            </button>
          ))}
          {foundUsers.length === 0 && searchQuery.length >= 2 && (
            <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatPanel;
