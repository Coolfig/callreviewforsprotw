
-- Play votes table to persist user votes on plays
CREATE TABLE public.play_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  play_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('correct', 'missed', 'unclear')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, play_id)
);

ALTER TABLE public.play_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view play votes" ON public.play_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.play_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON public.play_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.play_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
