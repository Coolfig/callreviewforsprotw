REVOKE UPDATE ON public.comments FROM authenticated, anon;
GRANT UPDATE (content, rule_reference, timestamp_reference, updated_at) ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;