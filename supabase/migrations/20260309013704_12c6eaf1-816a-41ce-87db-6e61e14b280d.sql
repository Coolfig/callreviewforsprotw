
-- Comment bookmarks table
CREATE TABLE public.comment_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

ALTER TABLE public.comment_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own comment bookmarks" ON public.comment_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own comment bookmarks" ON public.comment_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment bookmarks" ON public.comment_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comment dislikes table
CREATE TABLE public.comment_dislikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

ALTER TABLE public.comment_dislikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own comment dislikes" ON public.comment_dislikes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own comment dislikes" ON public.comment_dislikes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment dislikes" ON public.comment_dislikes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add dislikes_count to comments
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS dislikes_count INTEGER NOT NULL DEFAULT 0;

-- Trigger to update dislikes_count
CREATE OR REPLACE FUNCTION public.update_comment_dislikes_count() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET dislikes_count = dislikes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_comment_dislike_change
  AFTER INSERT OR DELETE ON public.comment_dislikes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_dislikes_count();
