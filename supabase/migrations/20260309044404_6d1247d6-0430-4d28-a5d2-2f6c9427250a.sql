
-- Fix flagged_moments: drop overly permissive policy, recreate for service_role only, add admin write policy
DROP POLICY IF EXISTS "Service role can manage flagged moments" ON public.flagged_moments;

CREATE POLICY "Service role can manage flagged moments"
  ON public.flagged_moments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage flagged moments"
  ON public.flagged_moments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix social_posts: drop overly permissive policy, recreate for service_role only
DROP POLICY IF EXISTS "Service role can manage social posts" ON public.social_posts;

CREATE POLICY "Service role can manage social posts"
  ON public.social_posts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Fix clips: drop overly permissive policy, recreate for service_role only
DROP POLICY IF EXISTS "Service role can manage clips" ON public.clips;

CREATE POLICY "Service role can manage clips"
  ON public.clips FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Fix videos: drop overly permissive policy, recreate for service_role only
DROP POLICY IF EXISTS "Service role can manage videos" ON public.videos;

CREATE POLICY "Service role can manage videos"
  ON public.videos FOR ALL TO service_role
  USING (true) WITH CHECK (true);
