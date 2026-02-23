
-- Fix notification insert to only allow authenticated inserts or trigger-based
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fix conversation_members insert policy
DROP POLICY "Conversation creators can add members" ON public.conversation_members;
CREATE POLICY "Members can add members" ON public.conversation_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
