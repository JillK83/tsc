const COD_CONSTANT = 0.7

export function masDistanceStraight(
  masMs: number,
  intensityPct: number,
  workIntervalS: number
): number {
  return masMs * (intensityPct / 100) * workIntervalS
}

// Returns per-leg distance for shuttle. Display as "43.4 / 43.4".
export function masDistanceShuttle(
  masMs: number,
  intensityPct: number,
  workIntervalS: number
): number {
  const straight = masDistanceStraight(masMs, intensityPct, workIntervalS)
  const adjusted = straight - masMs * COD_CONSTANT
  return adjusted / 2
}

export function asrDistance(
  masMs: number,
  asrMs: number,
  asrPct: number,
  workIntervalS: number
): number {
  return (masMs + asrMs * (asrPct / 100)) * workIntervalS
}
