
-- Videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clips table
CREATE TABLE public.clips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  clip_title TEXT NOT NULL,
  start_seconds INTEGER NOT NULL,
  end_seconds INTEGER NOT NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- Public read for both
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Anyone can view clips" ON public.clips FOR SELECT USING (true);

-- Service role can manage both
CREATE POLICY "Service role can manage videos" ON public.videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage clips" ON public.clips FOR ALL USING (true) WITH CHECK (true);

-- Index for clips by video
CREATE INDEX idx_clips_video_id ON public.clips(video_id);
CREATE INDEX idx_clips_created_at ON public.clips(created_at DESC);

-- Unique constraint on youtube_id
CREATE UNIQUE INDEX idx_videos_youtube_id ON public.videos(youtube_id);
