# Project: Team Sports Calculator (TSC)

## What this is
A web-based MAS conditioning platform for collegiate S&C coaches. Replaces the homemade Google Sheet workflow. One field test input per athlete → instant individualized metrics → team report + coach programming tool.

Beta target: ~4 weeks. Beta sport: Soccer (NJ collegiate program).

## Stack
- **Frontend:** Next.js (App Router), Tailwind CSS (dark mode via class strategy), React
- **Database:** Neon (serverless PostgreSQL, free tier for pilot)
- **ORM:** Drizzle (TypeScript-native schema + query layer, Neon serverless driver)
- **Auth:** Clerk (magic link only in V1, free tier)
- **Deploy:** Vercel (free tier for beta)
- **External APIs:** None — all calculations are pure formulas

## Key files
- PRD (full spec): `/docs/prd.md`
- Design system: `/docs/design-system.md`
- Schema: `/docs/schema.md`
- Confirmed formulas: `/docs/formulas.md`
- Decisions log: `/decisions/DECISIONS.md`
- Component audit skill: `/.claude/skills/component-audit.md`
- Figma reference PNGs: `/docs/figma-refs/` (see index in that folder)

## Conventions
- All DB writes go through `/lib/db/`
- All formula functions in `/lib/formulas/` — unit-tested against known athletes
- Components follow `/docs/design-system.md` token naming exactly
- RLS on every Neon table — school_id scoping is a hard constraint, not a best practice
- Distances computed at display time, never stored (Coach Programming Screen)
- Rank computed at query time, never stored

## Critical formula rules
- MAS and Estimated VO2max are TWO INDEPENDENT calculation paths. Never mix inputs.
- vVO2max (km/h) is a Paradisi intermediate — never shown coach-side, never displayed
- Display precision: all m/s values to 1 decimal, full precision in storage
- Shuttle toggle formula: `(straight_line − (MAS × 0.7)) ÷ 2` — CoD constant 0.7 lives in app code

## Go/No-Go (never ship if):
- Data not retrievable after save
- MAS differs from manual Paradisi by >0.001 m/s
- Director account can write data
- School A user can query School B data

## Commit policy — MANUAL ONLY
- NEVER auto-commit or auto-push. Do not invoke the commit-push-pr skill unless the user explicitly asks for a commit or types `/commit-push-pr`.
- When the user does ask for a commit: run `code-reviewer` first, then proceed only if no CRITICAL findings.
- Run `component-audit` skill after building any UI component, only when asked.

## Compact instructions
Focus on code changes and implementation. Do not restate the PRD or formulas back to me — they are in /docs/. If something conflicts with a locked decision, flag it rather than proceeding.

