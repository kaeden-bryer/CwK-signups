-- ============================================================
-- Fix infinite recursion in RLS policies
--
-- The "Admins can read all profiles" policy queries `profiles`
-- from within its own RLS evaluation, causing infinite recursion.
-- Replace inline admin checks with a SECURITY DEFINER function
-- that bypasses RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Profiles: replace admin-read policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Events: replace all admin policies
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin());

-- Signups: replace admin policies
DROP POLICY IF EXISTS "Admins can view all signups" ON public.signups;
CREATE POLICY "Admins can view all signups"
  ON public.signups FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all signups" ON public.signups;
CREATE POLICY "Admins can update all signups"
  ON public.signups FOR UPDATE
  USING (public.is_admin());

-- Admin invites: replace admin policies
DROP POLICY IF EXISTS "Admins can view invites" ON public.admin_invites;
CREATE POLICY "Admins can view invites"
  ON public.admin_invites FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert invites" ON public.admin_invites;
CREATE POLICY "Admins can insert invites"
  ON public.admin_invites FOR INSERT
  WITH CHECK (public.is_admin());
