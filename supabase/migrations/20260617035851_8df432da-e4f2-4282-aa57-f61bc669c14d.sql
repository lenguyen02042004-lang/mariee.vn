DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
REVOKE SELECT ON public.site_settings FROM anon;