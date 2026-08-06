'use server'

import { auth } from '@clerk/nextjs/server'
import { eq, and, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { masResults, users } from '@/lib/db/schema'

type MasResultInput = {
  athleteId: string
  level: number
  shuttleInLevel: number
  totalShuttleCount: number
  vvo2maxKmh: number
  masMs: number
  estimatedVo2max: number
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
 * Upserts MAS results for a session. One row per athlete per session —
 * if a result already exists for that athlete/session pair, it is replaced.
 */
export async function saveMasResults(
  sessionId: string,
  results: MasResultInput[]
) {
  if (results.length === 0) return []
  const user = await getDbUser()

  // Delete existing results for these athletes in this session, then re-insert.
  // Simpler than a true upsert given Drizzle's current onConflict API.
  const athleteIds = results.map((r) => r.athleteId)
  if (athleteIds.length > 0) {
    await db.delete(masResults).where(
      and(
        eq(masResults.sessionId, sessionId),
        eq(masResults.schoolId, user.schoolId),
        inArray(masResults.athleteId, athleteIds)
      )
    )
  }

  const rows = results.map((r) => ({
    sessionId,
    athleteId: r.athleteId,
    schoolId: user.schoolId,
    level: r.level,
    shuttleInLevel: r.shuttleInLevel,
    totalShuttleCount: r.totalShuttleCount,
    vvo2maxKmh: r.vvo2maxKmh,
    masMs: r.masMs,
    estimatedVo2max: r.estimatedVo2max,
    notes: r.notes || null,
  }))

  return db.insert(masResults).values(rows).returning()
}

export async function getMasResultsForSession(sessionId: string) {
  const user = await getDbUser()

  return db
    .select()
    .from(masResults)
    .where(
      and(
        eq(masResults.sessionId, sessionId),
        eq(masResults.schoolId, user.schoolId)
      )
    )
}
