# TSC — Database Schema
**Source:** PRD v0.9 Section 15 · Locked

## Tables

### schools
```
id (uuid PK), name, division, state, created_at
```

### users
```
id (uuid PK), clerk_user_id (text, unique), school_id (FK), email,
role (enum: ga | director | admin), created_at
```
Note: clerk_user_id is the bridge between Clerk auth session and DB rows.
Every query that needs to identify "who is this person" looks up by
clerk_user_id. This field is required and must be set on user creation.

### programs
```
id (uuid PK), school_id (FK), sport, name,
season_phase (enum: offseason | preseason | in_season | postseason),
conditioning_goal (enum: build | maintain | peak),
print_paper_size (enum: letter_8_5x11 | a4),
created_at
```
Note: landscape orientation is fixed for athlete card print in V1 regardless of paper size. A4 stored in V1, full A4 print layout support deferred to V2.

### athletes
```
id (uuid PK), program_id (FK), school_id (FK),
name, position,
sex (enum: male | female),    ← required; for V2 normative bands
birth_date (date, nullable),  ← optional in V1; for V2 age-adjusted VO2max
active (bool), created_at
```
No hard delete — deactivate only for athletes with results.

### test_sessions
```
id (uuid PK), program_id (FK), created_by (FK → users),
date, test_type (enum: 20M_MST | speed),
conditions (text, nullable), created_at
```

### mas_results
```
id (uuid PK), session_id (FK), athlete_id (FK)
level (int)               ← integer part of Level.Shuttle input
shuttle_in_level (int)    ← decimal × 10 from input
total_shuttle_count (int) ← derived: cumulative_before_level[level] + shuttle_in_level
vvo2max_kmh (float)       ← Paradisi intermediate; MAS path only; never shown coach-side
mas_ms (float)            ← MAS in m/s
estimated_vo2max (float)  ← Léger & Mercier from level integer; separate path
notes (text), created_at
```

### speed_results
```
id (uuid PK), session_id (FK), athlete_id (FK)
fly_distance_m (float)    ← fixed at 10.0
fly_time_s (float)        ← raw input: time in seconds
mss_ms (float)            ← computed: 10.0 ÷ fly_time_s
asr_ms (float)            ← computed: mss_ms − mas_ms
                             (mas_ms from same session or most recent)
notes (text), created_at
```

## Key rules
- No new tables for Coach Programming — all distances computed at display time, never stored
- Team rank and position rank: computed at query time, never stored
- CoD constant (0.7s): lives in application code, not schema
- All tables scoped by school_id via Neon PostgreSQL RLS

## Auth notes (Clerk + Neon)
- clerk_user_id on users table bridges Clerk session to DB rows
- Auth method: magic link only in V1
- Role assigned manually in Clerk dashboard for pilot users — no admin screen required in V1
- RLS policies check school_id on every query — never bypassed
- Email/password deferred to V1.5 if requested by pilot users
- Spam filter risk: test magic link delivery to school email addresses before pilot launch
