
-- Add profile fields for the sports identity card
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS banner_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS favorite_teams TEXT[] DEFAULT '{}';

-- Add followers table
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view followers" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid() = follower_id);
