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

-- ───────── Continue (next episode to watch) ─────────
create table if not exists public.continue_watching (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  media_id      integer not null,                         -- TMDB TV id
  title         text not null,                            -- snapshot, like watch_history
  poster_path   text,
  release_year  integer,
  season        integer not null check (season  >= 1),    -- the episode to watch next
  episode       integer not null check (episode >= 1),
  url           text not null check (url ~* '^https?://' and char_length(url) <= 2048),
  updated_at    timestamptz not null default now(),
  unique (user_id, media_id)                              -- one "next episode" per show
);

create index if not exists continue_watching_user_recent_idx
  on public.continue_watching (user_id, updated_at desc);

alter table public.continue_watching enable row level security;

drop policy if exists "Read own continue"   on public.continue_watching;
drop policy if exists "Insert own continue" on public.continue_watching;
drop policy if exists "Update own continue" on public.continue_watching;
drop policy if exists "Delete own continue" on public.continue_watching;
create policy "Read own continue"   on public.continue_watching for select using (auth.uid() = user_id);
create policy "Insert own continue" on public.continue_watching for insert with check (auth.uid() = user_id);
create policy "Update own continue" on public.continue_watching for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own continue" on public.continue_watching for delete using (auth.uid() = user_id);

-- Keep Continue consistent no matter which app changed the history.

-- Once progress reaches (or passes) the saved episode, it is no longer "next".
create or replace function public.prune_continue_after_progress()
returns trigger language plpgsql as $$
begin
  if new.media_type = 'tv' then
    if new.last_season is null then
      delete from public.continue_watching where user_id = new.user_id and media_id = new.media_id;
    else
      -- progress reached (or passed) the saved episode: it is no longer "next"
      delete from public.continue_watching c
      where c.user_id = new.user_id
        and c.media_id = new.media_id
        and (c.season < new.last_season
             or (c.season = new.last_season and c.episode <= coalesce(new.last_episode, 0)));
    end if;
  end if;
  return null;
end; $$;

drop trigger if exists watch_history_prune_continue on public.watch_history;
create trigger watch_history_prune_continue
  after insert or update of last_season, last_episode on public.watch_history
  for each row execute function public.prune_continue_after_progress();

-- Removing a show from the history removes it from Continue.
create or replace function public.remove_continue_after_removal()
returns trigger language plpgsql as $$
begin
  if old.media_type = 'tv' then
    delete from public.continue_watching where user_id = old.user_id and media_id = old.media_id;
  end if;
  return null;
end; $$;

drop trigger if exists watch_history_remove_continue on public.watch_history;
create trigger watch_history_remove_continue
  after delete on public.watch_history
  for each row execute function public.remove_continue_after_removal();

-- Continue only holds shows that are tracked in the history (in it, with progress recorded).
create or replace function public.require_tracked_show()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from public.watch_history h
    where h.user_id = new.user_id and h.media_id = new.media_id
      and h.media_type = 'tv' and h.last_season is not null
  ) then
    raise exception 'This show is not tracked in the history' using errcode = 'check_violation';
  end if;
  return new;
end; $$;

drop trigger if exists continue_requires_history on public.continue_watching;
create trigger continue_requires_history
  before insert or update on public.continue_watching
  for each row execute function public.require_tracked_show();
