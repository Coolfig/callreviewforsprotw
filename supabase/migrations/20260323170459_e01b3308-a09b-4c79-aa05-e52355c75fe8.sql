-- Restrict flagged_moments SELECT to admin only
DROP POLICY IF EXISTS "Anyone can view flagged moments" ON public.flagged_moments;
CREATE POLICY "Admins can view flagged moments"
  ON public.flagged_moments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Restrict social_posts SELECT to admin only
DROP POLICY IF EXISTS "Anyone can view social posts" ON public.social_posts;
CREATE POLICY "Admins can view social posts"
  ON public.social_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));