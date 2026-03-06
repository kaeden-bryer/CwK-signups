-- ============================================================
-- Volunteer Sign-Up System — Initial Schema
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text not null,
  phone      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  _is_admin boolean := false;
begin
  -- Check if this email was invited as admin
  if exists (
    select 1 from public.admin_invites
    where email = new.email and accepted = false
  ) then
    _is_admin := true;
    update public.admin_invites
      set accepted = true
      where email = new.email and accepted = false;
  end if;

  insert into public.profiles (id, full_name, email, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    _is_admin
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. EVENTS
create table public.events (
  id                uuid primary key default gen_random_uuid(),
  facility          text not null,
  description       text,
  event_date        date not null,
  start_time        time not null,
  end_time          time,
  capacity          integer not null,
  loops_template_id text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Anyone can view events"
  on public.events for select
  using (true);

create policy "Admins can insert events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can update events"
  on public.events for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can delete events"
  on public.events for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );


-- 3. SIGNUPS
create table public.signups (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events(id) on delete cascade,
  user_id         uuid references public.profiles(id),
  volunteer_name  text not null,
  volunteer_email text not null,
  volunteer_phone text not null,
  status          text not null default 'confirmed'
                  check (status in ('confirmed', 'cancelled')),
  cancel_token    uuid unique default gen_random_uuid(),
  reminder_sent   boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.signups enable row level security;

-- Anyone (including anon) can create a signup
create policy "Anyone can insert signups"
  on public.signups for insert
  with check (true);

-- Authenticated users can view their own signups
create policy "Users can view own signups"
  on public.signups for select
  using (auth.uid() = user_id);

-- Admins can view all signups
create policy "Admins can view all signups"
  on public.signups for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Authenticated users can cancel their own signups
create policy "Users can update own signups"
  on public.signups for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can update any signup (for reminder_sent flag)
create policy "Admins can update all signups"
  on public.signups for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Allow anonymous reads by cancel_token (for guest cancellation)
create policy "Anyone can view signup by cancel_token"
  on public.signups for select
  using (cancel_token is not null);


-- 4. ADMIN INVITES
create table public.admin_invites (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  invited_by uuid references public.profiles(id),
  accepted   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_invites enable row level security;

create policy "Admins can view invites"
  on public.admin_invites for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can insert invites"
  on public.admin_invites for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );


-- 5. INDEXES
create index idx_signups_event_id on public.signups(event_id);
create index idx_signups_user_id on public.signups(user_id);
create index idx_signups_cancel_token on public.signups(cancel_token);
create index idx_events_event_date on public.events(event_date);
create index idx_signups_reminder on public.signups(reminder_sent, status, event_id);
