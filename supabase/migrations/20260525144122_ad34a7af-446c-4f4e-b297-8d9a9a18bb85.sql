
-- 1. Scope couple_gallery public read to published couples only
DROP POLICY IF EXISTS gallery_public_read ON public.couple_gallery;
CREATE POLICY gallery_public_read ON public.couple_gallery
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.couples c
    WHERE c.id = couple_gallery.couple_id AND c.is_published = true
  ));

-- 2. Restrict payment_settings read to authenticated users
DROP POLICY IF EXISTS psettings_public_read ON public.payment_settings;
CREATE POLICY psettings_authenticated_read ON public.payment_settings
  FOR SELECT
  TO authenticated
  USING (true);
