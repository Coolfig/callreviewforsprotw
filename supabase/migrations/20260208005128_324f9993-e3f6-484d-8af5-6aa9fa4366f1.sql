-- Create content filter keywords table for meme/spam detection
CREATE TABLE public.content_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filter_type TEXT NOT NULL, -- 'meme', 'music_artist', 'entertainment', 'spam'
  keywords TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_filters ENABLE ROW LEVEL SECURITY;

-- Anyone can view content filters
CREATE POLICY "Anyone can view content filters" 
ON public.content_filters 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_content_filters_updated_at
BEFORE UPDATE ON public.content_filters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add verification_status to flagged_moments
ALTER TABLE public.flagged_moments 
ADD COLUMN content_verified BOOLEAN DEFAULT false,
ADD COLUMN verification_reason TEXT;

-- Seed with initial meme/spam filter data
INSERT INTO public.content_filters (filter_type, keywords) VALUES
-- Music artists that commonly appear in rickrolls/memes
('music_artist', ARRAY[
  'rick astley', 'never gonna give you up', 'rickroll', 'rick roll',
  'darude', 'sandstorm', 'toto', 'africa',
  'smash mouth', 'all star', 'bee gees', 'staying alive',
  'queen', 'bohemian rhapsody', 'we are the champions',
  'journey', 'dont stop believing', 'eye of the tiger'
]),
-- Meme keywords
('meme', ARRAY[
  'meme', 'shitpost', 'copypasta', 'ratio', 'L + ratio',
  'poggers', 'based', 'cringe compilation', 'vine',
  'tiktok trend', 'challenge', 'prank', 'gone wrong',
  'not clickbait', '100% real', 'you wont believe',
  'emotional', 'crying', 'reaction', 'compilation'
]),
-- Entertainment/non-sports
('entertainment', ARRAY[
  'movie trailer', 'music video', 'official video', 'lyric video',
  'behind the scenes', 'concert', 'live performance',
  'podcast', 'interview', 'talk show', 'late night',
  'comedy', 'standup', 'skit', 'parody',
  'gaming', 'walkthrough', 'lets play', 'speedrun',
  'asmr', 'mukbang', 'unboxing', 'haul'
]),
-- Spam signals
('spam', ARRAY[
  'subscribe', 'like and subscribe', 'hit the bell',
  'giveaway', 'free money', 'click here', 'link in bio',
  'promo code', 'discount', 'sale', 'limited time',
  'crypto', 'nft', 'bitcoin', 'investment',
  'onlyfans', 'adult', 'nsfw', '18+'
]);