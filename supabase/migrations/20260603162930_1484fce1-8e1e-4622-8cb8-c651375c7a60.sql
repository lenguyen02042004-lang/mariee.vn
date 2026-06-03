-- 1) Couple owners can read their own RSVPs
CREATE POLICY "rsvp_couple_owner_read" ON public.rsvp
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.couples c
    WHERE c.id = rsvp.couple_id AND c.owner_id = auth.uid()
  ));

-- 2) Prevent vendor owners from self-approving / self-featuring / changing plan
CREATE OR REPLACE FUNCTION public.vendors_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.is_approved     IS DISTINCT FROM OLD.is_approved
   OR NEW.is_featured    IS DISTINCT FROM OLD.is_featured
   OR NEW.plan_id        IS DISTINCT FROM OLD.plan_id
   OR NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at
   OR NEW.owner_id       IS DISTINCT FROM OLD.owner_id
  THEN
    RAISE EXCEPTION 'Only admins can modify approval, featured, plan or owner fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendors_guard_update_trg ON public.vendors;
CREATE TRIGGER vendors_guard_update_trg
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.vendors_guard_update();