export type RankInput = {
  id: string
  masMs: number | null
}

export type PositionRankInput = RankInput & {
  position: string | null
}

export type PositionRankResult = {
  rank: number | null
  total: number
}

/**
 * Assigns gap-style ranks to athletes by masMs DESC (nulls last).
 * Tied athletes share a rank; the next rank after a tie skips.
 * Returns null for all athletes when fewer than 2 have masMs values.
 */
export function computeTeamRank(athletes: RankInput[]): Map<string, number | null> {
  const result = new Map<string, number | null>()
  const withMas = athletes.filter((a) => a.masMs !== null)

  if (withMas.length < 2) {
    for (const a of athletes) result.set(a.id, null)
    return result
  }

  const sorted = [...athletes].sort((a, b) => {
    if (a.masMs === null && b.masMs === null) return 0
    if (a.masMs === null) return 1
    if (b.masMs === null) return -1
    return b.masMs - a.masMs
  })

  let rank = 1
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]
    if (a.masMs === null) {
      result.set(a.id, null)
      continue
    }
    if (i > 0) {
      const prev = sorted[i - 1]
      if (prev.masMs !== null && prev.masMs !== a.masMs) {
        rank = i + 1
      }
    }
    result.set(a.id, rank)
  }

  return result
}

/**
 * Assigns gap-style ranks scoped to position group.
 * Athletes with null position are ranked independently (no group).
 * Returns null rank when fewer than 2 athletes share the same position.
 */
export function computePositionRank(
  athletes: PositionRankInput[]
): Map<string, PositionRankResult | null> {
  const result = new Map<string, PositionRankResult | null>()
  const byPosition = new Map<string, PositionRankInput[]>()

  for (const a of athletes) {
    const key = a.position ?? '__none__'
    if (!byPosition.has(key)) byPosition.set(key, [])
    byPosition.get(key)!.push(a)
  }

  for (const [, group] of byPosition) {
    const withMas = group.filter((a) => a.masMs !== null)
    const total = withMas.length

    if (total < 2) {
      for (const a of group) result.set(a.id, null)
      continue
    }

    const sorted = [...group].sort((a, b) => {
      if (a.masMs === null && b.masMs === null) return 0
      if (a.masMs === null) return 1
      if (b.masMs === null) return -1
      return b.masMs - a.masMs
    })

    let rank = 1
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i]
      if (a.masMs === null) {
        result.set(a.id, null)
        continue
      }
      if (i > 0) {
        const prev = sorted[i - 1]
        if (prev.masMs !== null && prev.masMs !== a.masMs) {
          rank = i + 1
        }
      }
      result.set(a.id, { rank, total })
    }
  }

  return result
}
