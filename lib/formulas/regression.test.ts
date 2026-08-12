/**
 * Regression tests for the confirmed formula chain.
 * Values sourced from /docs/formulas.md and known athlete data.
 * Do not modify tolerances without updating formulas.md and DECISIONS.md.
 */

import { describe, it, expect } from 'vitest'
import { parseLevelShuttle, computeMasResult, displayMs } from './mas'
import { computeSpeedResult } from './speed'
import { masDistanceStraight, masDistanceShuttle, asrDistance } from './coach-programming'

// ─── MAS chain ───────────────────────────────────────────────────────────────

describe('MAS chain — parseLevelShuttle → shuttles → MAS → VO2max', () => {
  describe('Yugo "12.4"', () => {
    const parsed = parseLevelShuttle('12.4')!

    it('parses to level 12, shuttle 4', () => {
      expect(parsed).toEqual({ level: 12, shuttleInLevel: 4 })
    })

    it('produces 110 total shuttles', () => {
      expect(computeMasResult(parsed).totalShuttleCount).toBe(110)
    })

    it('vVO2max intermediate is 17.197 km/h', () => {
      const { vvo2maxKmh } = computeMasResult(parsed)
      expect(Math.abs(vvo2maxKmh - 17.197)).toBeLessThan(0.001)
    })

    it('MAS within 0.001 m/s of 4.777', () => {
      expect(Math.abs(computeMasResult(parsed).masMs - 4.777)).toBeLessThan(0.001)
    })

    it('displays as 4.8 m/s', () => {
      expect(displayMs(computeMasResult(parsed).masMs)).toBe('4.8')
    })

    it('Estimated VO2max is 59.6 mL/kg/min (level 12 lookup)', () => {
      expect(computeMasResult(parsed).estimatedVo2max).toBe(59.6)
    })
  })

  describe('Tony "12.1"', () => {
    const parsed = parseLevelShuttle('12.1')!

    it('parses to level 12, shuttle 1', () => {
      expect(parsed).toEqual({ level: 12, shuttleInLevel: 1 })
    })

    it('produces 107 total shuttles', () => {
      expect(computeMasResult(parsed).totalShuttleCount).toBe(107)
    })

    it('MAS within 0.001 m/s of 4.699', () => {
      expect(Math.abs(computeMasResult(parsed).masMs - 4.699)).toBeLessThan(0.001)
    })

    it('displays as 4.7 m/s', () => {
      expect(displayMs(computeMasResult(parsed).masMs)).toBe('4.7')
    })

    it('Estimated VO2max is 59.6 mL/kg/min (level 12 lookup)', () => {
      expect(computeMasResult(parsed).estimatedVo2max).toBe(59.6)
    })
  })

  describe('Julian "10.2"', () => {
    const parsed = parseLevelShuttle('10.2')!

    it('parses to level 10, shuttle 2', () => {
      expect(parsed).toEqual({ level: 10, shuttleInLevel: 2 })
    })

    it('produces 85 total shuttles', () => {
      expect(computeMasResult(parsed).totalShuttleCount).toBe(85)
    })

    it('MAS within 0.001 m/s of 4.126', () => {
      expect(Math.abs(computeMasResult(parsed).masMs - 4.126)).toBeLessThan(0.001)
    })

    it('displays as 4.1 m/s', () => {
      expect(displayMs(computeMasResult(parsed).masMs)).toBe('4.1')
    })

    it('Estimated VO2max is 53.8 mL/kg/min (level 10 lookup)', () => {
      expect(computeMasResult(parsed).estimatedVo2max).toBe(53.8)
    })
  })

  describe('CJ "10.2" — same score as Julian, same output', () => {
    it('produces identical MAS and VO2max to Julian', () => {
      const julian = computeMasResult(parseLevelShuttle('10.2')!)
      const cj = computeMasResult(parseLevelShuttle('10.2')!)
      expect(cj.totalShuttleCount).toBe(julian.totalShuttleCount)
      expect(cj.masMs).toBe(julian.masMs)
      expect(cj.estimatedVo2max).toBe(julian.estimatedVo2max)
    })
  })

  describe('MAS and VO2max are independent paths', () => {
    it('level 12 VO2max is the same for Yugo (12.4) and Tony (12.1)', () => {
      const yugo = computeMasResult(parseLevelShuttle('12.4')!)
      const tony = computeMasResult(parseLevelShuttle('12.1')!)
      expect(yugo.estimatedVo2max).toBe(tony.estimatedVo2max)
      expect(yugo.masMs).not.toBe(tony.masMs)
    })
  })
})

// ─── Speed chain ─────────────────────────────────────────────────────────────

describe('Speed chain — fly time → MSS → ASR', () => {
  describe('Julian fly 1.23s', () => {
    it('MSS = 10.0 ÷ fly_time_s = 8.130 m/s', () => {
      const { mssMs } = computeSpeedResult(1.23)
      expect(Math.abs(mssMs - 8.130)).toBeLessThan(0.001)
    })

    it('displays as 8.1 m/s', () => {
      const { mssMs } = computeSpeedResult(1.23)
      expect(displayMs(mssMs)).toBe('8.1')
    })

    it('inRange is true for 1.23s (within 0.80–2.50s)', () => {
      expect(computeSpeedResult(1.23).inRange).toBe(true)
    })
  })

  describe('ASR formula structure — MSS − MAS_full_precision', () => {
    it('asrMs equals mssMs minus masMs exactly', () => {
      // Not asserting a specific ASR value — stored masMs precision determines it.
      // This test locks the formula structure: ASR = MSS - MAS.
      const masMs = 4.126 // Julian's full-precision MAS
      const { mssMs, asrMs } = computeSpeedResult(1.23, masMs)
      expect(asrMs).not.toBeNull()
      expect(Math.abs(asrMs! - (mssMs - masMs))).toBeLessThan(0.0001)
    })

    it('asrMs is null when no MAS is provided', () => {
      const { asrMs } = computeSpeedResult(1.23)
      expect(asrMs).toBeNull()
    })
  })
})

// ─── Coach programming distances ─────────────────────────────────────────────

describe('Coach programming distances — full stored precision as inputs', () => {
  describe('masDistanceStraight', () => {
    it('Julian (4.126) @ 100% × 10s → 41.26m → displays 41.3m', () => {
      const dist = masDistanceStraight(4.126, 100, 10)
      expect(Math.abs(dist - 41.26)).toBeLessThan(0.05)
      expect(dist.toFixed(1)).toBe('41.3')
    })

    it('Julian (4.126) @ 105% × 30s → 129.969m → displays 130.0m', () => {
      const dist = masDistanceStraight(4.126, 105, 30)
      expect(Math.abs(dist - 129.969)).toBeLessThan(0.05)
      expect(dist.toFixed(1)).toBe('130.0')
    })

    it('Yugo (4.777) @ 100% × 20s → 95.54m → displays 95.5m', () => {
      const dist = masDistanceStraight(4.777, 100, 20)
      expect(Math.abs(dist - 95.54)).toBeLessThan(0.05)
      expect(dist.toFixed(1)).toBe('95.5')
    })
  })

  describe('masDistanceShuttle — subtract then halve (full precision MAS, not displayed)', () => {
    it('Yugo (4.777) @ 100% × 20s → per_leg 46.098m → displays 46.1 / 46.1', () => {
      // straight = 4.777 × 1.0 × 20 = 95.54
      // adjusted = 95.54 − (4.777 × 0.7) = 95.54 − 3.3439 = 92.1961
      // per_leg  = 92.1961 ÷ 2 = 46.098
      const perLeg = masDistanceShuttle(4.777, 100, 20)
      expect(Math.abs(perLeg - 46.098)).toBeLessThan(0.05)
      expect(perLeg.toFixed(1)).toBe('46.1')
    })

    it('uses full precision (4.777), not displayed (4.8): results differ', () => {
      const fullPrecision = masDistanceShuttle(4.777, 100, 20)
      const displayedOnly = masDistanceShuttle(4.8, 100, 20)
      // 4.8 × 20 = 96.0, adjusted = 92.64, per_leg = 46.32 → 46.3
      // 4.777 × 20 = 95.54, adjusted = 92.196, per_leg = 46.098 → 46.1
      expect(fullPrecision.toFixed(1)).toBe('46.1')
      expect(displayedOnly.toFixed(1)).toBe('46.3')
    })
  })

  describe('asrDistance — asrPct is a whole number (25 not 0.25)', () => {
    it('Tony (MAS 4.699, ASR 4.004) @ 25% × 20s → 114.0m', () => {
      // (4.699 + 4.004 × 0.25) × 20 = (4.699 + 1.001) × 20 = 5.700 × 20 = 114.0
      const dist = asrDistance(4.699, 4.004, 25, 20)
      expect(Math.abs(dist - 114.0)).toBeLessThan(0.05)
      expect(dist.toFixed(1)).toBe('114.0')
    })
  })
})
