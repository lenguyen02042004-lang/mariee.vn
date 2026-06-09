-- Restrict payment_settings reads to admins; the app reads it server-side via supabaseAdmin (service role) which bypasses RLS.
DROP POLICY IF EXISTS psettings_authenticated_read ON public.payment_settings;

-- Harden vendor_payments owner insert: enforce status='pending' and that referenced plan is active.
DROP POLICY IF EXISTS pay_owner_insert ON public.vendor_payments;
CREATE POLICY pay_owner_insert ON public.vendor_payments
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_payments.vendor_id AND v.owner_id = auth.uid())
    AND status = 'pending'
    AND EXISTS (SELECT 1 FROM public.vendor_plans p WHERE p.id = vendor_payments.plan_id AND p.is_active = true)
  );