# TSC — Acceptance Criteria
**Source:** PRD v0.8 Section 7 · Locked
**Use:** Reference during build and QA to verify each feature is complete.

---

## Onboarding
- GA completes 5-screen setup in under 10 minutes on first login
- Each step saves as draft — exit and return without data loss
- Progress bar and step number visible on every screen
- CSV upload imports roster (name, position, sex minimum) without errors
- Manual add works as fallback

## Athlete Roster Management
- GA can add, edit, deactivate an athlete in under 30 seconds
- Athlete profile: name, position, sex (required), birth_date (optional)
- Deactivated athlete does not appear on bulk entry screen
- Deactivated athlete's historical results are preserved
- No hard delete for athletes with existing results — deactivate only
- Duplicate name in same program triggers warning before save
- Roster displays correctly at 30+ athletes

## Test Session Creation
- GA creates session with date + optional conditions in under 60 seconds
- Two sessions on same date are allowed (two teams, same day)

## Bulk Data Entry
- Entry field accepts Level.Shuttle notation (e.g. "12.4")
- App parses integer as level, decimal × 10 as shuttle_in_level
- App looks up total shuttle count via cumulative lookup table
- Inline parsed preview on valid entry: "→ Level 12, 4 shuttles, 110 total"
- Invalid format highlights that row without blocking other rows
- GA can enter scores for 25 athletes keyboard-only (no mouse)
- Athletes with no entry save as "Pending"
- Page does not reload on save — confirmation toast shown
- Browser warns on navigation away with unsaved entries

## MAS Calculation
- total_shuttle_count = cumulative_before_level[level] + shuttle_in_level
- vVO2max (km/h) = 0.0937 × total_shuttle_count + 6.890
- MAS (m/s) = vVO2max ÷ 3.6
- Result within 0.001 m/s of manual formula calculation
- Verified: "10.2" → 85 shuttles → 4.126 m/s, "12.4" → 110 shuttles → 4.777 m/s

## Estimated VO2max
- Source: Léger & Mercier (1988)
- level_speed = 7.5 + 0.5 × level
- Estimated VO2max = 5.857 × level_speed − 19.458
- Uses level integer only — independent from Paradisi/MAS path
- Label: "Estimated VO2max (mL/kg/min)" — always full word "Estimated"

## Speed Test / MSS
- Input label: "10m fly time (seconds)"
- Protocol note: "20m build-up + 10m timed section"
- MSS (m/s) = 10.0 ÷ fly_time_s
- Verified: 1.23s → 8.13 m/s

## ASR
- ASR (m/s) = MSS − MAS
- Cross-session: uses most recent mas_ms if speed test not in same session
- Verified: 8.13 − 4.12 = 4.01 m/s (Julian)

## Athlete Metrics Card
- Displays: name, system ID, Level.Shuttle score, total shuttle count, Estimated VO2max, MAS, MSS, ASR, test date, team rank, position rank
- No distance matrices on screen card — scores only
- Team rank and position rank computed after full session saved
- Rank shows "—" if fewer than 2 athletes have results in session
- Athlete with MST but no speed test: MSS and ASR show "Not recorded"

## Athlete Card Print
- Landscape 8.5×11" Letter orientation
- Scores-only layout — no distance matrices
- Prints on single page without truncation
- Tested in Chrome and Safari on actual hardware
- "SPEED DATA MISSING" badge when MSS/ASR not recorded
- Test history: maximum 3 rows, most recent first
- Footnote: "Full test history available in app."

## Team Report
- All active athletes with sort control (dropdown)
- Default sort: MAS descending
- Sort options: MAS | Estimated VO2max | MSS
- Header: date (or date range if multi-day) + season phase. No conditions in header.
- Conditions live on per-row basis or in Bulk Entry/Athlete Card history only
- Director can view and print — no data entry access

## Coach Programming
- MAS panel: up to 3 intensity % × up to 2 work times = max 6 distance columns
- Intensity options: 85, 90, 95, 100, 105, 110 (%)
- Work time chips display in seconds — never converted to minutes
- ASR panel: up to 3 ASR % × up to 2 work times
- Athletes with identical MAS share a pooled row (name chips + MAS value)
- Grouping options: Group by MAS, Group by MAS+ASR only (Group by ASR removed)
- All distances computed at display time — never stored
- Shuttle toggle: (straight_line − (MAS × 0.7)) ÷ 2, shown as equal legs
- Toggle lives on Coach Programming screen only
- Screen-only: no print button, no export in V1
- Athletes without speed test excluded from ASR panel with note

## Auth & Access Control
- GA: email/password or magic link
- Director: read-only at DB level (RLS), not just UI
- School A users cannot query School B data (RLS enforced)
- Admin can create and assign user accounts

## Accessibility
- WCAG 2AA color contrast (≥4.5:1 normal text, ≥3:1 large)
- All inputs have visible persistent labels
- Full keyboard navigation for all core workflows
- Screen reader labels on all interactive elements
- Light mode and dark mode both pass contrast checks independently
