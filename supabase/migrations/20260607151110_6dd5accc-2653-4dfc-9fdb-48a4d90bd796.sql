-- Explicitly revoke write privileges from public roles; only service_role (used by the SECURITY DEFINER rate_limit_check RPC) may write.
REVOKE INSERT, UPDATE, DELETE ON public.rate_limits FROM anon, authenticated;

-- Add explicit deny policies so RLS posture is unambiguous to scanners and future maintainers.
DROP POLICY IF EXISTS "rate_limits_no_insert" ON public.rate_limits;
CREATE POLICY "rate_limits_no_insert" ON public.rate_limits
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "rate_limits_no_update" ON public.rate_limits;
CREATE POLICY "rate_limits_no_update" ON public.rate_limits
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "rate_limits_no_delete" ON public.rate_limits;
CREATE POLICY "rate_limits_no_delete" ON public.rate_limits
  FOR DELETE TO anon, authenticated USING (false);
