-- ==========================================================
-- Test helpers: reusable functions for pgTAP tests
-- ==========================================================

BEGIN;
SELECT plan(1);
SELECT pass('Helper functions loaded');
SELECT * FROM finish();
ROLLBACK;

CREATE SCHEMA IF NOT EXISTS tests;
GRANT USAGE ON SCHEMA tests TO anon, authenticated, service_role;

-- Insert a user into auth.users, which fires the handle_new_user trigger
-- and creates a corresponding row in public.profiles.
-- Returns the new user's UUID.
CREATE OR REPLACE FUNCTION tests.create_supabase_user(
  _email text,
  _password text DEFAULT 'password123',
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  _uid uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    role,
    aud,
    created_at,
    updated_at,
    confirmation_token
  ) VALUES (
    _uid,
    '00000000-0000-0000-0000-000000000000',
    _email,
    crypt(_password, gen_salt('bf')),
    now(),
    _metadata,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now(),
    ''
  );
  RETURN _uid;
END;
$$;

-- Simulate an authenticated request as a specific user.
-- Sets the Postgres role and JWT claims so RLS policies evaluate correctly.
CREATE OR REPLACE FUNCTION tests.authenticate_as(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', _user_id, 'role', 'authenticated')::text,
    true
  );
  PERFORM set_config('request.jwt.claim.sub', _user_id::text, true);
END;
$$;

-- Simulate an anonymous (unauthenticated) request.
CREATE OR REPLACE FUNCTION tests.authenticate_as_anon()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;

-- Reset to superuser role (for setup/teardown between tests).
CREATE OR REPLACE FUNCTION tests.clear_auth()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('role', 'postgres', true);
  PERFORM set_config('request.jwt.claims', '', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tests TO anon, authenticated, service_role;
