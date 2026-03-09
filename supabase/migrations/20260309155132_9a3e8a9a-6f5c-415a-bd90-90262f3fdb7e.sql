-- 1. Fix conversation_members INSERT policy
-- Create a helper function to check if user is the conversation creator
CREATE OR REPLACE FUNCTION public.is_conversation_creator(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation_id AND created_by = _user_id
  )
$$;

DROP POLICY IF EXISTS "Members can add members" ON public.conversation_members;

CREATE POLICY "Members can add members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Creator can add initial members, or existing members can add new members
    public.is_conversation_creator(auth.uid(), conversation_id)
    OR public.is_conversation_member(auth.uid(), conversation_id)
  );

-- 2. Fix post-media storage policy to scope uploads to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload post media" ON storage.objects;

CREATE POLICY "Users can upload own post media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );