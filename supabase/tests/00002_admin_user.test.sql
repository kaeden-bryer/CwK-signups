-- ==========================================================
-- Test: admin user creation via admin_invites
-- ==========================================================

BEGIN;

SELECT plan(4);

-- Pre-create an admin invite for the email
INSERT INTO public.admin_invites (email)
VALUES ('admin@example.com');

-- Create a user whose email matches the invite
SELECT tests.create_supabase_user(
  'admin@example.com',
  'adminpass123',
  '{"username": "admin_user"}'::jsonb
);

-- 1. Profile should have is_admin = true
SELECT is(
  (SELECT is_admin FROM public.profiles WHERE email = 'admin@example.com'),
  true,
  'User with matching admin invite gets is_admin = true'
);

-- 2. The admin_invites row should be marked accepted
SELECT is(
  (SELECT accepted FROM public.admin_invites WHERE email = 'admin@example.com'),
  true,
  'Admin invite is marked accepted after user creation'
);

-- 3. A second user without an invite gets is_admin = false
SELECT tests.create_supabase_user(
  'regular@example.com',
  'password123',
  '{"username": "regular_user"}'::jsonb
);

SELECT is(
  (SELECT is_admin FROM public.profiles WHERE email = 'regular@example.com'),
  false,
  'User without admin invite gets is_admin = false'
);

-- 4. A second invite for a different email does not affect the first user
INSERT INTO public.admin_invites (email)
VALUES ('other_admin@example.com');

SELECT ok(
  NOT (SELECT accepted FROM public.admin_invites WHERE email = 'other_admin@example.com'),
  'Unrelated admin invite remains unaccepted'
);

SELECT * FROM finish();

ROLLBACK;
