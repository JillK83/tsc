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

**Amendment (Phase 7A, August 2026):** The full "Estimated VO2max" is retained in all on-screen contexts (Team Report screen, Athlete Card screen) and the Athlete Card print test-history table. The Team Report **print** column header abbreviates to "Est. VO2max" / "mL/kg/min" to relieve landscape column compression — this is an OPEN question pending Roger sign-off (see Open decisions). The screen keeps the full word regardless of outcome.

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

### Coach Programming print — deferred to V1.5
**Date:** August 2026
**Decision:** Coach Programming screen is screen-only in V1. Print layout deferred to V1.5.
**Why:** Roger's V1.5 requirement is a full workout document — 4 weeks of programming with tabs or pages per week, athlete names and distances readable on paper. This is a distinct artifact from the screen calculator, not a CSS override of it.
**Rule:** When built, the print layout must handle up to 3 intensities × 3 work times (9 data columns) + sticky athlete name column on a single landscape page. Design as a separate print component — same principle as the athlete card print. Do not attempt to print the screen table via @media print.
**Constraint for current build:** Do not add @media print styles to the Coach Programming screen or the sticky athlete column fix. The screen table and the print table are separate concerns.
**Alternatives rejected:** Printing the screen table directly (column overflow, sticky positioning breaks in print, no page structure for multi-week format)

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

## Session deletion policy
**Date:** August 2026
**Decision:** Sessions with no saved results can be deleted by the GA from the dashboard. Sessions with existing mas_results or speed_results cannot be deleted — deactivate-only pattern mirrors the athlete policy.
**Rationale:** GAs need a way to clean up sessions created with wrong dates or test types. Hard-deleting a session with results would orphan or cascade-delete athlete data, violating the data preservation principle. Empty sessions have no downstream impact so deletion is safe.
**UI:** Delete link per session row on dashboard. Disabled with tooltip if results exist. Confirm dialog before delete.
**Safety net:** `deleteSession` server action re-checks for results before executing, even when the UI shows the delete as available.

---

### Display precision vs. programming precision
**Date:** August 2026
**Decision:** Coach Programming Screen distances computed from full stored MAS precision (e.g. 4.777), not the displayed rounded value (4.8).
**Why:** Rounding before the formula compounds error across intensity percentages and work intervals. Display rounding is presentation-layer only — never an input to calculations.
**Coach awareness:** A 4.8 MAS athlete will see 46.1/46.1 shuttle (not 46.3/46.3) on the programming screen. This is correct. Brief Roger before first pilot session.

---

### ASR panel row structure — one row per athlete
**Date:** August 2026
**Decision:** ASR panel shows one row per athlete, not grouped rows. MAS panel remains grouped.
**Why:** ASR distance formula includes MAS as a variable — `(MAS + ASR × pct) × time`. Two athletes with identical displayed ASR but different MAS values produce materially different distances (~21m at 30s). A grouped row would show one approximate distance for both, which is inaccurate. Roger confirmed Option A: one row per athlete. Accuracy over compactness.
**Row layout:** Displayed ASR value ("4.0", no unit) as muted sub-label above athlete name. Sort by ASR descending using full stored precision.
**Alternatives rejected:** Grouped by displayed ASR (Option B) — misleading when MAS differs within the group.

---

### Display ID — GA screen only
**Date:** August 2026
**Decision:** The zero-padded sequential Display ID (e.g. "00005") appears only on the Athlete Card screen. Removed from the Team Report table and the Athlete Card print component.
**Why:** The ID is a GA cross-reference tool for matching paper clipboard entries to app records during a testing session. It has no meaning in the director-facing Team Report and should not appear on printed cards handed to athletes or shown in meetings.
**Rule:** The ID derivation logic stays in both server actions — only the render layer is restricted.

---

### Athlete card prev/next navigation — below card, muted
**Date:** August 2026
**Decision:** Prev/next athlete links appear in a row directly below the athlete card (not in the top nav bar). Left-aligned for prev, right-aligned for next. Text/secondary color (`#6B7280` / `#9CA3AF`), 14px, no button border or background.
**Why:** Placing prev/next in the same bar as "← Back to Team Report" and "Print Card" created three competing arrow directions in one strip. Separating it to below the card makes it a muted browsing affordance, not a competing primary action.

---

### Position rank — single-athlete group shows "1 of 1"
**Date:** August 2026
**Decision:** An athlete who is the only member of their position group with a MAS result receives rank "1 of 1", not "—".
**Why:** Suppression ("—") caused confusion for Goalkeepers and other single-position athletes who had valid data. The null-rank rule ("—") applies only when zero athletes in the position group have MAS results, or when fewer than 2 athletes program-wide have MAS (team rank suppression). Position group size alone does not suppress the rank.

---

### Director role enforcement — pre-pilot verification required
**Date:** August 2026
**Decision:** Director read-only enforcement is built at the DB action level in Phase 6. `getTeamReport` and `getAthleteCard` are read-only — no write actions are available on the team report or athlete card pages. However, end-to-end verification with an actual director-role user has not been completed. Only one user (GA/admin) exists in the system during development.
**Required before pilot:** Create a test director account via Clerk dashboard, log in as that user, confirm team report and athlete card load correctly, confirm no write actions are accessible at UI or DB level. This is a go/no-go item per PRD Section 9 — "Director account can write data → HOLD."
**Rule:** Do not share access with any non-GA user until this verification is complete.

### Active program persistence — cookie-based for V1 pilot
**Date:** August 2026
**Decision:** Multi-program support (Phase 7B) persists the active program in a non-httpOnly cookie (`tsc_active_program`) for the V1 pilot (single GA, single device). Upgrade to a `current_program_id` column on the `users` table in V1.5 when multi-device or multi-user access is needed. The resolver lives in `/lib/programs/resolver.ts` for a clean swap — it is the only module that knows the persistence mechanism, so V1.5 changes it there without touching call sites.
**Rule:** The resolver validates the cookie's program against the user's `school_id` and falls back to the school's oldest program; a foreign/stale cookie can never resolve to another school's program (preserves school isolation).

---

### DeleteSessionButton trigger contrast — deferred
**Date:** August 2026
**Decision:** The "Delete" trigger text on the dashboard sessions table uses `#9CA3AF` (~2.6:1 contrast) in its default muted state — fails WCAG 2AA. Deferred from Phase 7E to keep the delete modal commit clean.
**Fix when addressed:** Use `text/secondary` (`#6B7280` light / `#9CA3AF` dark) which passes at 5.0:1, or `text/primary` if the action warrants more visual weight. Pre-existing issue, not introduced in Phase 7E.
**File:** `components/session/DeleteSessionButton.tsx` — trigger button `className`.

---

## V1.5 deferred — revisit at second user / multi-device

- Active program persistence — upgrade from cookie to `current_program_id` column on `users` table in V1.5 when multi-device or multi-user access is needed
- School logo slot in nav bar: file already exists at `public/logos/school-logo.png` (unused after the logo was removed in Phase 7A). When the official FDU asset arrives, add it back to the nav bar **right cluster, before the theme toggle**. Target dimensions **44×44px**, `object-fit: contain`, transparent PNG preferred; **keep nav bar height at 64px** (no increase needed). Request the FDU **athletic mark** — the sword + outlined "FDU" letters on a **transparent** background (the earlier `fdu_png_logo.png`), NOT the shield crest / university seal, and not the maroon-background version (a maroon square reads as a colored box on the dark navy nav). The white-outline letterforms read cleanly at 44px on navy. Wire to the hardcoded `/public/logos/school-logo.png` for the V1.5 pilot; migrate to a `logo_url` column on the `schools` table in V3 when multi-school support lands.

---

## V2 deferred — revisit post-pilot

- Session phase visibility on dashboard sessions table — show season phase per session row in V2
- Dashboard sessions table filters — All / by phase tab filter in V2
- Goal Keeper two-line wrap in team report print POS column — revisit when roster grows beyond pilot

---

## Open decisions — resolve before building those components

- [ ] Team report print column header — "Estimated VO2max" vs "Est. VO2max": full word causes print layout compression. Pending Roger sign-off on compact exception for print context only. Screen version keeps full word regardless of outcome.
- [ ] Product name — finalize before public beta
- [x] Neon RLS policies — written and applied in Phase 1 (school_isolation on all 7 tables, live in Neon)
- [ ] Clerk magic link — test delivery to school email addresses (spam filter risk)
- [ ] Vercel URL / domain — set before sharing with director
- [ ] Beta Log Google Doc — create and share with GA consultant

---

*Pre-seeded from PRD v0.8–v0.9 changelogs. Add new decisions here as they are made during build.*
