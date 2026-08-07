# Git Workflow

> How this repo (and its sibling `SLNewsAPIScapper`) is managed. Enforced from
> project memory: **never commit/push directly to the default branch.**

## Branching model — GitHub Flow

- `master` is always deployable (Vercel auto-deploys on merge).
- Every change lives on a short-lived branch and lands via a **pull request**.
- No direct commits/pushes to `master`.

## Branch naming (conventional prefixes)

| Prefix | Use for |
|---|---|
| `feat/…` | new feature (e.g. `feat/home-mix`) |
| `fix/…` | bug fix (e.g. `fix/pin-app-to-legacy-api`) |
| `docs/…` | documentation (e.g. `docs/git-workflow`) |
| `chore/…` | tooling/maintenance (e.g. `chore/ci-tests`) |
| `refactor/…` | code restructuring, no behavior change |

## Standard loop

```bash
git checkout master && git pull          # start from latest
git checkout -b feat/my-change           # or fix/…, docs/…, chore/…
# … make changes, run checks (tsc, lint, tests) …
git add <files>                          # atomic commits: one logical change each
git commit -m "feat: concise summary"    # conventional commit message
git push -u origin feat/my-change        # push the BRANCH, never master
# open a PR -> squash-merge after review
```

## Commit messages (Conventional Commits)

`<type>(<scope>): <summary>` — types: `feat`, `fix`, `docs`, `chore`, `refactor`,
`perf`, `test`, `build`. Write a short imperative summary, then a body
explaining the *why* when useful (the repo's history already follows this).

## Merge strategy — squash

Merge PRs with **squash** so `master` history stays linear and each PR is one
commit. Rebase locally before opening a PR if `master` moved:

```bash
git fetch origin && git rebase origin/master   # update branch, linear history
git push --force-with-lease origin feat/my-change
```

## Hygiene rules

- `git push --force-with-lease` only on YOUR feature branch — never `--force`.
- Atomic commits: don't mix unrelated changes in one commit.
- Rebase only local/unpushed commits; never rewrite shared history.
- Reflog is your safety net: `git reflog` to recover from `reset`/mistakes.
- Clean up merged branches: `git branch -d <branch>` after the PR merges.

## Useful aliases (already set in this repo)

```bash
git st   # status -sb
git co   # checkout
git br   # branch -vv
git lg   # pretty one-line log
git up   # fetch + rebase current branch onto origin/master
```

## In-flight coordination (as of Aug 2026)

- App stays pinned to the legacy full-text scraper endpoint
  (`src/lib/scraper-client.ts` → `/api/news`) until Phase 2 gives it a
  full-text-scoped key. Do NOT point it at `/v1/news`.
- Merge order: app PR first (`fix/pin-app-to-legacy-api`), then the API PR
  (`feature/v1-news` → master in SLNewsAPIScapper).
