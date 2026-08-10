// Cumulative shuttle count before each level starts (Paradisi)
export const CUMULATIVE_BEFORE_LEVEL: Record<number, number> = {
  1: 0,   2: 7,   3: 15,  4: 23,  5: 32,  6: 41,  7: 51,  8: 61,
  9: 72,  10: 83, 11: 94, 12: 106, 13: 118, 14: 131,
  15: 144, 16: 157, 17: 171, 18: 185, 19: 200, 20: 215, 21: 231,
}

// Estimated VO2max by level (Léger & Mercier 1988)
export const VO2MAX_BY_LEVEL: Record<number, number> = {
  1: 27.4, 2: 30.3, 3: 33.3, 4: 36.2, 5: 39.1, 6: 42.0, 7: 45.0,
  8: 47.9, 9: 50.8, 10: 53.8, 11: 56.7, 12: 59.6, 13: 62.5,
  14: 65.5, 15: 68.4, 16: 71.3, 17: 74.3, 18: 77.2, 19: 80.1,
  20: 83.0, 21: 86.0,
}

export type ParsedLevelShuttle = {
  level: number
  shuttleInLevel: number
}

export type MasResult = {
  level: number
  shuttleInLevel: number
  totalShuttleCount: number
  vvo2maxKmh: number
  masMs: number
  estimatedVo2max: number
}

/**
 * Parses "Level.Shuttle" input string (e.g. "12.4") into components.
 * Returns null if format is invalid or level out of range.
 */
export function parseLevelShuttle(input: string): ParsedLevelShuttle | null {
  const trimmed = input.trim()
  // Accept "12.4" or bare integer "11" (treated as "11.0" — 0 shuttles into the level)
  const normalized = trimmed.includes('.') ? trimmed : `${trimmed}.0`
  const match = normalized.match(/^(\d{1,2})\.(\d)$/)
  if (!match) return null

  const level = parseInt(match[1], 10)
  const shuttleInLevel = parseInt(match[2], 10)

  if (!(level in CUMULATIVE_BEFORE_LEVEL)) return null

  return { level, shuttleInLevel }
}

/**
 * Computes MAS (m/s) and all derived values from Level.Shuttle input.
 * These are two completely independent calculation paths — never mix inputs.
 */
export function computeMasResult(parsed: ParsedLevelShuttle): MasResult {
  const { level, shuttleInLevel } = parsed

  // Path 1: MAS via Paradisi
  const totalShuttleCount = CUMULATIVE_BEFORE_LEVEL[level] + shuttleInLevel
  const vvo2maxKmh = 0.0937 * totalShuttleCount + 6.89
  const masMs = vvo2maxKmh / 3.6

  // Path 2: Estimated VO2max via Léger & Mercier (level integer only)
  const estimatedVo2max = VO2MAX_BY_LEVEL[level]

  return { level, shuttleInLevel, totalShuttleCount, vvo2maxKmh, masMs, estimatedVo2max }
}

/** Round m/s value to 1 decimal for display. Full precision stored in DB. */
export function displayMs(value: number): string {
  return value.toFixed(1)
}
