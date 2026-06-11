-- Remove broad anon SELECT policies on couples and vendors.
-- All public reads now go through server functions using the service role
-- (supabaseAdmin), which can apply column- and row-level filtering and
-- prevents anonymous enumeration of bank account numbers, vendor contact
-- info, and other sensitive fields via the Data API.
DROP POLICY IF EXISTS couples_public_read ON public.couples;
DROP POLICY IF EXISTS vendors_public_read ON public.vendors;

-- Re-create owner/admin SELECT policies if missing so authenticated owners
-- and admins can still read their rows directly (owners already have
-- couples_owner_read; vendors needs an explicit owner/admin SELECT now that
-- the public policy is gone).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='vendors'
      AND policyname='vendors_owner_admin_read'
  ) THEN
    CREATE POLICY vendors_owner_admin_read ON public.vendors
      FOR SELECT TO authenticated
      USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;