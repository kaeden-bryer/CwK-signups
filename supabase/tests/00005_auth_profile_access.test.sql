-- ==========================================================
-- Test: profile access via RLS (validates DB layer is sound
--       for the /profile page — redirect issues are app-level)
-- ==========================================================

BEGIN;

SELECT plan(7);

-- ---- Setup ----

SELECT tests.create_supabase_user(
  'profile_user@example.com', 'password123', '{"username":"profile_user"}'::jsonb
);

SELECT tests.create_supabase_user(
  'other_user@example.com', 'password123', '{"username":"other_user"}'::jsonb
);

-- ---- Tests ----

-- 1. User can read their own profile
SELECT tests.authenticate_as(
  (SELECT id FROM public.profiles WHERE email = 'profile_user@example.com')
);

SELECT ok(
  EXISTS(SELECT 1 FROM public.profiles WHERE email = 'profile_user@example.com'),
  'Authenticated user can read their own profile'
);

-- 2. Profile has all expected fields populated
SELECT is(
  (SELECT username FROM public.profiles WHERE email = 'profile_user@example.com'),
  'profile_user',
  'Profile username is correct'
);

SELECT is(
  (SELECT avatar_url FROM public.profiles WHERE email = 'profile_user@example.com'),
  '/defaults/avatar.svg',
  'Profile avatar_url is set'
);

SELECT is(
  (SELECT banner_url FROM public.profiles WHERE email = 'profile_user@example.com'),
  '/defaults/banner.svg',
  'Profile banner_url is set'
);

-- 3. User can update their own profile
SELECT lives_ok(
  $$UPDATE public.profiles SET full_name = 'Test User'
    WHERE email = 'profile_user@example.com'$$,
  'User can update their own profile'
);

SELECT is(
  (SELECT full_name FROM public.profiles WHERE email = 'profile_user@example.com'),
  'Test User',
  'Profile full_name is updated correctly'
);

SELECT tests.clear_auth();

-- 4. Anon can check username availability (the "Anyone can check username" policy)
SELECT tests.authenticate_as_anon();

SELECT ok(
  EXISTS(SELECT 1 FROM public.profiles WHERE username = 'profile_user'),
  'Anon can query profiles by username (availability check)'
);

SELECT tests.clear_auth();

SELECT * FROM finish();

ROLLBACK;
