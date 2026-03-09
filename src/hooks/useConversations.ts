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

    // Deduplicate 1:1 conversations — keep only the most recent per user pair
    const seen1on1 = new Map<string, number>();
    const deduped = enriched.filter((c, idx) => {
      if (c.is_group) return true;
      const otherMembers = c.members
        .map(m => m.user_id)
        .filter(id => id !== userId)
        .sort()
        .join(",");
      if (!otherMembers) return true;
      if (seen1on1.has(otherMembers)) return false;
      seen1on1.set(otherMembers, idx);
      return true;
    });

    setConversations(deduped);
  }, [userId]);

  const createConversation = async (
    selectedUsers: { user_id: string; username: string }[],
    groupName: string
  ): Promise<string | null> => {
    if (!userId || selectedUsers.length === 0) return null;
    const isGroup = selectedUsers.length > 1;

    // For 1:1 chats, check if a conversation already exists with this user
    if (!isGroup) {
      const otherUserId = selectedUsers[0].user_id;
      // Find conversations where both users are members and it's not a group
      const { data: myConvos } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", userId);
      if (myConvos?.length) {
        const myConvoIds = myConvos.map(m => m.conversation_id);
        const { data: theirConvos } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", otherUserId)
          .in("conversation_id", myConvoIds);
        if (theirConvos?.length) {
          // Check which of these shared conversations are 1:1 (not group)
          const sharedIds = theirConvos.map(m => m.conversation_id);
          const { data: existing } = await supabase
            .from("conversations")
            .select("id")
            .in("id", sharedIds)
            .eq("is_group", false)
            .limit(1);
          if (existing?.length) {
            await fetchConversations();
            return existing[0].id;
          }
        }
      }
    }

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
