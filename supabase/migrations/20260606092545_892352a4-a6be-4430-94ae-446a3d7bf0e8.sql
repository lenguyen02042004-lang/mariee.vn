
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limits_bucket_key_time_idx
  ON public.rate_limits (bucket, key, created_at DESC);

GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_admin_read"
  ON public.rate_limits FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.rate_limit_check(
  _bucket text,
  _key text,
  _limit int,
  _window_seconds int
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count int;
BEGIN
  DELETE FROM public.rate_limits
    WHERE created_at < now() - make_interval(secs => _window_seconds * 4);

  SELECT count(*) INTO _count
    FROM public.rate_limits
    WHERE bucket = _bucket
      AND key = _key
      AND created_at > now() - make_interval(secs => _window_seconds);

  IF _count >= _limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits (bucket, key) VALUES (_bucket, _key);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_check(text, text, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, text, int, int) TO service_role;
