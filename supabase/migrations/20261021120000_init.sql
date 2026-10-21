-- ABCDrone initial schema: user profiles with roles, and the drone registry.
--
-- How to apply: Supabase dashboard → SQL Editor → paste this file → Run.
-- (Or, with the Supabase CLI linked to your project: `supabase db push`.)
--
-- Security model:
--   * Every signed-up user gets a `profiles` row with role 'patient'.
--   * Clinic access is granted by an admin, never by the user:
--       update public.profiles set role = 'clinic'
--       where id = (select id from auth.users where email = 'someone@duke.edu');
--   * Only clinic users can read drones. Nobody can write to profiles or
--     drones from the browser; manage them from the dashboard / SQL editor.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('clinic', 'patient');

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role         public.user_role not null default 'patient',
  created_at   timestamptz not null default now()
);

comment on table public.profiles is 'One row per auth user. role decides what the user can see.';

alter table public.profiles enable row level security;

-- Users can read their own profile (the app needs it to know their role).
-- There are deliberately no insert/update/delete policies, so users can't
-- change their own role. The trigger below creates rows instead.
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- Create a profile automatically whenever someone signs up
-- (email/password or Google).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users who signed up before this migration ran.
insert into public.profiles (id, display_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', email)
from auth.users
on conflict (id) do nothing;

-- True if the signed-in user is clinic staff. `security definer` lets
-- policies on other tables call it without needing access to profiles.
create function public.is_clinic()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'clinic'
  );
$$;

-- ---------------------------------------------------------------------------
-- Drones
-- ---------------------------------------------------------------------------

create table public.drones (
  -- Short readable slug, used in URLs (/drones/blue-devil-1).
  id                    text primary key check (id ~ '^[a-z0-9-]+$'),
  name                  text not null,
  -- The ThingSpeak channel this drone's carrier writes to.
  thingspeak_channel_id text not null unique,
  -- Defaults: Duke University Hospital, Durham NC.
  home_base_lat         double precision not null default 36.0074,
  home_base_lng         double precision not null default -78.9378,
  created_at            timestamptz not null default now()
);

comment on table public.drones is 'Drone registry. One ThingSpeak channel per drone.';

alter table public.drones enable row level security;

create policy "Clinic staff can read drones"
  on public.drones for select
  to authenticated
  using ((select public.is_clinic()));

-- Example (run separately, with your real channel id):
--   insert into public.drones (id, name, thingspeak_channel_id)
--   values ('blue-devil-1', 'Blue Devil 1', '1234567');
