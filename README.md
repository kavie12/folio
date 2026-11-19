# Folio

A minimal, distraction-free log of the movies and TV shows you have watched.

## Features

- Search movies and TV shows (TMDB) and mark them as watched
- History with type filter, title search, pagination and removal with confirmation
- Track the latest watched season and episode of TV shows
- CSV export of your full history
- Email sign-in, password reset and change, a profile page and account deletion
- Light and dark themes

## Tech stack

| Layer             | Choice                                               |
| ----------------- | ---------------------------------------------------- |
| Frontend          | React, Vite, TypeScript, Tailwind CSS, React Query   |
| Auth and database | Supabase (Auth + PostgreSQL with Row Level Security) |
| TMDB proxy        | Cloudflare Worker                                    |

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
└─ .github/         CI and Worker deploy workflows
```

## Getting started

**Requirements:** Node 20+, and free accounts on [Supabase](https://supabase.com), [TMDB](https://www.themoviedb.org) and [Cloudflare](https://cloudflare.com).

1. **Install**
   ```bash
   npm install
   cd worker && npm install && cd ..
   ```
2. **Supabase.** Create a project and run `supabase/schema.sql` in the SQL editor. (Upgrading an existing project? Run `supabase/migrations/*.sql` in order instead.) Under _Authentication > URL Configuration_, set the Site URL to `http://localhost:5173` and add `http://localhost:5173/reset-password` to Redirect URLs. For quicker local testing, you can turn off _Confirm email_ under Auth > Providers > Email.
3. **TMDB proxy.** Copy your TMDB _API Read Access Token_ into `worker/.dev.vars` (see `worker/.dev.vars.example`), then start the Worker:
   ```bash
   cd worker && npm run dev        # http://localhost:8787
   ```
4. **Frontend.** In a second terminal:
   ```bash
   cp .env.example .env            # fill in the values below
   npm run dev                     # http://localhost:5173
   ```

## Environment variables

| Variable                 | Where                              | Description                                        |
| ------------------------ | ---------------------------------- | -------------------------------------------------- |
| `VITE_SUPABASE_URL`      | `.env`                             | Supabase project URL                               |
| `VITE_SUPABASE_ANON_KEY` | `.env`                             | Supabase anon (public) key                         |
| `VITE_TMDB_PROXY_URL`    | `.env`                             | Worker URL, e.g. `http://localhost:8787`           |
| `TMDB_TOKEN`             | Worker secret / `worker/.dev.vars` | TMDB API Read Access Token                         |
| `ALLOWED_ORIGIN`         | `worker/wrangler.toml`             | Comma-separated origins allowed to call the Worker |

Never commit `.env` or `.dev.vars`; both are git-ignored.

## Scripts

| Command                       | Does                               |
| ----------------------------- | ---------------------------------- |
| `npm run dev`                 | Start the dev server               |
| `npm run build`               | Type-check and build to `dist/`    |
| `npm run preview`             | Serve the production build locally |
| `cd worker && npm run dev`    | Run the Worker locally             |
| `cd worker && npm run deploy` | Deploy the Worker                  |
