# Deployment

Folio has three deployed parts. Set them up in this order, because each needs the previous one's URL.

| Part | Host | Deploys from |
| --- | --- | --- |
| TMDB proxy | Cloudflare Workers | `worker/` |
| Database and auth | Supabase | `supabase/schema.sql` |
| Frontend | Cloudflare Pages | repository root |

## 1. Cloudflare Worker (TMDB proxy)

```bash
cd worker
npx wrangler login
npx wrangler secret put TMDB_TOKEN     # paste your TMDB API Read Access Token
npx wrangler deploy
```

Note the URL it prints, e.g. `https://folio-tmdb-proxy.<you>.workers.dev`. You'll add your frontend origin to `ALLOWED_ORIGIN` in step 4.

## 2. Supabase

Use a separate Supabase project for production if you can.

1. Run `supabase/schema.sql` in the SQL editor.
2. *Authentication > Providers > Email*: keep **Confirm email** on.
3. *Authentication > SMTP Settings*: add a custom SMTP provider. Supabase's built-in email is heavily rate-limited and not meant for production.
4. Copy the project URL and anon key (*Settings > API*).

## 3. Cloudflare Pages (frontend)

1. *Workers & Pages > Create > Pages > Connect to Git*, and pick the repository.
2. Build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | Vite |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

3. Environment variables (Production, and Preview if you want previews to work):

   | Variable | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `VITE_TMDB_PROXY_URL` | your Worker URL (no trailing slash) |
   | `NODE_VERSION` | `20` |

4. Deploy. Pages serves `index.html` for unknown paths, so routes like `/history` work on refresh.

Vite bakes `VITE_*` values in at build time, so after changing one, trigger a new deploy.

## 4. Connect the parts

Using your Pages URL (e.g. `https://folio.pages.dev` or your custom domain):

1. **Worker:** set `ALLOWED_ORIGIN` in `worker/wrangler.toml` to that origin (comma-separate several), then `npx wrangler deploy`. Without this, search fails with a CORS error.
2. **Supabase:** in *Authentication > URL Configuration*, set **Site URL** to the Pages URL and add `<Pages URL>/reset-password` to **Redirect URLs**. Without this, password-reset emails won't work.

Preview deployments get their own `*.pages.dev` origin. Add one to `ALLOWED_ORIGIN` if you need search on a preview.

## 5. Custom domain (optional)

In the Pages project, *Custom domains > Set up a domain*. Then repeat step 4 with the new origin.

## 6. Automatic deploys

- **Frontend:** every push to `main` deploys to production, and every pull request gets a preview (Cloudflare Pages Git integration).
- **Worker:** `.github/workflows/deploy-worker.yml` redeploys when `worker/**` changes on `main`. Add two repository secrets under *Settings > Secrets and variables > Actions*:
  - `CLOUDFLARE_API_TOKEN`: create one from the "Edit Cloudflare Workers" template
  - `CLOUDFLARE_ACCOUNT_ID`: shown in the Cloudflare dashboard sidebar
- **Database:** applied manually (see [Git workflow](git-workflow.md#4-database-changes)). Run migrations before deploying code that needs them.

## 7. Verify a release

- Sign up, confirm the email, sign in (try both email and username).
- Search a title, mark it as watched, then find it in History.
- Request a password reset and follow the link.
- Export the CSV from Settings.

## Rollback

- **Frontend:** Pages project > *Deployments* > pick a previous deployment > *Rollback to this deployment*.
- **Worker:** `cd worker && npx wrangler rollback`.
- **Database:** write a new migration that reverses the change; don't edit applied migrations.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Search says "Could not reach the search service" | `VITE_TMDB_PROXY_URL` wrong, or the Pages origin is missing from `ALLOWED_ORIGIN` |
| Search says "unavailable right now" | `TMDB_TOKEN` secret missing or invalid |
| Reset email link goes to the wrong site or errors | Supabase Site URL or Redirect URLs not updated |
| Blank page after deploy | `VITE_SUPABASE_*` variables not set in Pages (check the browser console) |
| Sign-up fails with a database error | `schema.sql` not run on this Supabase project |
