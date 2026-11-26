# Folio

A minimal, distraction-free log of the movies and TV shows you have watched.

## Features

- Email sign-in, password reset and change, a profile page and account deletion
- Search movies and TV shows (TMDB) and mark them as watched
- History with type filter, title search, pagination and removal with confirmation
- Track the latest watched season and episode of TV shows
- **Continue**: the next episode of each show you follow, with a link to it (filled in by the Folio Tracker browser extension)
- CSV export of your full history
- Dark (default) and light themes

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, React Query |
| Auth and database | Supabase (Auth + PostgreSQL with Row Level Security) |
| TMDB proxy | Cloudflare Worker (keeps the API token off the client) |

## Project structure

```
folio/
├─ src/
│  ├─ api/          TMDB and Supabase calls
│  ├─ components/   Reusable UI
│  ├─ context/      Auth state
│  ├─ hooks/        Data and UI hooks
│  ├─ lib/          Supabase client, CSV
│  ├─ pages/        Route screens
│  └─ types/
├─ worker/          Cloudflare Worker (TMDB proxy)
├─ supabase/        schema.sql and migrations/
├─ docs/            Deployment and Git workflow guides
└─ .github/         CI and Worker deploy workflows
```

## Getting started

**Requirements:** Node 20+, and free accounts on [Supabase](https://supabase.com), [TMDB](https://www.themoviedb.org) and [Cloudflare](https://cloudflare.com).

1. **Install**
   ```bash
   npm install
   cd worker && npm install && cd ..
   ```
2. **Supabase.** Create a project and run `supabase/schema.sql` in the SQL editor. (Upgrading an existing project? Run `supabase/migrations/*.sql` in order instead.) Under *Authentication > URL Configuration*, set the Site URL to `http://localhost:5173` and add `http://localhost:5173/reset-password` to Redirect URLs. For quicker local testing, you can turn off *Confirm email* under Auth > Providers > Email.
3. **TMDB proxy.** Copy your TMDB *API Read Access Token* into `worker/.dev.vars` (see `worker/.dev.vars.example`), then start the Worker:
   ```bash
   cd worker && npm run dev        # http://localhost:8787
   ```
4. **Frontend.** In a second terminal:
   ```bash
   cp .env.example .env            # fill in the values below
   npm run dev                     # http://localhost:5173
   ```

## Environment variables

| Variable | Where | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` | Supabase anon (public) key |
| `VITE_TMDB_PROXY_URL` | `.env` | Worker URL, e.g. `http://localhost:8787` |
| `TMDB_TOKEN` | Worker secret / `worker/.dev.vars` | TMDB API Read Access Token |
| `ALLOWED_ORIGIN` | `worker/wrangler.toml` | Comma-separated origins allowed to call the Worker |

Never commit `.env` or `.dev.vars`; both are git-ignored.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `cd worker && npm run dev` | Run the Worker locally |
| `cd worker && npm run deploy` | Deploy the Worker |

## Deployment and workflow

- [Deployment guide](docs/deployment.md): Cloudflare Worker, Supabase and Cloudflare Pages
- [Git workflow](docs/git-workflow.md): branches, commits, pull requests and releases

## Notes

- **Continue** is stored in `continue_watching` (one row per show: season, episode, the page URL and a `manual` flag). The Folio Tracker extension writes it, including the next episode after you finish one; the web app lists it and lets you remove entries. Automatic entries are only allowed for shows tracked in History (a season recorded), and the database refuses anything else; entries the user adds by hand (`manual`) are exempt. Triggers drop an entry once your progress reaches it or finishes its season, and drop automatic ones when you clear the progress or remove the show from History.
- **Season progress**: a progress with a season and no episode means that season is finished (the extension stores a season's last episode that way). Leaving the episode empty in the progress dialog therefore marks the whole season as watched for Continue.
- **Anime** has no separate category. It appears under Movies or TV shows by TMDB type.
- **TV progress** is stored as `last_season` (required) and `last_episode` (optional) on each TV entry. Set it from the ⋮ menu on a History card; it appears as a short label such as `S3E3` on the poster.
- **Deleting an account** runs a `security definer` function that removes the user; your history is deleted with it.
- **Security:** the TMDB token exists only in the Worker. The Supabase anon key is public by design; Row Level Security restricts every table to its owner.
