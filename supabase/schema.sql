-- Folio: run in Supabase Dashboard > SQL Editor (safe to re-run)

-- ───────── Watch history ─────────
create table if not exists public.watch_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  media_id      integer not null,                         -- TMDB id
  media_type    text not null check (media_type in ('movie', 'tv')),
  title         text not null,                            -- snapshot so history renders without calling TMDB
  poster_path   text,
  release_year  integer,
  watched_at    timestamptz not null default now(),
  unique (user_id, media_id, media_type)
);

create index if not exists watch_history_user_recent_idx
  on public.watch_history (user_id, watched_at desc);

alter table public.watch_history enable row level security;

drop policy if exists "Read own history"   on public.watch_history;
drop policy if exists "Insert own history" on public.watch_history;
drop policy if exists "Update own history" on public.watch_history;
drop policy if exists "Delete own history" on public.watch_history;
create policy "Read own history"   on public.watch_history for select using (auth.uid() = user_id);
create policy "Insert own history" on public.watch_history for insert with check (auth.uid() = user_id);
create policy "Update own history" on public.watch_history for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own history" on public.watch_history for delete using (auth.uid() = user_id);

-- ───────── Profiles ─────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),  -- always stored lowercase
  display_name  text not null check (char_length(display_name) between 1 and 40),
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Read own profile"   on public.profiles;
drop policy if exists "Update own profile" on public.profiles;
create policy "Read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Create the profile when a user signs up, using the metadata the app sends.
-- Done in a trigger so it also works when email confirmation is on (no session yet).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(lower(new.raw_user_meta_data->>'username'), 'user_' || substr(replace(new.id::text, '-', ''), 1, 8)),
    coalesce(nullif(left(new.raw_user_meta_data->>'display_name', 40), ''), nullif(split_part(new.email, '@', 1), ''), 'Folio user')
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts created before profiles existed.
insert into public.profiles (id, username, display_name)
select id,
       'user_' || substr(replace(id::text, '-', ''), 1, 8),
       coalesce(nullif(left(split_part(email, '@', 1), 40), ''), 'Folio user')
from auth.users
on conflict (id) do nothing;

-- ───────── Functions called from the app ─────────

-- Is this username free? (used on sign-up and when editing the profile)
create or replace function public.username_available(p_username text)
returns boolean language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where username = lower(p_username));
$$;

-- Lets people sign in with a username: resolves it to the account's email.
-- Callable before login, so it is the one place usernames map to emails (see README).
create or replace function public.email_for_username(p_username text)
returns text language sql stable security definer set search_path = public, auth as $$
  select u.email::text from auth.users u join public.profiles p on p.id = u.id
  where p.username = lower(p_username);
$$;

-- Permanently deletes the caller's account. Profile and history go with it (on delete cascade).
create or replace function public.delete_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  delete from auth.users where id = auth.uid();
end; $$;

revoke all on function public.username_available(text) from public;
revoke all on function public.email_for_username(text) from public;
revoke all on function public.delete_account()         from public;
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.email_for_username(text) to anon, authenticated;
grant execute on function public.delete_account()         to authenticated;
