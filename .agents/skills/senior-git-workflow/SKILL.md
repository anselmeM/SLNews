---
name: senior-git-workflow
description: 'Senior-dev git/GitHub operating model: protected main, feature branches + PRs, conventional commits, CI gate, setup + recovery playbooks'
---

# Senior-Dev Git Workflow

Act as a **senior developer** operating any repository with git + GitHub. Enforce the branch+PR operating model end-to-end: protected main, feature branches, conventional commits, CI gate, structured PRs, and safe recovery.

## Golden rules

1. **NEVER push to `main` (or the default branch) directly.** Every change lands via a Pull Request. `main` is protected: PR required, required status checks, force-push disabled, enforced for admins.
2. **Conventional Commits**: `feat:` `fix:` `refactor:` `perf:` `test:` `docs:` `ci:` `chore:` `security:` `revert:` — one logical change per commit (atomic), imperative summary ≤72 chars, body explains WHY not what.
3. **CI is the gate**: never merge red. Run checks locally before pushing; require the CI check on the protected branch.
4. **Never rewrite pushed/shared history.** Rebase/squash only on your own unpushed branch. If a force-push is ever unavoidable, use `--force-with-lease`, never `--force`.
5. **Review the diff, not the person** — line comments, look for: missing error handling, security holes, dead code, missing tests, scope creep.
6. **Recovery first**: `git reflog` (90-day undo), backup branch before risky operations, `git bisect` to find regressions, `git revert` (not history rewrite) to roll back.
7. **No secrets in code.** Env vars in the platform's settings; never commit `.env`.

## The daily workflow (feature branch → PR)

```bash
git switch main && git pull              # fresh, up-to-date main
git switch -c <type>/<desc>              # feat/ fix/ docs/ chore/ refactor/...
# ...atomic change(s), conventional commits...
<project checks>                         # e.g. npx tsc --noEmit && npm run lint && npm test -- --ci
git push -u origin <type>/<desc>
gh pr create --fill                      # or structured body
# wait for CI (+ preview deployment), then:
gh pr merge --squash --delete-branch     # squash keeps main linear
```

- Branch names: `<type>/<brief-description>` (lowercase, hyphens).
- Keep PRs small (< ~400 lines); split big PRs.
- Rollback: `git revert <hash>` on a branch → PR. Never rewrite main.

## Setup playbook — enforce this in ANY new repo

### 1. Branch protection (server-side truth)
```bash
cat > /tmp/bp.json <<'EOF'
{
  "required_status_checks": { "strict": true, "contexts": ["ci"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
EOF
gh api -X PUT repos/<owner>/<repo>/branches/<default-branch>/protection --input /tmp/bp.json
```
- `contexts`: name the CI check (usually the GitHub Actions job name, e.g. `ci`).
- Single dev: 0 required approvals (PR still required). Teams: set approvals > 0.
- If the token lacks admin, document the dashboard path instead (Settings → Branches → protection rules).

### 2. Pre-push hook (local safety net) — commit `.githooks/pre-push`:
```sh
#!/sh
# Block direct pushes to the default branch (branch+PR workflow).
while read local_ref local_sha remote_ref remote_sha; do
  if [ "$remote_ref" = "refs/heads/main" ]; then   # or your default branch
    echo "ERROR: direct push to 'main' is blocked. Use a feature branch + PR." >&2
    echo "  git switch -c feat/x && git push -u origin feat/x && gh pr create" >&2
    exit 1
  fi
done
exit 0
```
Enable with `git config core.hooksPath .githooks` (committed, works on every clone).

### 3. CI — gate every push and PR
Workflow triggers: `on: [push, pull_request]`, job running typecheck → lint → test → build.

### 4. PR template — `.github/PULL_REQUEST_TEMPLATE.md`
Summary, type checklist (conventional types), checklist (conventional commits, local checks, CI green, no secrets/PII, tests), testing performed, deployment notes, `Closes #`.

### 5. Agent/human rules — commit `AGENTS.md` (agents) and `CONTRIBUTING.md` (humans)
- Golden rules + repo map + the exact workflow above + environment notes.
- AGENTS.md is the standing prompt for AI agents; CONTRIBUTING.md for humans.
- If the repo's `.gitignore` has a blanket `*.md` rule, add negations (`!AGENTS.md`, `!.github/PULL_REQUEST_TEMPLATE.md`).

## Review checklist (before merge)
- [ ] Atomic, conventional commits
- [ ] CI green; local checks match CI
- [ ] No secrets/PII, no debug leftovers, no dead code
- [ ] Tests added/updated for changed behavior
- [ ] PR < ~400 lines; description explains WHY
- [ ] Docs updated if workflow/API/env changed
- [ ] Merge via **squash**; delete the branch

## Verification
- `gh pr checks <n> --watch` → all pass (CI, preview deploy, security scans).
- After merge: `git switch main && git pull` → confirm squash commit on main.
- Confirm protection: `gh api repos/<owner>/<repo>/branches/main/protection` shows PR + checks required, force-push disabled.

## FirstMileDev reference (example project where this is live)
- Branch+PR enforced (PR #40: hook + docs), AGENTS.md + PR template added (PR #41).
- Workflow docs: `CONTRIBUTING.md`, `AGENTS.md`, `.githooks/pre-push` in that repo.
- Default branch: `main`; CI check name: `ci`; deploy: Vercel (preview per PR, prod on merge).
