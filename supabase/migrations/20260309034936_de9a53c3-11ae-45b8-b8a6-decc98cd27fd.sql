
-- Make SELECT policies on conversations permissive
DROP POLICY IF EXISTS "Members can view conversations" ON public.conversations;
CREATE POLICY "Members can view conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (is_conversation_member(auth.uid(), id));

-- Make UPDATE policy on conversations permissive  
DROP POLICY IF EXISTS "Members can update conversations" ON public.conversations;
CREATE POLICY "Members can update conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (is_conversation_member(auth.uid(), id));

-- Make SELECT policy on conversation_members permissive
DROP POLICY IF EXISTS "Members can view members" ON public.conversation_members;
CREATE POLICY "Members can view members"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (is_conversation_member(auth.uid(), conversation_id));

-- Make DELETE policy on conversation_members permissive
DROP POLICY IF EXISTS "Users can leave conversations" ON public.conversation_members;
CREATE POLICY "Users can leave conversations"
  ON public.conversation_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
