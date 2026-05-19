
CREATE OR REPLACE FUNCTION public.set_updated_at() 
RETURNS TRIGGER LANGUAGE PLPGSQL 
SECURITY INVOKER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
-- Revoke public execute on definer functions (they're used by RLS internally)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
