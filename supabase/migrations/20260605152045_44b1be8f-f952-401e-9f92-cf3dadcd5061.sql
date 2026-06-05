CREATE TABLE public.post_reply_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reply_id uuid NOT NULL REFERENCES public.post_replies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reply_id)
);
GRANT SELECT, INSERT, DELETE ON public.post_reply_bookmarks TO authenticated;
GRANT ALL ON public.post_reply_bookmarks TO service_role;
ALTER TABLE public.post_reply_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own reply bookmarks" ON public.post_reply_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "create own reply bookmarks" ON public.post_reply_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own reply bookmarks" ON public.post_reply_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX post_reply_bookmarks_user_idx ON public.post_reply_bookmarks(user_id, created_at DESC);