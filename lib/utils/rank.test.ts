import { describe, it, expect } from 'vitest'
import { computeTeamRank, computePositionRank } from './rank'

// ─── computeTeamRank ─────────────────────────────────────────────────────────

describe('computeTeamRank', () => {
  it('assigns rank 1 to highest masMs', () => {
    const athletes = [
      { id: 'a', masMs: 4.5 },
      { id: 'b', masMs: 4.8 },
      { id: 'c', masMs: 4.2 },
    ]
    const ranks = computeTeamRank(athletes)
    expect(ranks.get('b')).toBe(1)
    expect(ranks.get('a')).toBe(2)
    expect(ranks.get('c')).toBe(3)
  })

  it('tied athletes share rank; next rank skips', () => {
    const athletes = [
      { id: 'a', masMs: 4.8 },
      { id: 'b', masMs: 4.5 },
      { id: 'c', masMs: 4.5 },
      { id: 'd', masMs: 4.1 },
    ]
    const ranks = computeTeamRank(athletes)
    expect(ranks.get('a')).toBe(1)
    expect(ranks.get('b')).toBe(2)
    expect(ranks.get('c')).toBe(2)
    expect(ranks.get('d')).toBe(4) // skips 3
  })

  it('multiple ties at top; next rank reflects cumulative skip', () => {
    const athletes = [
      { id: 'a', masMs: 5.0 },
      { id: 'b', masMs: 5.0 },
      { id: 'c', masMs: 5.0 },
      { id: 'd', masMs: 4.5 },
    ]
    const ranks = computeTeamRank(athletes)
    expect(ranks.get('a')).toBe(1)
    expect(ranks.get('b')).toBe(1)
    expect(ranks.get('c')).toBe(1)
    expect(ranks.get('d')).toBe(4)
  })

  it('returns null for all athletes when fewer than 2 have masMs', () => {
    const athletes = [
      { id: 'a', masMs: 4.8 },
      { id: 'b', masMs: null },
    ]
    const ranks = computeTeamRank(athletes)
    expect(ranks.get('a')).toBeNull()
    expect(ranks.get('b')).toBeNull()
  })

  it('returns null for all when no athletes have masMs', () => {
    const athletes = [
      { id: 'a', masMs: null },
      { id: 'b', masMs: null },
    ]
    const ranks = computeTeamRank(athletes)
    expect(ranks.get('a')).toBeNull()
    expect(ranks.get('b')).toBeNull()
  })

  it('returns null for all when only one athlete has masMs', () => {
    const athletes = [{ id: 'a', masMs: 4.8 }]
    const ranks = computeTeamRank(athletes)
    expect(ranks.get('a')).toBeNull()
  })

  it('athletes with null masMs are placed at the end, ranked null', () => {
    const athletes = [
      { id: 'a', masMs: 4.8 },
      { id: 'b', masMs: null },
      { id: 'c', masMs: 4.2 },
    ]
    const ranks = computeTeamRank(athletes)
    expect(ranks.get('a')).toBe(1)
    expect(ranks.get('c')).toBe(2)
    expect(ranks.get('b')).toBeNull()
  })
})

// ─── computePositionRank ─────────────────────────────────────────────────────

describe('computePositionRank', () => {
  it('ranks within position group, not overall', () => {
    const athletes = [
      { id: 'a', masMs: 4.8, position: 'MF' },
      { id: 'b', masMs: 4.5, position: 'MF' },
      { id: 'c', masMs: 4.9, position: 'GK' }, // higher MAS but different position
      { id: 'd', masMs: 4.1, position: 'GK' },
    ]
    const ranks = computePositionRank(athletes)
    expect(ranks.get('a')?.rank).toBe(1)  // #1 MF
    expect(ranks.get('b')?.rank).toBe(2)  // #2 MF
    expect(ranks.get('c')?.rank).toBe(1)  // #1 GK
    expect(ranks.get('d')?.rank).toBe(2)  // #2 GK
  })

  it('total reflects group size (athletes with masMs)', () => {
    const athletes = [
      { id: 'a', masMs: 4.8, position: 'MF' },
      { id: 'b', masMs: 4.5, position: 'MF' },
      { id: 'c', masMs: 4.2, position: 'MF' },
    ]
    const ranks = computePositionRank(athletes)
    expect(ranks.get('a')?.total).toBe(3)
    expect(ranks.get('b')?.total).toBe(3)
  })

  it('returns null when fewer than 2 in the position group have masMs', () => {
    const athletes = [
      { id: 'a', masMs: 4.8, position: 'GK' },  // only one GK with masMs
      { id: 'b', masMs: null, position: 'GK' },
      { id: 'c', masMs: 4.5, position: 'MF' },
      { id: 'd', masMs: 4.2, position: 'MF' },
    ]
    const ranks = computePositionRank(athletes)
    expect(ranks.get('a')).toBeNull()
    expect(ranks.get('b')).toBeNull()
    // MF group has 2 — should rank
    expect(ranks.get('c')?.rank).toBe(1)
    expect(ranks.get('d')?.rank).toBe(2)
  })

  it('tied position-group athletes share rank, next skips', () => {
    const athletes = [
      { id: 'a', masMs: 4.8, position: 'MF' },
      { id: 'b', masMs: 4.5, position: 'MF' },
      { id: 'c', masMs: 4.5, position: 'MF' },
      { id: 'd', masMs: 4.1, position: 'MF' },
    ]
    const ranks = computePositionRank(athletes)
    expect(ranks.get('a')?.rank).toBe(1)
    expect(ranks.get('b')?.rank).toBe(2)
    expect(ranks.get('c')?.rank).toBe(2)
    expect(ranks.get('d')?.rank).toBe(4)
  })

  it('athletes with null position are not ranked (group too small)', () => {
    const athletes = [
      { id: 'a', masMs: 4.8, position: null },
      { id: 'b', masMs: 4.5, position: 'MF' },
      { id: 'c', masMs: 4.2, position: 'MF' },
    ]
    const ranks = computePositionRank(athletes)
    expect(ranks.get('a')).toBeNull()
    expect(ranks.get('b')?.rank).toBe(1)
    expect(ranks.get('c')?.rank).toBe(2)
  })
})
