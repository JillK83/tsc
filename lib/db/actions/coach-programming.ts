'use server'

import { auth } from '@clerk/nextjs/server'
import { eq, and, inArray, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { athletes, masResults, speedResults, programs, users } from '@/lib/db/schema'

export type ProgrammingAthlete = {
  id: string
  name: string
  position: string | null
  masMs: number | null
  asrMs: number | null
}

async function getDbUser() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId))
  if (!user) throw new Error('User not found in DB')
  await setSchoolContext(user.schoolId)
  return user
}

async function getProgramId(schoolId: string) {
  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.schoolId, schoolId))
    .limit(1)
  if (!program) throw new Error('No program found for this school')
  return program.id
}

export async function getAthletesForProgramming(): Promise<ProgrammingAthlete[]> {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  const athleteList = await db
    .select()
    .from(athletes)
    .where(
      and(
        eq(athletes.programId, programId),
        eq(athletes.schoolId, user.schoolId),
        eq(athletes.active, true)
      )
    )
    .orderBy(athletes.name)

  if (athleteList.length === 0) return []

  const athleteIds = athleteList.map((a) => a.id)

  // Fetch all MAS results ordered most-recent first; reduce to one per athlete.
  const masRows = await db
    .select({ athleteId: masResults.athleteId, masMs: masResults.masMs })
    .from(masResults)
    .where(
      and(eq(masResults.schoolId, user.schoolId), inArray(masResults.athleteId, athleteIds))
    )
    .orderBy(desc(masResults.createdAt))

  const masMap = new Map<string, number>()
  for (const r of masRows) {
    if (!masMap.has(r.athleteId)) masMap.set(r.athleteId, r.masMs)
  }

  // Fetch all speed results ordered most-recent first; reduce to one per athlete.
  const speedRows = await db
    .select({ athleteId: speedResults.athleteId, asrMs: speedResults.asrMs })
    .from(speedResults)
    .where(
      and(eq(speedResults.schoolId, user.schoolId), inArray(speedResults.athleteId, athleteIds))
    )
    .orderBy(desc(speedResults.createdAt))

  const asrMap = new Map<string, number | null>()
  for (const r of speedRows) {
    if (!asrMap.has(r.athleteId)) asrMap.set(r.athleteId, r.asrMs ?? null)
  }

  return athleteList.map((a) => ({
    id: a.id,
    name: a.name,
    position: a.position ?? null,
    masMs: masMap.get(a.id) ?? null,
    asrMs: asrMap.get(a.id) ?? null,
  }))
}
