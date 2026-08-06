# Skill: Component Audit — Team Sports Calculator

When invoked, compare the built component against the Figma design reference and the TSC Design System v1. This skill encodes known Figma Make failure patterns so Claude Code catches them proactively.

---

## Inputs needed
- The Figma reference PNG (specify path under `/docs/figma-refs/` or confirm it's in context)
- The component file path to audit
- The screen name: Bulk Entry | Team Report | Athlete Card | Coach Programming | Speed Test Entry | Athlete Card Print | Onboarding

---

## Severity levels
- **CRITICAL:** Breaks the design system contract, fails WCAG, or produces incorrect formula output. Fix before shipping.
- **DRIFT:** Visual difference that doesn't violate the system — acceptable with justification.
- **SUGGESTION:** Optional improvement that would strengthen consistency or polish.

---

## Step 1 — Token compliance (run on every component)

### Surface tokens
- [ ] Page background: `#EEECEA` (light) / `#181A1C` (dark) — not `#F9FAFB`, not `#FFFFFF`, not pure black
- [ ] Card background: `#FFFFFF` (light) / `#262A2F` (dark)
- [ ] Hover/elevated surface: `#FAFAF8` (light) / `#2D3338` (dark)
- [ ] MAS perf tile: `#0F1D2A` (light) / `#0A1219` (dark) — always darker than page, intentional
- [ ] Dark mode card is lighter than dark mode page

### Orange rule — most common violation
- [ ] Orange (`#E8632A` / `#F07848`) appears ONLY on: MAS hero tile number, LATEST badge
- [ ] Orange does NOT appear on: buttons, links, table MAS column values, nav, focus rings, chips, form elements
- [ ] MAS column values in tables: `font-weight: 700` + `text/primary` — NOT orange

### Blue rule
- [ ] Primary CTA buttons: `#4A83D8` (light) / `#5A8DEE` (dark)
- [ ] Focus rings: `#EBF2FD` halo (light) / `rgba(90,141,238,.15)` (dark)
- [ ] Selected rows: `#EBF2FD` (light) / `rgba(90,141,238,.15)` (dark)
- [ ] Onboarding Step 5 "Launch dashboard": green `#2E9E6F` — only green CTA in the app

### Semantic tokens
- [ ] Warning text: `#A67520` — NOT `#D89B2A` (fails WCAG 2.8:1)
- [ ] Warning border: `#C98E24`
- [ ] Warning tint: `#FDF3DC`
- [ ] Success text: `#1E6E4C` (light) / `#5ECFA0` (dark)
- [ ] Error text: `#A83232` (light) / `#EF8E8E` (dark)

### Typography
- [ ] Numeric columns: `font-variant-numeric: tabular-nums` — decimal points must align vertically
- [ ] Column headers: uppercase, 11px, weight 500, 0.05–0.06em letter-spacing, `text/secondary`
- [ ] Body text minimum 14px
- [ ] Athlete name on card: 22–24px, weight 800
- [ ] No placeholder-only labels — persistent label above every input
- [ ] "Estimated VO2max" in full — never "Est. VO2max" except confirmed compact contexts

### Borders and radius
- [ ] Card outer: `#D9D3CC` (light) / `#383C40` (dark) — `border/1`
- [ ] Table row dividers: `#E6E2DE` (light) / `#30353A` (dark) — `border/2`
- [ ] Form inputs: `border/1`, 8px radius
- [ ] Buttons: 12px radius
- [ ] Cards: 16px radius
- [ ] Badges/pills: 999px radius

### Spacing
- [ ] All spacing on 8pt grid: 4, 8, 12, 16, 24, 32, 48, 64px
- [ ] Card padding: 24–32px
- [ ] No arbitrary values: 15px, 19px, 27px are DRIFT

---

## Step 2 — Known Figma Make deviations (most likely issues)

### Bulk Entry
- [ ] MAS values: 1 decimal place (4.8 not 4.777)
- [ ] Parsed preview below input on valid entry: "→ Level 12, 4 shuttles, 110 total" in `text/secondary` 11px
- [ ] Invalid row: full row highlight in error/tint — not just the input cell
- [ ] Pending row: `text/muted` — NOT error styling (pending is expected, error is not)
- [ ] Sidebar: default open, collapsible 250ms ease-in-out, no conditioning goal field
- [ ] Save Session CTA: blue `#4A83D8` — NOT dark navy, NOT orange

### Team Report
- [ ] Header: date only — NO conditions in header
- [ ] Multi-day testing: header shows date range e.g. "June 8–12, 2026"
- [ ] Sort dropdown: exactly 3 options — MAS (default) | Estimated VO2max | MSS
- [ ] MAS column: bold weight, `text/primary` — NOT orange
- [ ] All m/s values: 1 decimal place

### Athlete Card — screen
- [ ] MAS hero tile: `surface/perf-tile` dark bg, orange number — ONLY orange on this screen
- [ ] All other metric values: `text/primary`, NOT orange
- [ ] "Estimated VO2max" label in full
- [ ] LATEST badge: `#FDE8DC` bg, `#E8632A` text
- [ ] "SPEED DATA MISSING" badge when MSS/ASR not recorded
- [ ] Test history: max 3 rows, most recent first

### Athlete Card — print
- [ ] NO background colors — white only
- [ ] NO orange MAS number — weight/size create hierarchy, not color
- [ ] NO dark navy MAS tile — white cell, heavier border
- [ ] ALL text `#000000` or near-black
- [ ] `@media print` in dedicated section, not scattered
- [ ] Single page on US Letter landscape — no truncation
- [ ] Test history: max 3 rows + footnote "Full test history available in app." at 8px muted italic

### Coach Programming
- [ ] Work time chips: seconds only — `10s`, `15s`, `420s` — NEVER minutes (`1m`, `7m`)
- [ ] Distance columns: fixed width ~120–150px — do NOT stretch to fill space
- [ ] Shuttle toggle formula: `(straight_line − (MAS × 0.7)) ÷ 2` — not `straight_line ÷ 2`
- [ ] Shuttle display: `43.4 / 43.4` (two equal legs, slash separator)
- [ ] Shuttle column headers: append `(SHUTTLE)` suffix, min 150px width
- [ ] No orange anywhere on this screen
- [ ] Athlete grouping: one row per unique MAS value, name chips wrap gracefully
- [ ] ASR formula: `(MAS + ASR × asr_pct) × work_interval_s` — NOT `ASR × asr_pct × work_interval_s`

### Speed Test Entry
- [ ] Input label: "10m fly time (s)" — NOT "Fly Time", NOT "Speed Input"
- [ ] Format hint: "e.g. 1.23" — persistent below column header, NOT placeholder
- [ ] MSS preview: "→ 8.1 m/s" below field on valid entry
- [ ] Validation warning (not block) for fly times outside 0.8s–2.5s
- [ ] No orange anywhere

### Onboarding Wizard
- [ ] Steps 1–4 primary CTA: blue `#4A83D8`
- [ ] Step 5 Launch button: green `#2E9E6F`, sentence case, NO emoji
- [ ] Back button: outlined blue — NOT dark navy
- [ ] Card width ~520px, centered — NOT full page width
- [ ] Progress stepper: completed = filled dark circle + checkmark, current = blue outline, future = gray outline
- [ ] Figma Make preview tabs ("Screen 1", etc.) are NOT part of the app — do not implement
- [ ] Formula box on Screen 3: read-only, warm tint background `#F4F3F0`, never editable

---

## Step 3 — Formula spot-checks (run if component touches calculations)

| Formula | Spot-check | Expected display |
|---|---|---|
| MAS | "10.2" → 85 shuttles | **4.1** m/s |
| MAS | "12.4" → 110 shuttles | **4.8** m/s |
| VO2max | Level 12 | **59.6** mL/kg/min |
| MSS | 1.23s fly | **8.1** m/s |
| MAS distance | Yugo (4.8) @ 100% × 30s | **144.0** m |
| Shuttle | Yugo (4.8) @ 100% × 20s | **46.3 / 46.3** m |
| ASR distance | Tony (4.7, ASR 4.0) @ 25% × 20s | **114.0** m |

---

## Step 4 — Accessibility baseline
- [ ] WCAG 2AA contrast: ≥ 4.5:1 normal text, ≥ 3:1 large text + UI components
- [ ] Both light and dark mode independently pass
- [ ] All inputs have persistent visible labels — no placeholder-only labeling
- [ ] Full keyboard navigation — tab order top to bottom, no skipping, no focus traps
- [ ] Visible focus rings on every interactive element — `outline` never suppressed
- [ ] Screen reader labels on computed metric displays
- [ ] `font-variant-numeric: tabular-nums` on every numeric column
- [ ] `prefers-reduced-motion` respected

---

## When no Figma reference exists
- Skip visual comparison
- Run token compliance (Step 1) only
- Flag any hardcoded hex values as CRITICAL
- Flag any hardcoded spacing outside the 8pt scale as DRIFT
- Flag any pattern not in design-system.md as DRIFT with note "new pattern may be needed"

---

## Output format

```
COMPONENT: [name]
SCREEN: [screen name]
REFERENCE: [PNG path or "token audit only"]

CRITICAL
- [issue] → [fix]

DRIFT
- [issue] → [acceptable if: / fix if:]

SUGGESTION
- [issue] → [improvement]

FORMULA VERIFICATION
- [formula]: PASS / FAIL — [spot-check result]

ACCESSIBILITY
- PASS / [issue]
```

If nothing found: "No issues found — component passes design system audit."
Do NOT rewrite the component. Report only.
