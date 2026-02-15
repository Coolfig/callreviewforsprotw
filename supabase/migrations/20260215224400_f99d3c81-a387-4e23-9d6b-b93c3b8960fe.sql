
-- Comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  play_id TEXT NOT NULL, -- which play/controversy the comment is on
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- for replies
  content TEXT NOT NULL,
  rule_reference TEXT,
  timestamp_reference TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0, -- computed score from scoring algorithm
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comment likes table (tracks who liked what)
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "Anyone can view comment likes"
ON public.comment_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like"
ON public.comment_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
ON public.comment_likes FOR DELETE
USING (auth.uid() = user_id);

-- Function to update likes_count on comments
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_comment_like_change
AFTER INSERT OR DELETE ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_likes_count();

-- Function to compute comment score
-- Score = (likes × 1) + (has rule citation × 5) + (has timestamp × 3)
CREATE OR REPLACE FUNCTION public.compute_comment_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := COALESCE(NEW.likes_count, 0)
    + CASE WHEN NEW.rule_reference IS NOT NULL AND NEW.rule_reference != '' THEN 5 ELSE 0 END
    + CASE WHEN NEW.timestamp_reference IS NOT NULL AND NEW.timestamp_reference != '' THEN 3 ELSE 0 END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER compute_comment_score_trigger
BEFORE INSERT OR UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.compute_comment_score();

-- Index for fast lookups
CREATE INDEX idx_comments_play_id ON public.comments(play_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);
