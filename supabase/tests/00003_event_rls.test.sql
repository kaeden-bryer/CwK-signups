-- ==========================================================
-- Test: RLS policies on the events table
-- ==========================================================

BEGIN;

SELECT plan(7);

-- ---- Setup ----

-- Create an admin user (via invite)
INSERT INTO public.admin_invites (email) VALUES ('ev_admin@example.com');
SELECT tests.create_supabase_user(
  'ev_admin@example.com', 'password123', '{"username":"ev_admin"}'::jsonb
);

-- Create a regular user
SELECT tests.create_supabase_user(
  'ev_regular@example.com', 'password123', '{"username":"ev_regular"}'::jsonb
);

-- Seed an event as superuser so we have something to query
INSERT INTO public.events (id, facility, event_date, start_time, capacity, created_by)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Test Facility',
  '2026-06-01',
  '09:00',
  20,
  (SELECT id FROM public.profiles WHERE email = 'ev_admin@example.com')
);

-- ---- Tests ----

-- 1. Anyone (anon) can view events
SELECT tests.authenticate_as_anon();

SELECT ok(
  EXISTS(SELECT 1 FROM public.events WHERE facility = 'Test Facility'),
  'Anon users can view events'
);

-- 2. Admin can insert events
SELECT tests.authenticate_as(
  (SELECT id FROM public.profiles WHERE email = 'ev_admin@example.com')
);

SELECT lives_ok(
  $$INSERT INTO public.events (facility, event_date, start_time, capacity, created_by)
    VALUES ('Admin Event', '2026-07-01', '10:00', 15,
            (SELECT id FROM public.profiles WHERE email = 'ev_admin@example.com'))$$,
  'Admin can insert events'
);

-- 3. Admin can update events
SELECT lives_ok(
  $$UPDATE public.events SET facility = 'Updated Facility'
    WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  'Admin can update events'
);

-- 4. Admin can delete events (delete the one they just created)
SELECT lives_ok(
  $$DELETE FROM public.events WHERE facility = 'Admin Event'$$,
  'Admin can delete events'
);

-- 5. Non-admin cannot insert events
SELECT tests.authenticate_as(
  (SELECT id FROM public.profiles WHERE email = 'ev_regular@example.com')
);

SELECT throws_ok(
  $$INSERT INTO public.events (facility, event_date, start_time, capacity, created_by)
    VALUES ('Rogue Event', '2026-08-01', '10:00', 10,
            (SELECT id FROM public.profiles WHERE email = 'ev_regular@example.com'))$$,
  '42501',
  NULL,
  'Non-admin cannot insert events'
);

-- 6. Non-admin update silently affects 0 rows (RLS filters it out)
UPDATE public.events SET facility = 'Hacked'
  WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT is(
  (SELECT facility FROM public.events WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'Updated Facility',
  'Non-admin update does not modify the event'
);

-- 7. Non-admin can still view events
SELECT ok(
  EXISTS(SELECT 1 FROM public.events WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'Non-admin can still view events'
);

SELECT tests.clear_auth();

SELECT * FROM finish();

ROLLBACK;
