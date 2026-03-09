import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Plus, Users, ArrowLeft, Image, Search, Check, CheckCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  updated_at: string;
  members: { user_id: string; username: string; avatar_url: string | null }[];
  last_message?: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  is_read: boolean;
  created_at: string;
  sender_username?: string;
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState("");
  const [foundUsers, setFoundUsers] = useState<{ user_id: string; username: string; avatar_url: string | null }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ user_id: string; username: string }[]>([]);
  const [groupName, setGroupName] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data: memberData } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", user.id);
    if (!memberData?.length) return;

    const convoIds = memberData.map(m => m.conversation_id);
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convoIds)
      .order("updated_at", { ascending: false });
    if (!convos) return;

    const enriched: Conversation[] = [];
    for (const c of convos) {
      const { data: members } = await supabase
        .from("conversation_members")
        .select("user_id")
        .eq("conversation_id", c.id);
      const userIds = members?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, is_read, sender_id")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: unread } = await supabase
        .from("messages")
        .select("id")
        .eq("conversation_id", c.id)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      enriched.push({
        ...c,
        members: profiles || [],
        last_message: lastMsg?.[0]?.content,
        unread_count: unread?.length || 0,
      });
    }
    setConversations(enriched);
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Realtime messages
  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`messages-${activeConvo}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConvo}` }, (payload) => {
        const msg = payload.new as any;
        setMessages(prev => [...prev, msg]);
        // Mark as read
        if (msg.sender_id !== user?.id) {
          supabase.from("messages").update({ is_read: true }).eq("id", msg.id).then();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, user]);

  // Realtime typing
  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`typing-${activeConvo}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "typing_indicators", filter: `conversation_id=eq.${activeConvo}` }, async () => {
        const { data } = await supabase
          .from("typing_indicators")
          .select("user_id")
          .eq("conversation_id", activeConvo)
          .neq("user_id", user?.id || "");
        if (data) {
          const uids = data.map(d => d.user_id);
          const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", uids);
          setTypingUsers(profiles?.map(p => p.username) || []);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, user]);

  const loadMessages = async (convoId: string) => {
    setActiveConvo(convoId);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) {
      // Enrich with usernames
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", senderIds);
      const pMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);
      setMessages(data.map(m => ({ ...m, sender_username: pMap.get(m.sender_id) || "Unknown" })));
      // Mark unread as read
      await supabase.from("messages").update({ is_read: true }).eq("conversation_id", convoId).neq("sender_id", user?.id || "").eq("is_read", false);
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvo || !user) return;
    await supabase.from("messages").insert({ conversation_id: activeConvo, sender_id: user.id, content: newMessage.trim() });
    setNewMessage("");
    // Remove typing indicator
    await supabase.from("typing_indicators").delete().eq("conversation_id", activeConvo).eq("user_id", user.id);
  };

  const handleTyping = async () => {
    if (!activeConvo || !user) return;
    await supabase.from("typing_indicators").upsert({ conversation_id: activeConvo, user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: "conversation_id,user_id" });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await supabase.from("typing_indicators").delete().eq("conversation_id", activeConvo).eq("user_id", user.id);
    }, 3000);
  };

  const searchForUsers = async (q: string) => {
    setSearchUsers(q);
    if (q.length < 2) { setFoundUsers([]); return; }
    const { data } = await supabase.from("profiles").select("user_id, username, avatar_url").ilike("username", `%${q}%`).neq("user_id", user?.id || "").limit(10);
    setFoundUsers(data || []);
  };

  const createConversation = async () => {
    if (!user || selectedUsers.length === 0) return;
    const isGroup = selectedUsers.length > 1;
    const { data: convo } = await supabase.from("conversations").insert({ name: isGroup ? (groupName || "Group Chat") : null, is_group: isGroup, created_by: user.id }).select().single();
    if (!convo) return;
    const members = [user.id, ...selectedUsers.map(u => u.user_id)];
    await supabase.from("conversation_members").insert(members.map(uid => ({ conversation_id: convo.id, user_id: uid })));
    setShowNewChat(false);
    setSelectedUsers([]);
    setGroupName("");
    setSearchUsers("");
    await fetchConversations();
    loadMessages(convo.id);
  };

  const activeConversation = conversations.find(c => c.id === activeConvo);
  const getConvoName = (c: Conversation) => {
    if (c.name) return c.name;
    return c.members.filter(m => m.user_id !== user?.id).map(m => m.username).join(", ") || "Chat";
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 text-center">
          <p className="text-muted-foreground">Please sign in to use messages.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 h-[calc(100vh-0px)]">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${activeConvo ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Messages</h2>
              <Button size="icon" variant="ghost" onClick={() => setShowNewChat(true)}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* New chat modal */}
            {showNewChat && (
              <div className="p-4 border-b border-border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Search users..." value={searchUsers} onChange={(e) => searchForUsers(e.target.value)} />
                  <Button size="sm" variant="ghost" onClick={() => { setShowNewChat(false); setSelectedUsers([]); }}>
                    Cancel
                  </Button>
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
                  <button key={u.user_id} onClick={() => {
                    if (!selectedUsers.find(s => s.user_id === u.user_id)) {
                      setSelectedUsers(prev => [...prev, { user_id: u.user_id, username: u.username }]);
                    }
                  }} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-secondary">{u.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">@{u.username}</span>
                  </button>
                ))}
                {selectedUsers.length > 0 && (
                  <Button size="sm" className="w-full" onClick={createConversation}>
                    Start {selectedUsers.length > 1 ? "Group Chat" : "Conversation"}
                  </Button>
                )}
              </div>
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map(c => (
                <button key={c.id} onClick={() => loadMessages(c.id)} className={`w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors border-b border-border/30 ${activeConvo === c.id ? "bg-secondary/50" : ""}`}>
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-xs bg-secondary font-bold">
                        {c.is_group ? <Users className="w-4 h-4" /> : getConvoName(c).slice(0, 2).toUpperCase()}
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
                      <span className="text-sm font-semibold truncate">{getConvoName(c)}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(c.updated_at)}</span>
                    </div>
                    {c.last_message && (
                      <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
                    )}
                  </div>
                </button>
              ))}
              {conversations.length === 0 && !showNewChat && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <p>No conversations yet</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowNewChat(true)}>Start a Chat</Button>
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!activeConvo ? "hidden md:flex" : "flex"}`}>
            {activeConvo && activeConversation ? (
              <>
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <button className="md:hidden" onClick={() => setActiveConvo(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-secondary font-bold">
                      {activeConversation.is_group ? <Users className="w-3 h-3" /> : getConvoName(activeConversation).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{getConvoName(activeConversation)}</p>
                    {activeConversation.is_group && (
                      <p className="text-[10px] text-muted-foreground">{activeConversation.members.length} members</p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => {
                    const isOwn = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                          {!isOwn && activeConversation.is_group && (
                            <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.sender_username}</p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
                            <span className="text-[10px] opacity-60">{timeAgo(msg.created_at)}</span>
                            {isOwn && (msg.is_read ? <CheckCheck className="w-3 h-3 opacity-60" /> : <Check className="w-3 h-3 opacity-40" />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a conversation or start a new one</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
