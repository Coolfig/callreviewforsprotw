
-- 1) Protect comment counts from being inflated via direct INSERT
CREATE OR REPLACE FUNCTION public.protect_comment_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.likes_count := 0;
    NEW.dislikes_count := 0;
    NEW.score := 0;
  ELSIF TG_OP = 'UPDATE' AND pg_trigger_depth() <= 1 THEN
    NEW.likes_count := OLD.likes_count;
    NEW.dislikes_count := OLD.dislikes_count;
    NEW.score := OLD.score;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_comment_counts_trigger ON public.comments;
DROP TRIGGER IF EXISTS a_protect_comment_counts_trigger ON public.comments;
-- Use 'a_' prefix so it fires before compute_comment_score_trigger alphabetically
CREATE TRIGGER a_protect_comment_counts_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.protect_comment_counts();

-- 2) Restrict keyword_buckets to admins only
DROP POLICY IF EXISTS "Anyone can view keyword buckets" ON public.keyword_buckets;
CREATE POLICY "Admins can view keyword buckets"
  ON public.keyword_buckets
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Add UPDATE policy on post-media storage so users can only modify their own files
DROP POLICY IF EXISTS "Users can update own post media" ON storage.objects;
CREATE POLICY "Users can update own post media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'post-media' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'post-media' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 4) Revoke EXECUTE on trigger-only SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_conversation_timestamp() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_follow() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_comment_likes_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_comment_dislikes_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_comment_counts() FROM anon, authenticated, PUBLIC;
