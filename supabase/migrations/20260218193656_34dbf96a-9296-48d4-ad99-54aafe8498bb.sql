
-- Add media columns to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_url text;

-- Create post-media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-media
CREATE POLICY "Post media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own post media"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
