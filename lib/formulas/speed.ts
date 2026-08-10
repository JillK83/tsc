import { displayMs } from './mas'

export { displayMs }

export const SPEED_VALID_MIN = 0.80
export const SPEED_VALID_MAX = 2.50

export type SpeedResult = {
  mssMs: number
  asrMs: number | null
  inRange: boolean
}

export function parseSpeedInput(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const val = parseFloat(trimmed)
  return isNaN(val) ? null : val
}

export function computeSpeedResult(
  flyTimeS: number,
  masMs?: number | null
): SpeedResult {
  if (flyTimeS <= 0) throw new Error('flyTimeS must be positive')
  const mssMs = 10.0 / flyTimeS
  const asrMs = masMs != null ? mssMs - masMs : null
  const inRange = flyTimeS >= SPEED_VALID_MIN && flyTimeS <= SPEED_VALID_MAX
  return { mssMs, asrMs, inRange }
}
