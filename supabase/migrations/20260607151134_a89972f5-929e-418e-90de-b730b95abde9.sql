-- rate_limit_check is only invoked server-side via the service role; signed-in/anon users must not be able to call it directly.
REVOKE EXECUTE ON FUNCTION public.rate_limit_check(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, text, integer, integer) TO service_role;
