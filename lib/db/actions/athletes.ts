'use server'

import { auth } from '@clerk/nextjs/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { resolveActiveProgramId } from '@/lib/programs/resolver'
import { athletes, users } from '@/lib/db/schema'

type AthleteInput = {
  name: string
  position?: string
  sex: 'male' | 'female'
  birthDate?: string
}

async function getDbUser() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
  if (!user) throw new Error('User not found in DB')
  await setSchoolContext(user.schoolId)
  return user
}

async function getProgramId(schoolId: string) {
  return resolveActiveProgramId(schoolId)
}

export async function bulkInsertAthletes(athleteList: AthleteInput[]) {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  if (athleteList.length === 0) return []

  const rows = athleteList.map((a) => ({
    programId,
    schoolId: user.schoolId,
    name: a.name.trim(),
    position: a.position?.trim() || null,
    sex: a.sex,
    birthDate: a.birthDate || null,
    active: true,
  }))

  return db.insert(athletes).values(rows).returning()
}

export async function createAthlete(data: AthleteInput) {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  const [created] = await db
    .insert(athletes)
    .values({
      programId,
      schoolId: user.schoolId,
      name: data.name.trim(),
      position: data.position?.trim() || null,
      sex: data.sex,
      birthDate: data.birthDate || null,
      active: true,
    })
    .returning()
  return created
}

export async function updateAthlete(
  athleteId: string,
  data: AthleteInput
) {
  const user = await getDbUser()

  const [updated] = await db
    .update(athletes)
    .set({
      name: data.name.trim(),
      position: data.position?.trim() || null,
      sex: data.sex,
      birthDate: data.birthDate || null,
    })
    .where(
      and(eq(athletes.id, athleteId), eq(athletes.schoolId, user.schoolId))
    )
    .returning()
  return updated
}

export async function deactivateAthlete(athleteId: string) {
  const user = await getDbUser()

  const [updated] = await db
    .update(athletes)
    .set({ active: false })
    .where(
      and(eq(athletes.id, athleteId), eq(athletes.schoolId, user.schoolId))
    )
    .returning()
  return updated
}

export async function reactivateAthlete(athleteId: string) {
  const user = await getDbUser()

  const [updated] = await db
    .update(athletes)
    .set({ active: true })
    .where(
      and(eq(athletes.id, athleteId), eq(athletes.schoolId, user.schoolId))
    )
    .returning()
  return updated
}

export async function getAthletes(includeInactive = false) {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  const conditions = [
    eq(athletes.programId, programId),
    eq(athletes.schoolId, user.schoolId),
  ]
  if (!includeInactive) {
    conditions.push(eq(athletes.active, true))
  }

  return db
    .select()
    .from(athletes)
    .where(and(...conditions))
    .orderBy(athletes.name)
}

export async function checkDuplicateName(name: string) {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  const [existing] = await db
    .select({ id: athletes.id })
    .from(athletes)
    .where(
      and(
        eq(athletes.programId, programId),
        eq(athletes.schoolId, user.schoolId),
        eq(athletes.name, name.trim())
      )
    )
    .limit(1)

  return !!existing
}
