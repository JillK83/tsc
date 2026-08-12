import { describe, it, expect } from 'vitest'
import { masDistanceStraight, masDistanceShuttle, asrDistance } from './coach-programming'

describe('masDistanceStraight', () => {
  it('Julian (MAS 4.126, 100%, 10s) → 41.3m', () => {
    expect(masDistanceStraight(4.126, 100, 10).toFixed(1)).toBe('41.3')
  })

  it('Julian (MAS 4.126, 105%, 30s) → 130.0m', () => {
    expect(masDistanceStraight(4.126, 105, 30).toFixed(1)).toBe('130.0')
  })

  it('Yugo (MAS 4.777, 100%, 20s) → 95.5m', () => {
    expect(masDistanceStraight(4.777, 100, 20).toFixed(1)).toBe('95.5')
  })
})

describe('masDistanceShuttle', () => {
  it('Yugo (MAS 4.777, 100%, 20s) → 46.1m per leg', () => {
    // subtract-then-halve order:
    // straight = 4.777 × 1.0 × 20 = 95.54
    // adjusted = 95.54 − (4.777 × 0.7) = 95.54 − 3.3439 = 92.196
    // perLeg   = 92.196 ÷ 2 = 46.098 → 46.1
    expect(masDistanceShuttle(4.777, 100, 20).toFixed(1)).toBe('46.1')
  })

  it('subtract-then-halve: result equals (straight − CoD) ÷ 2, not (straight ÷ 2) − CoD', () => {
    const masMs = 4.777
    const straight = masDistanceStraight(masMs, 100, 20)
    const expected = (straight - masMs * 0.7) / 2
    expect(Math.abs(masDistanceShuttle(masMs, 100, 20) - expected)).toBeLessThan(0.001)
  })
})

describe('asrDistance', () => {
  it('Julian (MAS 4.126, ASR 4.004, 10%, 10s) → 45.3m', () => {
    expect(asrDistance(4.126, 4.004, 10, 10).toFixed(1)).toBe('45.3')
  })

  it('Julian (MAS 4.126, ASR 4.004, 20%, 90s) → 443.4m', () => {
    expect(asrDistance(4.126, 4.004, 20, 90).toFixed(1)).toBe('443.4')
  })
})
