-- ============================================================
-- Add username, avatar, and banner to profiles
-- ============================================================

-- 1. Add new columns
alter table public.profiles
  add column username   text,
  add column avatar_url text not null default '/defaults/avatar.svg',
  add column banner_url text not null default '/defaults/banner.svg';

-- Backfill existing rows with a username derived from their id
update public.profiles
  set username = 'user_' || left(id::text, 8)
  where username is null;

-- Now make username non-nullable and unique
alter table public.profiles
  alter column username set not null;

alter table public.profiles
  add constraint profiles_username_unique unique (username);

create index idx_profiles_username on public.profiles(username);

-- 2. Allow anyone to check if a username is taken (for signup validation)
create policy "Anyone can check username availability"
  on public.profiles for select
  using (true);

-- 3. Update the trigger to populate username and avatar/banner defaults
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  _is_admin boolean := false;
begin
  if exists (
    select 1 from public.admin_invites
    where email = new.email and accepted = false
  ) then
    _is_admin := true;
    update public.admin_invites
      set accepted = true
      where email = new.email and accepted = false;
  end if;

  insert into public.profiles (id, full_name, email, username, avatar_url, banner_url, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8)),
    '/defaults/avatar.svg',
    '/defaults/banner.svg',
    _is_admin
  );
  return new;
end;
$$;
