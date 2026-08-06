'use server'

import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { programs, users } from '@/lib/db/schema'

type ProgramDraft = {
  sport: string
  name: string
  seasonPhase: 'offseason' | 'preseason' | 'in_season' | 'postseason'
  conditioningGoal: 'build' | 'maintain' | 'peak'
}

type PrintPrefs = {
  printPaperSize: 'letter_8_5x11' | 'a4'
  printColor: 'color' | 'bw'
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

export async function upsertProgram(data: ProgramDraft) {
  const user = await getDbUser()

  const existing = await db
    .select()
    .from(programs)
    .where(eq(programs.schoolId, user.schoolId))
    .limit(1)

  if (existing.length > 0) {
    const [updated] = await db
      .update(programs)
      .set({
        sport: data.sport,
        name: data.name,
        seasonPhase: data.seasonPhase,
        conditioningGoal: data.conditioningGoal,
      })
      .where(eq(programs.id, existing[0].id))
      .returning()
    return updated
  }

  const [created] = await db
    .insert(programs)
    .values({
      schoolId: user.schoolId,
      sport: data.sport,
      name: data.name,
      seasonPhase: data.seasonPhase,
      conditioningGoal: data.conditioningGoal,
    })
    .returning()
  return created
}

export async function updateProgramPrintPrefs(data: PrintPrefs) {
  const user = await getDbUser()

  const [existing] = await db
    .select()
    .from(programs)
    .where(eq(programs.schoolId, user.schoolId))
    .limit(1)

  if (!existing) throw new Error('No program found for this school')

  const [updated] = await db
    .update(programs)
    .set({
      printPaperSize: data.printPaperSize,
      printColor: data.printColor,
    })
    .where(eq(programs.id, existing.id))
    .returning()
  return updated
}

export async function updateProgramSeasonPhase(
  seasonPhase: 'offseason' | 'preseason' | 'in_season' | 'postseason'
) {
  const user = await getDbUser()

  const [existing] = await db
    .select()
    .from(programs)
    .where(eq(programs.schoolId, user.schoolId))
    .limit(1)

  if (!existing) throw new Error('No program found for this school')

  const [updated] = await db
    .update(programs)
    .set({ seasonPhase })
    .where(eq(programs.id, existing.id))
    .returning()
  return updated
}

export async function getProgram() {
  const user = await getDbUser()

  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.schoolId, user.schoolId))
    .limit(1)

  return program ?? null
}
