-- Folio: run in Supabase Dashboard > SQL Editor (safe to re-run).
-- Upgrading an existing project? Apply supabase/migrations/*.sql in order instead.

-- ───────── Watch history ─────────
create table if not exists public.watch_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  media_id      integer not null,                         -- TMDB id
  media_type    text not null check (media_type in ('movie', 'tv')),
  title         text not null,                            -- snapshot so history renders without calling TMDB
  poster_path   text,
  release_year  integer,
  last_season   integer check (last_season  >= 1),        -- TV only: latest watched season (required if an episode is set)...
  last_episode  integer check (last_episode >= 1),        -- ...and episode (optional)
  watched_at    timestamptz not null default now(),
  unique (user_id, media_id, media_type)
);

-- For databases created before TV progress existed
alter table public.watch_history
  add column if not exists last_season  integer check (last_season  >= 1),
  add column if not exists last_episode integer check (last_episode >= 1);

alter table public.watch_history drop constraint if exists watch_history_progress_check;
alter table public.watch_history add constraint watch_history_progress_check
  check ((last_episode is null or last_season is not null)
         and (media_type = 'tv' or (last_season is null and last_episode is null)));

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

-- ───────── Account deletion ─────────
-- Permanently deletes the caller's account. History goes with it (on delete cascade).
create or replace function public.delete_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  delete from auth.users where id = auth.uid();
end; $$;

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;
