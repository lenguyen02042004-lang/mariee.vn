
-- Tighten couple_wishes public read to only published couples
DROP POLICY IF EXISTS wishes_public_read ON public.couple_wishes;
CREATE POLICY wishes_public_read ON public.couple_wishes
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    is_approved = true
    AND EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_wishes.couple_id AND c.is_published = true
    )
  )
);

-- Allow vendor owners to read their own payments via Data API
CREATE POLICY pay_owner_read ON public.vendor_payments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = vendor_payments.vendor_id AND v.owner_id = auth.uid()
  )
);

-- Public read of non-sensitive site_settings (branding + public tracking IDs)
CREATE POLICY site_settings_public_read ON public.site_settings
FOR SELECT TO anon, authenticated
USING (true);

GRANT SELECT ON public.site_settings TO anon;
