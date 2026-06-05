<!-- experience/git/commit/commit-draft.exp.md -->
<!-- How to draft a git commit message block -->

STEP.
- see the conventional commits spec at `.pi/prompts/git/commit/conventional-commits.md`
- run `git --no-pager diff --staged` to review changes
- write the commit message block in `./tmp/commit.tmp`

NOTE.
- do not use `git --no-pager diff --staged` directly for pre-check
- exclude lock files and similar generated artifacts

---
