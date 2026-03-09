import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTypingIndicator = (activeConvo: string | null, userId: string | undefined) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = async () => {
    if (!activeConvo || !userId) return;
    await supabase.from("typing_indicators").upsert(
      { conversation_id: activeConvo, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: "conversation_id,user_id" }
    );
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await supabase.from("typing_indicators").delete().eq("conversation_id", activeConvo).eq("user_id", userId);
    }, 3000);
  };

  const clearTyping = async () => {
    if (!activeConvo || !userId) return;
    await supabase.from("typing_indicators").delete().eq("conversation_id", activeConvo).eq("user_id", userId);
  };

  // Realtime subscription
  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`typing-${activeConvo}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_indicators", filter: `conversation_id=eq.${activeConvo}` },
        async () => {
          const { data } = await supabase
            .from("typing_indicators")
            .select("user_id")
            .eq("conversation_id", activeConvo)
            .neq("user_id", userId || "");
          if (data) {
            const uids = data.map(d => d.user_id);
            const { data: profiles } = await supabase
              .from("profiles")
              .select("user_id, username")
              .in("user_id", uids);
            setTypingUsers(profiles?.map(p => p.username) || []);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, userId]);

  return { typingUsers, handleTyping, clearTyping };
};
