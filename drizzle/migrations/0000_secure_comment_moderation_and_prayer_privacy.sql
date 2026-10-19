-- A comment author may edit text, but never moderation state or ownership.
CREATE OR REPLACE FUNCTION public.guard_comment_moderation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  staff boolean := COALESCE(auth.role() = 'service_role', false)
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator');
BEGIN
  IF NOT staff THEN
    IF TG_OP = 'INSERT' AND NEW.status IS DISTINCT FROM 'pending' THEN
      RAISE EXCEPTION 'Comments must await moderation' USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'UPDATE' AND (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.user_id IS DISTINCT FROM OLD.user_id
      OR NEW.lesson_id IS DISTINCT FROM OLD.lesson_id
    ) THEN
      RAISE EXCEPTION 'Only staff may change moderation state or ownership' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_comment_moderation
BEFORE INSERT OR UPDATE ON public.lesson_comments
FOR EACH ROW EXECUTE FUNCTION public.guard_comment_moderation();

-- Column privileges are enforced by the Data API, not just the public UI.
REVOKE SELECT ON public.prayer_requests FROM anon, authenticated;
GRANT SELECT (id, display_name, body, is_anonymous, prayed_count, created_at, updated_at)
ON public.prayer_requests TO anon, authenticated;

-- Return only the caller's request IDs so the owner can still delete anonymous requests.
CREATE OR REPLACE FUNCTION public.own_prayer_request_ids()
RETURNS TABLE (id uuid)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id FROM public.prayer_requests p
  WHERE auth.uid() IS NOT NULL AND p.user_id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.own_prayer_request_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.own_prayer_request_ids() TO authenticated, service_role;

-- An anonymous flag must mask the display name even for direct API writes.
CREATE OR REPLACE FUNCTION public.mask_anonymous_prayer_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_anonymous THEN NEW.display_name := 'Anónimo'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER mask_anonymous_prayer_name
BEFORE INSERT OR UPDATE ON public.prayer_requests
FOR EACH ROW EXECUTE FUNCTION public.mask_anonymous_prayer_name();