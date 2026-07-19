## What
Brief description of the change.

## Why
Context and motivation.

## How to test
- Steps to verify the change works locally.
- Note any error states or edge cases reviewers should check.

## Checklist
- [ ] `pnpm preflight` passes (secrets, sast, deps, commitlint, lint, format-astro, types, test, build, snapshots, E2E)
- [ ] Commit messages follow Conventional Commits
- [ ] Merge method: **squash** (default) or **rebase** (keep scoped commits, no duplicate) into `main`; **merge-commit** only when stacked onto a feature base (never merge-commit into `main`; it duplicates changelog entries)
- [ ] If this PR contains substantial `docs:` / `refactor:` / `chore:` work that won't appear in CHANGELOG by default, plan to append a summary to the GitHub Release notes after publish (see CONTRIBUTING.md "CHANGELOG visibility")
