
-- Fix conversations SELECT: also allow creator to see their own conversation
DROP POLICY IF EXISTS "Members can view conversations" ON public.conversations;
CREATE POLICY "Members can view conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (is_conversation_member(auth.uid(), id) OR auth.uid() = created_by);

-- Make conversations INSERT permissive (was restrictive)
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Make conversation_members INSERT permissive (was restrictive)
DROP POLICY IF EXISTS "Members can add members" ON public.conversation_members;
CREATE POLICY "Members can add members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Make conversation_members SELECT also check if user is the one being added
DROP POLICY IF EXISTS "Members can view members" ON public.conversation_members;
CREATE POLICY "Members can view members"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (is_conversation_member(auth.uid(), conversation_id) OR auth.uid() = user_id);
