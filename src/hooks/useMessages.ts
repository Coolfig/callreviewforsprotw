import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/types/messages";

export const useMessages = (activeConvo: string | null, userId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (convoId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) {
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", senderIds);
      const pMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);
      setMessages(data.map(m => ({ ...m, sender_username: pMap.get(m.sender_id) || "Unknown" })));
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", convoId)
        .neq("sender_id", userId || "")
        .eq("is_read", false);
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeConvo || !userId) return;
    await supabase.from("messages").insert({
      conversation_id: activeConvo,
      sender_id: userId,
      content: content.trim(),
    });
  };

  // Realtime subscription
  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`messages-${activeConvo}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConvo}` },
        (payload) => {
          const msg = payload.new as any;
          setMessages(prev => [...prev, msg]);
          if (msg.sender_id !== userId) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id).then();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, userId]);

  return { messages, messagesEndRef, loadMessages, sendMessage };
};
