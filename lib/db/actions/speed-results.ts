'use server'

import { auth } from '@clerk/nextjs/server'
import { eq, and, inArray, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { speedResults, masResults, users } from '@/lib/db/schema'
import { computeSpeedResult } from '@/lib/formulas/speed'

type SpeedResultInput = {
  athleteId: string
  flyTimeS: number
  masMs: number | null
  notes?: string
}

async function getDbUser() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId))
  if (!user) throw new Error('User not found in DB')
  await setSchoolContext(user.schoolId)
  return user
}

/**
 * Returns a Map<athleteId, masMs> for ASR computation.
 * Priority: same session → most recent prior session → absent (null).
 */
export async function getMasForSpeedEntry(
  sessionId: string,
  athleteIds: string[]
): Promise<Map<string, number>> {
  if (athleteIds.length === 0) return new Map()
  const user = await getDbUser()
  const masMap = new Map<string, number>()

  const sameSession = await db
    .select({ athleteId: masResults.athleteId, masMs: masResults.masMs })
    .from(masResults)
    .where(
      and(
        eq(masResults.sessionId, sessionId),
        eq(masResults.schoolId, user.schoolId),
        inArray(masResults.athleteId, athleteIds)
      )
    )

  for (const r of sameSession) masMap.set(r.athleteId, r.masMs)

  const remaining = athleteIds.filter((id) => !masMap.has(id))
  if (remaining.length > 0) {
    const prior = await db
      .select({ athleteId: masResults.athleteId, masMs: masResults.masMs })
      .from(masResults)
      .where(
        and(
          eq(masResults.schoolId, user.schoolId),
          inArray(masResults.athleteId, remaining)
        )
      )
      .orderBy(desc(masResults.createdAt))

    for (const r of prior) {
      if (!masMap.has(r.athleteId)) masMap.set(r.athleteId, r.masMs)
    }
  }

  return masMap
}

export async function getSpeedResultsForSession(sessionId: string) {
  const user = await getDbUser()

  return db
    .select()
    .from(speedResults)
    .where(
      and(
        eq(speedResults.sessionId, sessionId),
        eq(speedResults.schoolId, user.schoolId)
      )
    )
}

/**
 * Upserts speed results for a session. Delete-then-insert per athlete pair.
 */
export async function saveSpeedResults(
  sessionId: string,
  results: SpeedResultInput[]
) {
  if (results.length === 0) return []
  const user = await getDbUser()

  if (user.role === 'director') throw new Error('Directors cannot write results')

  const athleteIds = results.map((r) => r.athleteId)
  await db.delete(speedResults).where(
    and(
      eq(speedResults.sessionId, sessionId),
      eq(speedResults.schoolId, user.schoolId),
      inArray(speedResults.athleteId, athleteIds)
    )
  )

  const rows = results.map((r) => {
    const { mssMs, asrMs } = computeSpeedResult(r.flyTimeS, r.masMs)
    return {
      sessionId,
      athleteId: r.athleteId,
      schoolId: user.schoolId,
      flyDistanceM: 10.0,
      flyTimeS: r.flyTimeS,
      mssMs,
      asrMs,
      notes: r.notes || null,
    }
  })

  return db.insert(speedResults).values(rows).returning()
}
