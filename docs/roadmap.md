# TSC — Product Roadmap & Deferred Items
**Last updated:** August 2026  
**Source of truth for:** deferred scope, version sequencing, open decisions  
**Note:** V1 build decisions live in prd.md and DECISIONS.md. This file tracks what comes after.

---

## V1.5 — Post-pilot, pre-scale
Revisit after second user or multi-device access is needed.

- **Active program persistence** — upgrade from cookie (`tsc_active_program`) to `current_program_id` column on `users` table. Resolver lives in `/lib/programs/resolver.ts` for a clean swap — only that module knows the persistence mechanism
- **School logo in nav bar** — file slot exists at `public/logos/school-logo.png`. When FDU asset arrives: 44×44px transparent PNG, athletic mark (sword + outlined "FDU" letters), white-outline letterforms on dark navy nav. NOT the shield crest or maroon-background version. Wire to hardcoded path for V1.5 pilot; migrate to `logo_url` column on `schools` table in V3
- **Email/password auth** — deferred from V1. Add via Clerk if pilot users request it
- **Super-admin provisioning screen** — manual Clerk dashboard provisioning is acceptable for pilot scale
- **Neon production readiness** — upgrade to Launch plan ($19/month) before first real test session: disable scale to zero (eliminates cold start delays), extend restore window from 0.3 days to 7 days minimum. Read replicas deferred to V3. IP allowlist — assess at scale
- **Clerk createRouteMatcher migration** — deprecated in v7. Replace with `auth.protect()` in each protected page/layout before production. Current proxy.ts path-matching is not breaking in V1 but is fragile long-term
- **Coach Programming print layout** — separate print component, landscape, handles up to 3 intensities × 3 work times (9 data columns) + sticky athlete name column on a single page. Design independently — not @media print on the screen table. Same principle as athlete card print
- **Coach Programming weekly workout templates (8-week block)** — Roger's current workflow produces a periodized 8-week program per athlete with two parallel tracks:
  - VO2max track: MAS-based shuttle HIIT. Per week: intensity %, work:rest format, sets×reps, computed shuttle distances, total volume, notes
  - RSA track: Repeat sprint ability. Per week: sprint duration, work:rest, rep count, notes
  - Week 4 and Week 8 are always unload weeks
  - Distances are athlete-specific — computed from individual stored MAS at display time, never stored
  - Output: printable 8-week program card per athlete replacing current Google Sheet tab
  - Schema addition: `program_templates` table (intensity per week, work:rest, sets/reps, notes, track type)
  - Reference: Yugo and CJ CSV files in `/project` for ground truth structure
- **Director role end-to-end verification** — go/no-go gate before any non-GA user receives access. Requires second test user in Clerk. Do not share access until verified

---

## V2 — After second retest cycle

- Normative VO2max bands — split male/female using sex field, sport-specific research pending GA validation
- Age-adjusted VO2max using birth_date (full Léger 1988 formula)
- Autosave — per-row on blur, replaces Save Session button flow
- Retest progress tracking — MAS delta between sessions
- Athlete timeline view — all test history with trend visualization
- Team season dashboard
- Pre-test clipboard printout generator
- Session phase visibility on dashboard sessions table
- Dashboard sessions table filters — All / by phase tab
- Goal Keeper two-line wrap in team report print POS column — revisit when roster grows beyond pilot
- Rank column header distinction — MAS rank is program-wide, VO2max/MSS rank is session-only. Add label clarification when sorted by non-MAS metric

---

## V3 — Monetization + scale

- Multi-school support
- Billing / subscription management ($200–$400/year per school, no per-seat pricing)
- PDF export
- Formula version tracking
- Admin screens
- School logo migration — `logo_url` column on `schools` table replaces hardcoded `/public/logos/school-logo.png`
- Read replicas on Neon for analytics/reporting traffic
- IP allowlist assessment

---

## V4/V5 — Long-horizon

- Periodized conditioning program card (8-week block) — if not fully delivered in V1.5
- Session phase / conditioning goal inputs (coach-driven, not formula-driven)
- Weekly intensity/volume/rest progression templates
- Session energy system classification — "VO2max" or "anaerobic glycolytic training" label per session
- Data trends on performance — progress/regress visualization across seasons

---

## Open decisions — resolve before building

- [ ] **Team report print column header** — "Estimated VO2max" vs "Est. VO2max": full word causes landscape column compression. Pending Roger sign-off on compact exception for print context only. Screen version keeps full word regardless
- [ ] **Product name** — finalize before public beta
- [ ] **Clerk magic link delivery** — test to school email addresses before pilot launch (spam filter risk)
- [ ] **Vercel URL / domain** — set before sharing with director
- [ ] **Beta Log Google Doc** — create and share with GA consultant
- [ ] **Neon plan upgrade** — go/no-go: scale to zero disabled and restore window at 7 days minimum before Roger uses the system with real data
- [ ] **Est. VO2max print abbreviation** — pending Roger sign-off (see team report print column header above)

---

## Out permanently

- GPS/wearable integration
- Injury tracking
- In-app S&C exercise library
- Skill/Heavy athlete weight-based adjustment selector — removed by Roger, not built in any version
