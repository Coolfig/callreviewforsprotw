-- Create enum for platform sources
CREATE TYPE platform_source AS ENUM ('x', 'reddit', 'youtube', 'tiktok', 'instagram');

-- Create enum for detection status
CREATE TYPE detection_status AS ENUM ('flagged', 'reviewing', 'confirmed', 'dismissed');

-- Create table for flagged controversy moments
CREATE TABLE public.flagged_moments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  game_timestamp TEXT, -- e.g., "Q4 2:34" or video timestamp
  teams TEXT[] NOT NULL, -- Teams involved e.g., ['Bills', 'Chiefs']
  players TEXT[], -- Players mentioned
  
  -- Keyword detection results
  officiating_keywords TEXT[] NOT NULL DEFAULT '{}',
  rule_keywords TEXT[] NOT NULL DEFAULT '{}',
  emotion_keywords TEXT[] NOT NULL DEFAULT '{}',
  bucket_count INTEGER NOT NULL DEFAULT 0, -- How many buckets matched
  
  -- Source information
  platform platform_source NOT NULL,
  source_url TEXT,
  source_text TEXT, -- Original post text
  
  -- Engagement metrics
  engagement_velocity_score DECIMAL NOT NULL DEFAULT 0, -- Posts per minute spike score
  post_volume INTEGER NOT NULL DEFAULT 0, -- Number of posts in detection window
  
  -- Processing status
  status detection_status NOT NULL DEFAULT 'flagged',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional metadata
  league TEXT, -- NFL, NBA, MLB, NHL
  game_id TEXT, -- External game identifier if available
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for raw social posts that triggered detection
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flagged_moment_id UUID REFERENCES public.flagged_moments(id) ON DELETE CASCADE,
  platform platform_source NOT NULL,
  post_id TEXT, -- Platform-specific post ID
  post_url TEXT,
  post_text TEXT NOT NULL,
  author TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  engagement_count INTEGER DEFAULT 0, -- likes, retweets, etc.
  detected_keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for keyword configuration (allows updating without code changes)
CREATE TABLE public.keyword_buckets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_name TEXT NOT NULL UNIQUE, -- 'officiating', 'rule_nfl', 'rule_nba', 'emotion'
  keywords TEXT[] NOT NULL,
  league TEXT, -- NULL for universal, 'NFL'/'NBA' for sport-specific
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for team/player name mappings
CREATE TABLE public.team_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league TEXT NOT NULL,
  team_name TEXT NOT NULL, -- Official name
  aliases TEXT[] NOT NULL, -- ['Bills', 'Buffalo Bills', 'BUF']
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_flagged_moments_status ON public.flagged_moments(status);
CREATE INDEX idx_flagged_moments_detected_at ON public.flagged_moments(detected_at DESC);
CREATE INDEX idx_flagged_moments_platform ON public.flagged_moments(platform);
CREATE INDEX idx_flagged_moments_league ON public.flagged_moments(league);
CREATE INDEX idx_social_posts_flagged_moment ON public.social_posts(flagged_moment_id);
CREATE INDEX idx_keyword_buckets_active ON public.keyword_buckets(is_active);
CREATE INDEX idx_team_mappings_league ON public.team_mappings(league);

-- Enable RLS
ALTER TABLE public.flagged_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read for flagged moments, protected write)
CREATE POLICY "Anyone can view flagged moments"
ON public.flagged_moments
FOR SELECT
USING (true);

CREATE POLICY "Service role can manage flagged moments"
ON public.flagged_moments
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can view social posts"
ON public.social_posts
FOR SELECT
USING (true);

CREATE POLICY "Service role can manage social posts"
ON public.social_posts
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can view keyword buckets"
ON public.keyword_buckets
FOR SELECT
USING (true);

CREATE POLICY "Anyone can view team mappings"
ON public.team_mappings
FOR SELECT
USING (true);

-- Create timestamp update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_flagged_moments_updated_at
BEFORE UPDATE ON public.flagged_moments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_keyword_buckets_updated_at
BEFORE UPDATE ON public.keyword_buckets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for flagged moments
ALTER PUBLICATION supabase_realtime ADD TABLE public.flagged_moments;