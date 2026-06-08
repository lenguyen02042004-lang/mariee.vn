-- 1) Lock down site_settings: drop public read (app uses service_role via server fn)
DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;

CREATE POLICY site_settings_admin_read ON public.site_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE SELECT ON public.site_settings FROM anon;

-- 2) Make error_logs INSERT denial explicit for non-service roles
CREATE POLICY error_logs_no_insert ON public.error_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

REVOKE INSERT, UPDATE ON public.error_logs FROM anon, authenticated;