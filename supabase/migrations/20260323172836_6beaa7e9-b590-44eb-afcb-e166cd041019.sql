
CREATE OR REPLACE FUNCTION public.protect_comment_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent direct manipulation of computed fields
  NEW.likes_count := OLD.likes_count;
  NEW.dislikes_count := OLD.dislikes_count;
  NEW.score := OLD.score;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_comment_counts_trigger
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_comment_counts();
