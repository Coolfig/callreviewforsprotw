-- Fix notifications policies: scope INSERT/UPDATE/DELETE to authenticated only
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Restrict content_filters to admin only (edge functions use service_role key)
DROP POLICY IF EXISTS "Anyone can view content filters" ON public.content_filters;
CREATE POLICY "Admins can view content filters"
  ON public.content_filters FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix mutable search_path on functions that are missing it
CREATE OR REPLACE FUNCTION public.compute_comment_score()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
BEGIN
  NEW.score := COALESCE(NEW.likes_count, 0)
    + CASE WHEN NEW.rule_reference IS NOT NULL AND NEW.rule_reference != '' THEN 5 ELSE 0 END
    + CASE WHEN NEW.timestamp_reference IS NOT NULL AND NEW.timestamp_reference != '' THEN 3 ELSE 0 END;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$;

CREATE OR REPLACE FUNCTION public.update_comment_dislikes_count()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET dislikes_count = dislikes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;