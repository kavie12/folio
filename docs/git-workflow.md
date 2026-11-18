# Git workflow

A simple trunk-based flow: `main` is always deployable, and all work happens on short-lived branches.

## 1. First-time setup

```bash
git init -b main
git add .
git status                      # confirm .env, .dev.vars and node_modules are NOT listed
git commit -m "chore: initial commit"
```

Create an empty repository on GitHub (no README or .gitignore), then:

```bash
git remote add origin git@github.com:<you>/folio.git
git push -u origin main
```

Commit `package-lock.json` too; CI uses `npm ci` and needs it.

**Never commit secrets.** `.env`, `worker/.dev.vars` and `.wrangler/` are already in `.gitignore`. If a secret is ever pushed, rotate it (new TMDB token, new Supabase key) rather than just deleting the commit.

## 2. Protect `main`

On GitHub: _Settings > Branches > Add rule_ for `main`:

- Require a pull request before merging
- Require the **CI / build** status check to pass
- Optional: require linear history (pairs well with squash merging)

## 3. Day-to-day

```bash
git switch main && git pull
git switch -c feat/history-search     # branch from an up-to-date main
# ...work, then commit in small steps...
git add -p
git commit -m "feat: search history by title"
git push -u origin feat/history-search
```

Open a pull request. CI type-checks and builds it, and Cloudflare Pages builds a preview. Merge with **Squash and merge**, then delete the branch.

### Branch names

`feat/...` new behaviour, `fix/...` bug fix, `chore/...` tooling or deps, `docs/...` documentation.

### Commit messages ([Conventional Commits](https://www.conventionalcommits.org))

```
feat: add CSV export
fix: clamp history page after last item is removed
chore: bump vite
docs: explain Worker deployment
```

Present tense, lowercase, under about 70 characters. Add a body when the _why_ isn't obvious.

## 4. Database changes

`supabase/schema.sql` is written to be re-run safely. When the schema changes later:

1. Add a numbered file such as `supabase/migrations/002_add_notes.sql` containing only the change.
2. Apply it in the Supabase SQL editor (or with the Supabase CLI).
3. Commit the file in the same pull request as the code that needs it.

Deploy the migration **before** the code that depends on it.

## 5. Releases and versions

Use [semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

```bash
npm version minor               # bumps package.json, commits and tags v1.1.0
git push --follow-tags
```

Then create a GitHub Release from the tag (_Releases > Draft a new release_) and generate the notes from merged pull requests.

## 6. Hotfixes and undoing

- **Hotfix:** branch from `main` as `fix/...`, open a PR, merge, and deploy as usual.
- **Undo a merged change:** `git revert <commit>` on a new branch and open a PR. Don't rewrite `main`'s history.
