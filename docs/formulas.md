# TSC — Confirmed Formulas & Lookup Tables
**Source:** PRD v0.8 Section 15 · Locked

---

## Input format

Level.Shuttle notation — e.g. "12.4"
- Integer part = level reached
- Decimal × 10 = shuttles completed into that level
- Partial level completion is fully supported — "10.2" = Level 10, shuttle 2

---

## Path 1 — MAS (via total shuttle count → Paradisi)

```javascript
total_shuttle_count = cumulative_before_level[level] + shuttle_in_level
vVO2max_kmh = 0.0937 × total_shuttle_count + 6.890   // intermediate only, never shown coach-side
MAS_ms = vVO2max_kmh ÷ 3.6
```

## Path 2 — Estimated VO2max (via level integer → Léger & Mercier)

```javascript
level_speed_kmh = 7.5 + 0.5 × level
estimated_vo2max = 5.857 × level_speed_kmh − 19.458
```

These two paths are completely independent. Never mix inputs between them.

---

## Lookup table 1 — Cumulative shuttles before each level

```javascript
const cumulative_before_level = {
  1:0,   2:7,   3:15,  4:23,  5:32,  6:41,  7:51,  8:61,
  9:72,  10:83, 11:94, 12:106, 13:118, 14:131,
  15:144, 16:157, 17:171, 18:185, 19:200, 20:215, 21:231
}
```

## Lookup table 2 — Estimated VO2max by level

```javascript
const vo2max_by_level = {
  1:27.4, 2:30.3, 3:33.3, 4:36.2, 5:39.1, 6:42.0, 7:45.0,
  8:47.9, 9:50.8, 10:53.8, 11:56.7, 12:59.6, 13:62.5,
  14:65.5, 15:68.4, 16:71.3, 17:74.3, 18:77.2, 19:80.1,
  20:83.0, 21:86.0
}
```

---

## Speed test

```javascript
MSS_ms = 10.0 ÷ fly_time_s
ASR_ms = MSS_ms − MAS_ms   // uses most recent MAS if cross-session
```

Protocol: 20m build-up + 10m timed fly section. Time in seconds.

---

## Coach Programming distances

### MAS panel
```javascript
distance_m = MAS_ms × (intensity_pct ÷ 100) × work_interval_s
```
Intensity options: 85, 90, 95, 100, 105, 110 (%)
Work intervals: 10, 15, 20, 25, 30, 40, 45, 60, 90, 120, 150, 200, 240, 300, 360, 420 (seconds)

### ASR panel
```javascript
distance_m = (MAS_ms + ASR_ms × asr_pct) × work_interval_s
```
ASR% options: 10, 20, 25, 30, 40 (%)
Work intervals: 6, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 90, 120, 150, 200, 240, 300 (seconds)

### Shuttle toggle (Coach Programming only)
```javascript
// Straight-line selected:
display = distance_m   // no adjustment

// Shuttle selected:
adjusted = distance_m − (MAS_ms × 0.7)
per_leg = adjusted ÷ 2
display = `${per_leg} / ${per_leg}m`
```
CoD constant: 0.7s hard-coded. Always 1 direction change per rep. Lives in application code — not schema.

---

## Display precision (presentation layer only)

| Value | Display | Storage |
|---|---|---|
| MAS (m/s) | 1 decimal, standard rounding | Full precision |
| MSS (m/s) | 1 decimal | Full precision |
| ASR (m/s) | 1 decimal | Full precision |
| Estimated VO2max | 1 decimal | Full precision |
| Distances (Coach Programming) | 1 decimal | Never stored |
| vVO2max (km/h) | Never displayed coach-side | Internal only |

---

## Verification values

```
"10.2" → 85 total shuttles → MAS 4.126 m/s → displays 4.1  (Julian, CJ)
"12.1" → 107 total shuttles → MAS 4.699 m/s → displays 4.7  (Tony)
"12.4" → 110 total shuttles → MAS 4.777 m/s → displays 4.8  (Yugo)

Level 10 → Estimated VO2max 53.8 mL/kg/min
Level 11 → Estimated VO2max 56.7 mL/kg/min
Level 12 → Estimated VO2max 59.6 mL/kg/min

fly_time 1.23s → MSS 8.130 m/s → displays 8.1
MSS 8.13 − MAS 4.12 = ASR 4.01 → displays 4.0  (Julian)

Shuttle spot-check (Yugo, 100% × 20s):
  straight_line = 4.8 × 1.0 × 20 = 96.0m
  adjusted = 96.0 − (4.8 × 0.7) = 92.64m
  per_leg = 46.3 / 46.3m

ASR spot-check (Tony, 25% × 20s):
  (4.7 + 4.0 × 0.25) × 20 = 114.0m
```

---

## Rank computation

- Team rank: by MAS descending, rank 1 = highest MAS
- Position rank: by MAS within position group
- Tied athletes share the same rank number
- Computed at query time — never stored
- Shows "—" if fewer than 2 athletes have results in session
