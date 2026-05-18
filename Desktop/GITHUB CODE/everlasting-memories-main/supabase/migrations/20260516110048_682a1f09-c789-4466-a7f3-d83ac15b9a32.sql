
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "rsvp_anyone_insert" ON public.rsvp;
CREATE POLICY "rsvp_anyone_insert" ON public.rsvp FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_id AND c.is_published = true));
