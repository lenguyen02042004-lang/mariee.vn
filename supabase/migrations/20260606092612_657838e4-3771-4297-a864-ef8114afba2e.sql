
REVOKE EXECUTE ON FUNCTION public.rate_limit_check(text, text, int, int) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, text, int, int) TO service_role;
