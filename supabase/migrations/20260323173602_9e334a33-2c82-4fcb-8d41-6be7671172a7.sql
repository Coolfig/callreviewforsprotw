
CREATE OR REPLACE FUNCTION public.protect_comment_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only protect against direct API updates (trigger depth 1)
  -- Allow trigger-initiated updates from comment_likes/comment_dislikes (depth 2+)
  IF pg_trigger_depth() <= 1 THEN
    NEW.likes_count := OLD.likes_count;
    NEW.dislikes_count := OLD.dislikes_count;
    NEW.score := OLD.score;
  END IF;
  RETURN NEW;
END;
$$;
