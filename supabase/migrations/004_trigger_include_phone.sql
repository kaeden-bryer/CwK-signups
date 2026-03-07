-- ============================================================
-- Include phone from user metadata in profile trigger
-- ============================================================

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

  insert into public.profiles (id, full_name, email, phone, username, avatar_url, banner_url, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8)),
    '/defaults/avatar.svg',
    '/defaults/banner.svg',
    _is_admin
  );
  return new;
end;
$$;
