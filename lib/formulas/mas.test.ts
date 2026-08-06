import { describe, it, expect } from 'vitest'
import { parseLevelShuttle, computeMasResult, displayMs } from './mas'

describe('parseLevelShuttle', () => {
  it('parses valid Level.Shuttle input', () => {
    expect(parseLevelShuttle('12.4')).toEqual({ level: 12, shuttleInLevel: 4 })
    expect(parseLevelShuttle('10.2')).toEqual({ level: 10, shuttleInLevel: 2 })
    expect(parseLevelShuttle('12.1')).toEqual({ level: 12, shuttleInLevel: 1 })
  })

  it('returns null for invalid formats', () => {
    expect(parseLevelShuttle('abc')).toBeNull()
    expect(parseLevelShuttle('12')).toBeNull()      // no decimal
    expect(parseLevelShuttle('12.44')).toBeNull()   // two decimal digits
    expect(parseLevelShuttle('.4')).toBeNull()       // no level
    expect(parseLevelShuttle('')).toBeNull()
    expect(parseLevelShuttle('22.1')).toBeNull()     // level 22 out of range
    expect(parseLevelShuttle('0.5')).toBeNull()      // level 0 not in table
  })

  it('trims whitespace', () => {
    expect(parseLevelShuttle('  12.4  ')).toEqual({ level: 12, shuttleInLevel: 4 })
  })
})

describe('computeMasResult — MAS via Paradisi', () => {
  it('Julian/CJ: 10.2 → 85 shuttles → MAS within 0.001 m/s of 4.126', () => {
    const result = computeMasResult({ level: 10, shuttleInLevel: 2 })
    expect(result.totalShuttleCount).toBe(85)
    expect(Math.abs(result.masMs - 4.126)).toBeLessThan(0.001)
  })

  it('Tony: 12.1 → 107 shuttles → MAS within 0.001 m/s of 4.699', () => {
    const result = computeMasResult({ level: 12, shuttleInLevel: 1 })
    expect(result.totalShuttleCount).toBe(107)
    expect(Math.abs(result.masMs - 4.699)).toBeLessThan(0.001)
  })

  it('Yugo: 12.4 → 110 shuttles → MAS within 0.001 m/s of 4.777', () => {
    const result = computeMasResult({ level: 12, shuttleInLevel: 4 })
    expect(result.totalShuttleCount).toBe(110)
    expect(Math.abs(result.masMs - 4.777)).toBeLessThan(0.001)
  })
})

describe('computeMasResult — Estimated VO2max via Léger & Mercier', () => {
  it('Level 10 → 53.8 mL/kg/min', () => {
    const result = computeMasResult({ level: 10, shuttleInLevel: 2 })
    expect(result.estimatedVo2max).toBe(53.8)
  })

  it('Level 11 → 56.7 mL/kg/min', () => {
    const result = computeMasResult({ level: 11, shuttleInLevel: 0 })
    expect(result.estimatedVo2max).toBe(56.7)
  })

  it('Level 12 → 59.6 mL/kg/min', () => {
    const result = computeMasResult({ level: 12, shuttleInLevel: 4 })
    expect(result.estimatedVo2max).toBe(59.6)
  })
})

describe('displayMs', () => {
  it('rounds to 1 decimal', () => {
    expect(displayMs(4.777)).toBe('4.8')
    expect(displayMs(4.126)).toBe('4.1')
    expect(displayMs(4.699)).toBe('4.7')
    expect(displayMs(8.13)).toBe('8.1')
  })
})
