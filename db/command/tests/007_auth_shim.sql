-- CI-ONLY Supabase Auth shim.
-- In real Supabase, auth.uid() is supplied by the platform and the claim
-- originates from an authenticated request, NOT a caller-controlled SQL SET.
-- Never apply this fixture to any real Supabase database.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
