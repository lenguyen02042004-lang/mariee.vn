
-- 1. Prevent vendor owners from tampering with guest-submitted lead fields
CREATE OR REPLACE FUNCTION public.vendor_leads_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.guest_name    IS DISTINCT FROM OLD.guest_name
   OR NEW.guest_email  IS DISTINCT FROM OLD.guest_email
   OR NEW.guest_phone  IS DISTINCT FROM OLD.guest_phone
   OR NEW.event_date   IS DISTINCT FROM OLD.event_date
   OR NEW.message      IS DISTINCT FROM OLD.message
   OR NEW.vendor_id    IS DISTINCT FROM OLD.vendor_id
   OR NEW.created_at   IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Only the lead status can be modified';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendor_leads_guard_update ON public.vendor_leads;
CREATE TRIGGER vendor_leads_guard_update
BEFORE UPDATE ON public.vendor_leads
FOR EACH ROW EXECUTE FUNCTION public.vendor_leads_guard_update();

-- 2. Remove broad SELECT on storage.objects for wedding-media bucket
-- Files remain accessible via public URLs because the bucket itself is public.
DROP POLICY IF EXISTS wedding_media_public_read ON storage.objects;
