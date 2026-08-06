# Skill: Commit → Push → PR

Invoke when ready to ship staged changes. Runs pre-flight checks, commits, pushes, and opens a PR.

---

## Pre-flight sequence

### Step 1 — Assess scope
Run `git diff --staged` to assess scope of changes.

### Step 2 — Decide review depth
If changes touch 3+ files OR include any of:
- `/lib/formulas/` or any formula function
- `/lib/db/` or any Drizzle schema/migration file
- `/app/api/` route files
- Any RLS policy or Clerk auth integration
- Coach Programming Screen distance logic

→ Run `code-reviewer` agent first. Wait for its output.

If changes are isolated UI, copy, or config only:
→ Run `code-reviewer` agent anyway (it's fast, always worth it).

### Step 3 — Check DECISIONS.md
Scan `/decisions/DECISIONS.md` for any locked decision relevant to what changed. If the change contradicts a locked decision, stop and flag it before committing.

### Step 4 — Handle CRITICAL findings
If `code-reviewer` reports any CRITICAL finding — **stop**.
Report the finding and wait for instruction. Do not proceed to commit.

---

## Commit

### Step 5 — Stage changes
```
git add [specified files]
```
If instructed to stage all: `git add -A`

### Step 6 — Write commit message
Format:
```
[Imperative verb], max 60 chars on first line
(e.g. "Add shuttle toggle to Coach Programming Screen")

[Blank line]

[2-3 lines: what changed and why]
[Reference DECISIONS.md if a locked decision is relevant]
[Note any formula spot-checks that passed]
```

Good examples:
- "Fix MAS display rounding to 1 decimal place"
- "Add Neon RLS policy to speed_results table"
- "Wire Clerk userId to users table on provisioning"

### Step 7 — Commit
```
git commit -m "[message]"
```

---

## Push

### Step 8 — Push to current branch
```
git push origin HEAD
```
Confirm push succeeded before continuing.

---

## PR

### Step 9 — Open PR via gh CLI
```
gh pr create \
  --title "[same as commit first line]" \
  --body "[see PR body format below]" \
  --base main
```

### Step 10 — Output the PR URL

---

## PR body format

```
## What changed
[What was built or fixed]

## Why
[The reason — reference a locked decision from DECISIONS.md if relevant]

## Formula verification (if applicable)
- [ ] MAS spot-checks pass (10.2 → 4.1, 12.4 → 4.8)
- [ ] VO2max spot-checks pass (Level 12 → 59.6)
- [ ] Shuttle toggle formula correct: (straight_line − (MAS × 0.7)) ÷ 2
- [ ] Distances not stored in DB (Coach Programming)

## How to verify in Vercel preview
[What to look for — specific screen, specific value, specific behavior]

## Design system
- [ ] No orange outside MAS tile and LATEST badge
- [ ] All m/s values display to 1 decimal place
- [ ] Work time chips in seconds (not minutes)
```

---

## What NOT to do
- Never commit if code-reviewer returns CRITICAL
- Never commit a formula change without running spot-checks
- Never commit .env.local
- Never commit a new DB table without confirming RLS policy exists
