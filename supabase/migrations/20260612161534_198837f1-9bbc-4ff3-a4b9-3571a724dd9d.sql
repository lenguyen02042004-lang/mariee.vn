
-- couple_gallery: remove anon/public SELECT; data is served only through server functions
DROP POLICY IF EXISTS gallery_public_read ON public.couple_gallery;

-- vendor_products: tighten public read to approved + visible vendors
DROP POLICY IF EXISTS products_public_read ON public.vendor_products;
CREATE POLICY products_public_read ON public.vendor_products
  FOR SELECT
  USING (
    (
      is_active = true
      AND EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id = vendor_products.vendor_id
          AND v.is_approved = true
          AND v.is_hidden_by_owner = false
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = vendor_products.vendor_id
        AND v.owner_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- payment_settings: explicit restrictive policy ensuring only admins can SELECT,
-- even if a future permissive policy is added accidentally.
DROP POLICY IF EXISTS psettings_deny_non_admin_read ON public.payment_settings;
CREATE POLICY psettings_deny_non_admin_read ON public.payment_settings
  AS RESTRICTIVE
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
