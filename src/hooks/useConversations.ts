import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/types/messages";

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    const { data: memberData } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", userId);
    if (!memberData?.length) { setConversations([]); return; }

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
        .neq("sender_id", userId);

      enriched.push({
        ...c,
        members: profiles || [],
        last_message: lastMsg?.[0]?.content,
        unread_count: unread?.length || 0,
      });
    }
    setConversations(enriched);
  }, [userId]);

  const createConversation = async (
    selectedUsers: { user_id: string; username: string }[],
    groupName: string
  ): Promise<string | null> => {
    if (!userId || selectedUsers.length === 0) return null;
    const isGroup = selectedUsers.length > 1;
    const { data: convo } = await supabase
      .from("conversations")
      .insert({ name: isGroup ? (groupName || "Group Chat") : null, is_group: isGroup, created_by: userId })
      .select()
      .single();
    if (!convo) return null;
    const members = [userId, ...selectedUsers.map(u => u.user_id)];
    await supabase
      .from("conversation_members")
      .insert(members.map(uid => ({ conversation_id: convo.id, user_id: uid })));
    await fetchConversations();
    return convo.id;
  };

  const getConvoName = useCallback((c: Conversation) => {
    if (c.name) return c.name;
    return c.members.filter(m => m.user_id !== userId).map(m => m.username).join(", ") || "Chat";
  }, [userId]);

  return { conversations, fetchConversations, createConversation, getConvoName };
};
