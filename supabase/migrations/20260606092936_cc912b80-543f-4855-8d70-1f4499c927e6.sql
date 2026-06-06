
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS is_hidden_by_owner boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS vendors_public_read ON public.vendors;

CREATE POLICY vendors_public_read ON public.vendors
  FOR SELECT
  USING (
    (is_approved = true AND is_hidden_by_owner = false)
    OR (auth.uid() = owner_id)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );
