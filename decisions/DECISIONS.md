# TSC — Decisions Log

> Record WHY things were built a certain way. Reference this before making architectural changes.
> Format: Date | Decision | Why | Alternatives rejected

---

## Locked decisions — pre-seeded from PRD v0.9 changelog

---

### Build stack — Neon + Drizzle + Clerk
**Date:** August 2026
**Decision:** Neon (serverless PostgreSQL) + Drizzle ORM + Clerk auth (magic link only in V1)
**Why:** Supabase was the original choice but replaced. Neon gives serverless Postgres on free tier with full RLS support. Drizzle is TypeScript-native, pairs directly with Neon's serverless driver. Clerk handles magic link auth out of the box with a free tier (10,000 MAU). Email/password deferred to V1.5 if pilot users request it.
**Alternatives rejected:** Supabase (replaced), NextAuth (more setup for magic link), email/password in V1 (not requested yet)

---

### Auth method — magic link only
**Date:** August 2026
**Decision:** Magic link only via Clerk in V1. No email/password.
**Why:** Reduces setup complexity for a solo dev. Pilot is a single school, 2-3 users known to the builder. Manual provisioning via Clerk dashboard is acceptable at this scale.
**Risk to watch:** School email spam filters may block magic link delivery. Test before pilot launch.
**Alternatives rejected:** Email/password (deferred to V1.5), Google OAuth (unnecessary for pilot)

---

### RLS scoping — school_id on every table
**Date:** August 2026
**Decision:** Every Neon table has school_id RLS scoping. This is a hard constraint, not a best practice.
**Why:** Multi-tenancy isolation. School A must never be able to query School B data. GA access is program-scoped within their school.
**Rule:** Any new table added in any version must have school_id RLS before any data is written to it. Never bypass.

---

### Shuttle toggle formula — Option B (CoD deduction then halve)
**Date:** August 2026 (v0.8)
**Decision:** `adjusted = straight_line − (MAS × 0.7)` then `display = adjusted ÷ 2` (equal legs)
**Why:** Roger confirmed. The 0.7s CoD cost is a time-based penalty converted to distance (MAS × time = distance lost). You subtract THEN halve — not halve then subtract.
**Formula:** `(straight_line − (MAS × 0.7)) ÷ 2` → displayed as `43.4 / 43.4m`
**Alternatives rejected:** Halve first then subtract (wrong — underrepresents the cost), subtract a fixed meter value (wrong — cost is speed-dependent)
**Spot-check:** Yugo (MAS 4.8) @ 100% × 20s: straight = 96.0m → adjusted = 96.0 − 3.36 = 92.64m → 46.3 / 46.3m

---

### CoD constant — 0.7s, hard-coded, always 1 direction change per rep
**Date:** August 2026 (v0.8)
**Decision:** 0.7 seconds is the CoD cost constant. Always 1 direction change per rep. Lives in application code — not schema, not configurable by coach.
**Why:** Roger confirmed. No schema change needed. This is not a user-adjustable variable in V1.
**Alternatives rejected:** Making it configurable per sport (V2+ consideration if Roger requests it)

---

### Skill/Heavy athlete selector — removed entirely
**Date:** August 2026 (v0.8)
**Decision:** Weight-based adjustment selector removed from all versions. Not built in V1, V2, or any planned version.
**Why:** Roger's call. Weight-based adjustment is a coaching judgment call that lives outside the app. Adding it would create false precision and coaching liability.
**Alternatives rejected:** Optional toggle, hidden advanced setting — all rejected

---

### Coach Programming grouping — two options only
**Date:** August 2026 (v0.8)
**Decision:** Grouping options are Group by MAS and Group by MAS+ASR only. Group by ASR removed.
**Why:** Roger confirmed Option C layout: athletes with identical MAS share a pooled row (name chips + MAS value). Three options was unnecessary complexity.
**Layout:** Name chips in a row, MAS value label above them in muted text (e.g. "4.8 m/s")
**Alternatives rejected:** Group by ASR only (removed), three-option grouping (removed)

---

### Session intent / energy system layer — deferred to V5
**Date:** August 2026 (v0.8)
**Decision:** Session intent and energy system classification moved to V5. Not built in V1–V4.
**Why:** Adds complexity without clear V1 value. Labels simplified if needed to "VO2max" or "anaerobic glycolytic training" — V5 scope only.
**Alternatives rejected:** V1 inclusion (adds coaching judgment complexity before product is validated)

---

### Team Report header — date only, no conditions
**Date:** August 2026 (v0.8)
**Decision:** Team Report header shows date (or date range for multi-day testing). Conditions field dropped from header.
**Why:** Conditions are session-specific metadata. They live on Bulk Entry and Athlete Card history only. Header is clean for director-facing report.
**Rule:** Single date when all athletes tested same day. Date range (e.g. "June 8–12, 2026") when athletes tested across multiple days. Per-row Test Date column handles outlier visibility — no footnote needed.

---

### Athlete Card test history — "Estimated VO2max" in full
**Date:** August 2026 (v0.8)
**Decision:** Column header in test history table reads "Estimated VO2max" — not "Est. VO2max".
**Why:** Roger confirmed. "Estimated" is a trust calibration mechanism, not decoration. Never abbreviate it outside confirmed compact contexts.
**Note:** The open question was "Est." vs "Estimated" in compact table headers. Roger confirmed full word throughout.

---

### Buyer role clarification
**Date:** August 2026 (v0.8)
**Decision:** Head coach of the sport team is the buyer. Athletic department distributes funds to head coaches. Assistant S&C coaches are full-time employees who can have input.
**Why:** Affects positioning and who needs to be impressed by the printed output. The athlete card printed for team meetings is the primary sales artifact for director-level buy-in.

---

### Season phase display casing
**Date:** August 2026 (v0.8)
**Decision:** Display labels use proper case: Off-Season, Preseason, In-Season, Postseason. Stored values remain lowercase enums: offseason | preseason | in_season | postseason.
**Why:** No schema change needed. Presentation layer handles casing.

---

### Level.Shuttle mid-level clarification
**Date:** August 2026 (v0.8)
**Decision:** Athletes may stop at any shuttle within a level. "10.2" = Level 10, shuttle 2. Partial level completion is fully supported and expected input.
**Why:** This is how the test works in practice. A score of "10.2" is not unusual — it just means the athlete completed 2 shuttles of level 10 before stopping.

---

### Display precision — 1 decimal place for all m/s values
**Date:** August 2026 (v0.7)
**Decision:** MAS, MSS, ASR all display to 1 decimal place with standard rounding (≥0.05 rounds up). Internal storage at full precision.
**Why:** Roger's direct feedback. Displaying 4.777 implies precision the test doesn't support. 4.8 is honest.
**Examples:** 4.777 → 4.8, 8.130 → 8.1, 3.353 → 3.4
**Rule:** This is presentation-layer rounding only. All go/no-go checks use full precision.

---

### Input label — "20m MST" throughout
**Date:** August 2026 (v0.7)
**Decision:** "MST Score" replaced with "20m MST" throughout — column headers, input labels, athlete card, team report, all screens.
**Why:** More specific and accurate. "MST Score" was ambiguous.

---

### vVO2max — never shown coach-side
**Date:** August 2026 (v0.7)
**Decision:** vVO2max (km/h) is a Paradisi intermediate value. It is computed and stored for formula traceability but never displayed to coaches or GAs.
**Why:** Coaches don't need it. Showing it creates confusion between MAS (m/s) and vVO2max (km/h). The MAS label on the athlete card was changed from "MAS · vVO2max · m/s" to "MAS (m/s)".

---

### Athlete card scope — scores only, no distance matrices
**Date:** August 2026 (v0.6)
**Decision:** Athlete card (screen and print) shows scores only. Distance matrices removed from card entirely.
**Why:** Matrices are coach programming tools, not athlete-facing. Simpler card fits on one landscape page cleanly. Matrices moved to Coach Programming Screen.
**Print:** Landscape 8.5×11" Letter. Single page. Scores only.

---

### Coach Programming Screen — screen only, no print, no export
**Date:** August 2026 (v0.6)
**Decision:** Coach Programming Screen is screen-only in V1. No print button, no CSV export.
**Why:** V1 scope. Screen display satisfies the GA workflow. Print and export are V2+ if requested.
**Important:** All distances on this screen are computed at display time. Never stored.

---

### Warning amber token split — three values
**Date:** August 2026 (design system)
**Decision:** Warning amber uses three separate tokens: `#A67520` (text), `#C98E24` (border/icon), `#FDF3DC` (tint/background).
**Why:** The original `#D89B2A` amber fails WCAG at 2.8:1. Split into three contextual values that each pass at their intended use. Never use `#D89B2A`.

---

### Orange accent — reserved for MAS hero tile number and LATEST badge only
**Date:** August 2026 (design system)
**Decision:** Orange (`#E8632A` light / `#F07848` dark) appears ONLY on the MAS hero tile number and the LATEST badge. Nowhere else in the app.
**Why:** Restraint creates meaning. If orange appears on buttons, links, or table values, the performance emphasis is lost. MAS is the hero metric — it earns the one distinctive color.
**Most common violation to watch:** Orange bleeding onto CTA buttons or MAS column values in tables.

---

### Interaction blue — owns all interactive UI states
**Date:** August 2026 (design system)
**Decision:** `#4A83D8` (light) / `#5A8DEE` (dark) is used for all CTAs, focus rings, selected states, links. No other color owns interactive states.
**Exception:** Step 5 onboarding "Launch dashboard" button is green `#2E9E6F` — the only green CTA in the app.

---

### Teal — rejected as brand color
**Date:** August 2026 (design system)
**Decision:** Teal was considered and rejected. Reserved as a possible future coach annotation color only. Not built in V1.
**Why:** Reads medical/healthcare. Wrong signal for an athletic performance tool.

---

### school_id added to test_sessions, mas_results, speed_results
**Date:** August 2026 (Phase 1 build)
**Decision:** `school_id` column added to `test_sessions`, `mas_results`, and `speed_results` even though schema.md v2 does not list it on those tables.
**Why:** The RLS hard constraint (DECISIONS.md: "every table, before any data is written") requires a direct `school_id` column for the `school_isolation` policy to work efficiently. A policy using EXISTS or JOIN subqueries against parent tables is possible but slow and fragile. Denormalizing `school_id` onto every table is the standard pattern for PostgreSQL RLS at this scale.
**How to apply:** Any future table additions must include `school_id` before the first migration. schema.md should be treated as the logical schema; this decision governs the physical schema.
**Alternatives rejected:** RLS via EXISTS subquery (slower, harder to index, more failure surface)

---

### Clerk createRouteMatcher — deprecated in v7, migrate before production
**Date:** August 2026 (Phase 1 build)
**Decision:** `createRouteMatcher` is deprecated in `@clerk/nextjs` v7. Current `proxy.ts` uses it for path-based auth protection. Not breaking in V1 but must be migrated before production.
**Why:** Clerk's guidance is to move auth checks into each page, layout, API route, or Server Function that accesses protected data. Path-matching in proxy/middleware can diverge from how Next.js actually routes requests and leave protected resources reachable.
**How to apply:** Before production, remove `createRouteMatcher` from `proxy.ts` and add `auth.protect()` or equivalent checks directly in each protected page/layout. The dashboard page already calls `currentUser()` — extend that pattern.
**Alternatives rejected:** Keeping path-matching long-term (deprecated, fragile against Next.js routing edge cases)

---

## Open decisions — resolve before building those components

- [ ] Product name — finalize before public beta
- [x] Neon RLS policies — written and applied in Phase 1 (school_isolation on all 7 tables, live in Neon)
- [ ] Clerk magic link — test delivery to school email addresses (spam filter risk)
- [ ] Vercel URL / domain — set before sharing with director
- [ ] Beta Log Google Doc — create and share with GA consultant

---

*Pre-seeded from PRD v0.8–v0.9 changelogs. Add new decisions here as they are made during build.*
