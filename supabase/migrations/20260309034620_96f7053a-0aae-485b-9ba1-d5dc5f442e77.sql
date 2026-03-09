
-- Drop the restrictive INSERT policy and recreate as permissive
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Also fix conversation_members INSERT - drop restrictive and recreate as permissive
DROP POLICY IF EXISTS "Members can add members" ON public.conversation_members;
CREATE POLICY "Members can add members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
