# TSC — Build Sequencing & Go/No-Go Criteria
**Source:** PRD v0.8 Sections 8 and 9 · Locked

---

## Build phases

**Phase 1 — Foundation**
Supabase project + all schema tables, RLS policies, Next.js + Tailwind wired, auth (email/password + magic link), light/dark mode toggle.
Done when: Can log in, see empty dashboard, role enforced.

**Phase 2 — Onboarding + Roster Management**
5-screen onboarding wizard, CSV upload + manual athlete entry, athlete CRUD (add, edit, deactivate — no hard delete), roster list view.
Done when: GA completes onboarding, loads full roster.

**Phase 3 — Test Session + Bulk Entry**
Test session creation, Level.Shuttle input field per athlete, tab-through, parse → lookup → store, validation, partial save, unload warning.
Done when: GA enters full session and saves without mouse.

**Phase 4 — MAS + VO2max Calculation**
Paradisi formula (unit-tested against 4+ known athletes), VO2max lookup by level (unit-tested against 5 known athletes, 3 levels), hard-coded lookup tables as JS objects, team rank + position rank.
Done when: Athlete metrics card shows correct scores, all known athletes verified within 0.001 tolerance.

**Phase 5 — Speed Test + ASR**
Speed test entry UI, MSS calculation, ASR calculation (cross-session lookup if needed).
Acceptance test: 1.23s → 8.13 m/s → ASR values correct.

**Phase 5.5 — Coach Programming Screen**
MAS Calculator panel (intensity selector, work time selector, team table, individual mode), ASR Calculator panel (same pattern), shuttle toggle. No print, no export.
Done when: GA can select intensities and see correct team distances.

**Phase 6 — Print & Report**
Athlete card print (landscape 8.5×11", scores only), team report view (3-option sort), director read-only enforced.
Done when: GA and director can print from their respective views.

**Phase 7 — Polish + Beta Deploy**
Empty states, error handling, confirmation toasts, WCAG 2AA audit, Vercel deploy, GA user acceptance test.
Done when: GA completes full test-day-to-report workflow without issues.

---

## Triage rules (solo builder)

- **NEVER ship if:** data not retrievable after save, or calculation wrong
- **SHIP with patch:** imperfect print CSS, missing sort, minor UI issues, director role not built (use GA login for beta)
- **DEFER:** director role → use GA login in beta

---

## Go/No-Go — HOLD before beta user touches the system

### 1. Data loss (P1)
- Level.Shuttle entered and saved is not retrievable on reload → HOLD
- Session save appears to succeed but rows missing in DB → HOLD

### 2. Calculation error (P2)
MAS differs from manual Paradisi by >0.001 m/s → HOLD
```
Verify: "10.2" → 4.126 m/s  (Julian, CJ)
        "12.1" → 4.699 m/s  (Tony)
        "12.4" → 4.777 m/s  (Yugo)
```
VO2max differs from lookup by >0.1 mL/kg/min → HOLD
```
Verify: Level 10 → 53.8, Level 11 → 56.7, Level 12 → 59.6
```
MSS or ASR differs from manual formula by >0.01 m/s → HOLD

### 3. Access control failure
- Director account can write data → HOLD
- School A user can query School B data → HOLD

---

## Build stack

- **Frontend:** Next.js (App Router), Tailwind CSS (dark mode via class strategy), React
- **Backend:** Supabase (PostgreSQL, auth, RLS), Supabase JS client
- **Deploy:** Vercel (free tier for beta)
- **External APIs:** None — all calculations are formulas
