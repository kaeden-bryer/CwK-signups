-- ==========================================================
-- Test: handle_new_user trigger creates a correct profile
-- ==========================================================

BEGIN;

SELECT plan(6);

-- Create a regular user with username metadata
SELECT tests.create_supabase_user(
  'alice@example.com',
  'password123',
  '{"username": "alice_test"}'::jsonb
);

-- 1. Profile row exists
SELECT ok(
  EXISTS(SELECT 1 FROM public.profiles WHERE email = 'alice@example.com'),
  'Profile row is created when a user is inserted into auth.users'
);

-- 2. Username is pulled from raw_user_meta_data
SELECT is(
  (SELECT username FROM public.profiles WHERE email = 'alice@example.com'),
  'alice_test',
  'Username is set from user metadata'
);

-- 3. Default avatar_url
SELECT is(
  (SELECT avatar_url FROM public.profiles WHERE email = 'alice@example.com'),
  '/defaults/avatar.svg',
  'Default avatar_url is /defaults/avatar.svg'
);

-- 4. Default banner_url
SELECT is(
  (SELECT banner_url FROM public.profiles WHERE email = 'alice@example.com'),
  '/defaults/banner.svg',
  'Default banner_url is /defaults/banner.svg'
);

-- 5. is_admin defaults to false (no invite)
SELECT is(
  (SELECT is_admin FROM public.profiles WHERE email = 'alice@example.com'),
  false,
  'is_admin defaults to false when no admin invite exists'
);

-- 6. Fallback username when metadata has no username
SELECT tests.create_supabase_user(
  'bob@example.com',
  'password123',
  '{}'::jsonb
);

SELECT ok(
  (SELECT username FROM public.profiles WHERE email = 'bob@example.com') LIKE 'user_%',
  'Username falls back to user_<id-prefix> when not provided in metadata'
);

SELECT * FROM finish();

ROLLBACK;
