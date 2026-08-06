# Team Sports Calculator — Design System v1
**Status:** Locked · August 2026  
**Use in:** Every Figma Make prompt, Claude Code build, and component revision.  
**Source of truth:** This file supersedes any color, spacing, or component decisions made in earlier Figma Make outputs.

---

## 1. Aesthetic Direction

**Target:** Precise, credible, athletic — not aggressive, not clinical.  
**Reference points:** Sports analytics tools, coaching software, performance data platforms.  
**What to avoid:**
- Warm cream + serif + terracotta (Artisanal Broadsheet)
- Pure black + acid neon accent (Neo-Brutalist Dark Mode)
- #F9FAFB + Inter + soft-blue buttons (Default SaaS Dashboard)
- Teal as a primary brand color (reads medical/healthcare)

**What makes this product visually distinct:**
- Warm off-white page background — feels like a coach's notebook, not a hospital
- White cards on warm page — premium, human, not spreadsheet
- Orange accent used with extreme restraint — only on performance data
- Dark navy MAS tile — the one surface that inverts elevation intentionally
- Clean data tables with strong typographic hierarchy — no decoration

---

## 2. Surface Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `surface/page` | `#EEECEA` | `#181A1C` | App background |
| `surface/card` | `#FFFFFF` | `#262A2F` | Cards, panels |
| `surface/elevated` | `#FAFAF8` | `#2D3338` | Hover surfaces, menus, dropdowns |
| `surface/selected` | `#EBF2FD` | `rgba(90,141,238,.15)` | Selected table row, active nav item |
| `surface/perf-tile` | `#0F1D2A` | `#0A1219` | MAS hero tile only — intentional dark inversion |

**Elevation rule:** Cards are lighter than page in both modes. `surface/perf-tile` is the one exception — it is always darker than everything else on screen. This inversion is intentional and must be preserved.

---

## 3. Typography Tokens

| Token | Light | Dark | Contrast | Usage |
|---|---|---|---|---|
| `text/primary` | `#0F1515` | `#F3F4F6` | 16.8:1 / 15.3:1 ✓ | Body, headings, table data |
| `text/secondary` | `#6B7280` | `#9CA3AF` | 5.0:1 / 4.9:1 ✓ | Labels, sub-labels, column headers |
| `text/muted` | `#9CA3AF` | `#6B7280` | 2.8:1 — bg use only | Placeholders, captions, pending states |
| `text/performance` | `#E8632A` | `#F07848` | 3.6:1 large / 4.5:1 ✓ | MAS hero tile number, LATEST badge only |

**Typography pairing:**
- Display / athlete names: system sans-serif, weight 800, tight tracking
- Body / labels: system sans-serif, weight 400–500
- Data / numeric columns: monospace or `font-variant-numeric: tabular-nums` — decimal alignment is mandatory in all tables

**Type scale:**
- Athlete name (card): 22–24px, weight 800
- Section heading: 16px, weight 500, uppercase + letter-spacing
- Body: 14px, weight 400
- Labels / column headers: 11px, weight 500, uppercase, 0.06em letter-spacing
- Data values (tables): 13px, weight 400, tabular-nums
- Captions / badges: 9–10px, weight 500–600

---

## 4. Accent Tokens

### Performance accent — orange
**Rule: Orange appears ONLY on the MAS hero tile number and the LATEST badge. Nowhere else.**

| Token | Light | Dark | Usage |
|---|---|---|---|
| `accent/perf-tint` | `#FDE8DC` | `#3D2318` | LATEST badge background |
| `accent/perf-base` | `#E8632A` | `#F07848` | MAS hero number, LATEST text |
| `accent/perf-dark` | `#C04E1E` | — | Hover on perf elements (rare) |

**Where orange does NOT appear:**
- CTA buttons (Save Session, Launch Dashboard, etc.)
- Table data values including MAS column
- Navigation elements
- Focus rings
- Links
- Any repeated/dense UI surface

### Interaction accent — blue
**Rule: Blue owns all interactive UI states. Buttons, links, focus, selection.**

| Token | Light | Dark | Usage |
|---|---|---|---|
| `accent/int-tint` | `#EBF2FD` | `rgba(90,141,238,.15)` | Selected row bg, focus halo |
| `accent/int-base` | `#4A83D8` | `#5A8DEE` | Primary CTA buttons, links, checkboxes |
| `accent/int-dark` | `#2E65BE` | — | Button hover state |

---

## 5. Semantic Tokens

All semantic tokens split into three values: text (passes 4.5:1), border/icon (passes 3:1 for UI), tint (background only).

| Role | Tint | Border | Text (light) | Text (dark) |
|---|---|---|---|---|
| Success | `#D6F0E5` | — | `#1E6E4C` (6.8:1 ✓) | `#5ECFA0` |
| Warning | `#FDF3DC` | `#C98E24` | `#A67520` (4.7:1 ✓) | `#E5B84A` |
| Error | `#FDEAEA` | — | `#A83232` (7.1:1 ✓) | `#EF8E8E` |
| Info | `#EBF2FD` | — | `#2E65BE` (5.2:1 ✓) | `#7AADF5` |

**Warning note:** The original `#D89B2A` amber fails WCAG at 2.8:1. Never use it. Use `#A67520` for text, `#C98E24` for borders, `#FDF3DC` for tints.

**Semantic usage:**
- Success: entered row checkmark, passed status badge
- Warning: pending state text, incomplete session
- Error: invalid input row highlight, error messages
- Info: neutral status, in-progress indicators

---

## 6. Border Tokens

Three tiers — use the right one for the right context.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `border/1` | `#D9D3CC` | `#383C40` | Major card separation, outer containers |
| `border/2` | `#E6E2DE` | `#30353A` | Table row dividers, internal sections |
| `border/3` | `rgba(0,0,0,.06)` | `rgba(255,255,255,.06)` | Interior dividers, subtle hairlines |

---

## 7. Component Specs

### Buttons
- Primary CTA (Save Session, Launch Dashboard): filled `accent/int-base`, white text, radius 12px
- Secondary (Save Draft, Go Back): outlined `accent/int-base`, radius 12px
- Destructive: outlined `error/text` color, radius 12px
- Disabled: `surface/elevated` background, `text/muted` text, `border/2` border
- Focus state: 3px halo using `accent/int-tint`
- **Orange is never used on buttons**

### Tables
- Header row: `text/secondary`, uppercase, 11px, 0.05em tracking, `border/1` underline
- Data rows: `text/primary`, 13px, tabular-nums for all numeric columns
- MAS column: bold weight (`font-weight: 700`), `text/primary` — **not orange**
- Pending row: `text/muted` across all cells
- Selected row: `surface/selected` background
- Hover row: `surface/elevated` background
- Row dividers: `border/2`
- Tab order: top to bottom, no skipping, no focus traps

### Bulk entry table (additional rules)
- Input field width: accommodates "21.9" without scrolling
- Validation fires on blur, not on keystroke
- Invalid row: full row highlight with `error/tint` background + `error/border` left border
- Pending row: `text/muted`, not error styling — pending is expected, error is not
- Inline parsed preview: appears below field on valid entry, `text/secondary`, 11px

### Athlete card — MAS tile
- Background: `surface/perf-tile` (always dark regardless of mode)
- MAS number: `text/performance` (orange), 32–36px, weight 800
- Label: `text/secondary` variant tuned for dark bg, uppercase, 9px
- Sub-label ("Primary training metric"): muted variant, uppercase, 8px
- This is the ONLY place orange appears at display size

### Athlete card — metric tiles
- Background: warm tint of `surface/page` (light: `#F0EFEA`-family, dark: `#0F3D3F`-family)
- Value: `text/primary`, 16–18px, weight 600, tabular-nums
- Label: `text/secondary`, uppercase, 9–10px

### Form inputs
- Background: `surface/card`
- Border: `border/1`
- Border radius: 8px
- Label: always persistent and visible above the field, never placeholder-only
- Format hint: persistent below the field (not as placeholder)
- Focus: `accent/int-base` border, `accent/int-tint` halo
- Error: `error/border` border, `error/tint` background

### Badges / pills
- Border radius: 999px
- LATEST: `accent/perf-tint` bg, `accent/perf-base` text
- Status badges: semantic tint bg + semantic text color (see Semantic Tokens)
- Position tag (MF, FWD, etc.): `surface/elevated` bg, `text/primary`

### Sidebar (Bulk Entry session details)
- Default: open
- Transition: 250ms ease-in-out (respects `prefers-reduced-motion`)
- Background: `surface/card` with `border/1` right divider

---

## 8. Border Radius Scale

| Value | Usage |
|---|---|
| `4px` | Table cells, small utility elements |
| `8px` | Form inputs |
| `12px` | Buttons |
| `16px` | Cards, major containers |
| `999px` | Badges, pills, chips |

---

## 9. Spacing Scale

All spacing uses the 8pt grid: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`  
Avoid arbitrary values (15px, 19px, 27px).

---

## 10. Motion Tokens

| Token | Value | Usage |
|---|---|---|
| `motion/fast` | 100ms ease-out | Hover color shifts |
| `motion/hover` | 150ms ease-out | Button hover, row hover |
| `motion/selection` | 200ms ease-out | Selected row, toggle state |
| `motion/drawer` | 250ms ease-in-out | Sidebar slide, collapsible panels |
| `motion/charts` | 300ms ease-out | Data renders (V2+) |

All transitions must respect `prefers-reduced-motion` — use instant state switches when activated.

---

## 11. Data Visualization Color Reservations (V2+)

| Role | Color | Hex |
|---|---|---|
| Current test | Orange | `#E8632A` |
| Historical | Slate | `#5F6B78` |
| Goal line | Blue | `#4A83D8` |
| PR / best | Green | `#2E9E6F` |
| Average | Gray | `#9CA3AF` |

Never assign multiple lines different colors from the brand palette. These five roles are the complete set.

---

## 12. Print Rules

Print is a first-class surface — the athlete card is the product's most visible output.

- Strip all background colors and shadows in print
- Use borders and weight only for hierarchy
- All text: `#000000` or near-black on white
- Single-page constraint: athlete card must fit on US Letter landscape without truncation
- `@media print` in a dedicated section, not scattered through component CSS
- Tested in Chrome and Safari on actual hardware — not browser preview only

---

## 13. Accessibility Requirements (Non-negotiable)

- WCAG 2AA: ≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components
- Both light mode and dark mode must independently pass contrast checks
- All inputs: visible persistent labels, no placeholder-only labeling
- Full keyboard navigation for all core workflows
- Visible focus rings on every interactive element — never suppress outline
- Screen reader labels (aria-label, aria-describedby) on all interactive elements and computed metric displays
- `font-variant-numeric: tabular-nums` on every numeric column

---

## 14. Copy Rules

- Sentence case everywhere — no Title Case, no ALL CAPS on body copy
- Column headers: uppercase + letter-spacing (UI exception to sentence case)
- Unit labels are not optional: MAS (m/s), VO2max (mL/kg/min), fly time (seconds)
- "Estimated VO2max" — always the full word "Estimated", never "Est." outside of compact table headers where space is confirmed
- Error messages: diagnose + direct path to resolution ("Invalid format — enter as Level.Shuttle (e.g. 12.4)")
- Never use Lorem Ipsum — use real athlete names and metric values in all mocks

---

## 15. What Not to Do

- No orange on buttons, links, table values, navigation, or form elements
- No teal as a brand color (reserved as a future coach annotation color only, not built in V1)
- No pure black (`#000000`) backgrounds
- No gradients, drop shadows (except functional focus rings), blur, or glow
- No placeholder-only input labels
- No rounding m/s values beyond 1 decimal in display (internal storage at full precision)
- No displaying vVO2max coach-side — it is a Paradisi intermediate value only
- No conflating MAS and vVO2max in any label
