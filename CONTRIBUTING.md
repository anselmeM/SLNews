# Contributing

Branch + PR workflow; `master` is protected (PR required, CI required). Vercel
deploys previews per PR and production on merge.

- Setup: `npm install`, then use the one-shot `npm run test:run` (npm test is vitest watch).
- Branch: `git switch -c <type>/<desc>` (feat/fix/docs/chore/refactor/test/security).
- Commit atomically with Conventional Commits; run local checks before pushing.
- PR: use the template; keep PRs small; wait for CI; merge with squash and delete the branch.

## PR checklist
- [ ] Conventional Commits, atomic changes
- [ ] Local checks pass (`npm run test:run`, `npm run typecheck`, `npm run lint`)
- [ ] CI green (`lint`, `test`, `typecheck`, `build`; `e2e` is known-red — note if unrelated)
- [ ] No secrets/PII or debug leftovers
- [ ] Tests added/updated for changed behavior
- [ ] Docs updated if workflow/API/env changed
