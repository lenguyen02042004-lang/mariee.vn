
ALTER TABLE public.couples
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS invitation_bride_url text,
  ADD COLUMN IF NOT EXISTS invitation_groom_url text,
  ADD COLUMN IF NOT EXISTS bride_party_time text,
  ADD COLUMN IF NOT EXISTS bride_party_venue text,
  ADD COLUMN IF NOT EXISTS bride_party_address text,
  ADD COLUMN IF NOT EXISTS groom_party_time text,
  ADD COLUMN IF NOT EXISTS groom_party_venue text,
  ADD COLUMN IF NOT EXISTS groom_party_address text;

CREATE INDEX IF NOT EXISTS couples_owner_id_idx ON public.couples(owner_id);

-- Allow owner to update own couple
DROP POLICY IF EXISTS couples_owner_update ON public.couples;
CREATE POLICY couples_owner_update ON public.couples
  FOR UPDATE TO public
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS couples_owner_read ON public.couples;
CREATE POLICY couples_owner_read ON public.couples
  FOR SELECT TO public
  USING (auth.uid() = owner_id);

-- Gallery: owner manages
DROP POLICY IF EXISTS gallery_owner_all ON public.couple_gallery;
CREATE POLICY gallery_owner_all ON public.couple_gallery
  FOR ALL TO public
  USING (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_gallery.couple_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_gallery.couple_id AND c.owner_id = auth.uid()));
