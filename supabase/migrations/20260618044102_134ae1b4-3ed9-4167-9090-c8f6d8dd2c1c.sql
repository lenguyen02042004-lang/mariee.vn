
-- Tighten RLS role scoping from public to authenticated where appropriate

-- couples
ALTER POLICY couples_admin_all ON public.couples TO authenticated;
ALTER POLICY couples_owner_read ON public.couples TO authenticated;
ALTER POLICY couples_owner_update ON public.couples TO authenticated;

-- rsvp (keep rsvp_anyone_insert open to public for guest submissions)
ALTER POLICY rsvp_admin_manage ON public.rsvp TO authenticated;
ALTER POLICY rsvp_admin_read ON public.rsvp TO authenticated;

-- vendors (keep vendors_admin_delete restricted to authenticated)
ALTER POLICY vendors_admin_delete ON public.vendors TO authenticated;
ALTER POLICY vendors_owner_insert ON public.vendors TO authenticated;
ALTER POLICY vendors_owner_update ON public.vendors TO authenticated;
