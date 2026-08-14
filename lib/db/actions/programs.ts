'use server'

import { auth } from '@clerk/nextjs/server'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { resolveActiveProgramId, setActiveProgramId } from '@/lib/programs/resolver'
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
  const programId = await resolveActiveProgramId(user.schoolId)

  const [updated] = await db
    .update(programs)
    .set({
      printPaperSize: data.printPaperSize,
      printColor: data.printColor,
    })
    .where(and(eq(programs.id, programId), eq(programs.schoolId, user.schoolId)))
    .returning()
  if (!updated) throw new Error('No program found for this school')
  return updated
}

export async function updateProgramSeasonPhase(
  seasonPhase: 'offseason' | 'preseason' | 'in_season' | 'postseason'
) {
  const user = await getDbUser()
  const programId = await resolveActiveProgramId(user.schoolId)

  const [updated] = await db
    .update(programs)
    .set({ seasonPhase })
    .where(and(eq(programs.id, programId), eq(programs.schoolId, user.schoolId)))
    .returning()
  if (!updated) throw new Error('No program found for this school')
  return updated
}

export async function updateProgramSettings(data: {
  seasonPhase: 'offseason' | 'preseason' | 'in_season' | 'postseason'
  conditioningGoal: 'build' | 'maintain' | 'peak'
}) {
  const user = await getDbUser()
  const programId = await resolveActiveProgramId(user.schoolId)

  const [updated] = await db
    .update(programs)
    .set({
      seasonPhase: data.seasonPhase,
      conditioningGoal: data.conditioningGoal,
    })
    .where(and(eq(programs.id, programId), eq(programs.schoolId, user.schoolId)))
    .returning()
  if (!updated) throw new Error('No program found for this school')
  return updated
}

export async function getProgram() {
  const user = await getDbUser()
  const programId = await resolveActiveProgramId(user.schoolId)

  const [program] = await db
    .select()
    .from(programs)
    .where(and(eq(programs.id, programId), eq(programs.schoolId, user.schoolId)))
    .limit(1)

  return program ?? null
}

/** All programs for the active user's school, for the nav-bar switcher. */
export async function listPrograms() {
  const user = await getDbUser()

  return db
    .select({ id: programs.id, sport: programs.sport, name: programs.name })
    .from(programs)
    .where(eq(programs.schoolId, user.schoolId))
    .orderBy(asc(programs.sport), asc(programs.name))
}

/** Create a new program under the user's school and make it the active one. */
export async function createProgram(data: ProgramDraft) {
  const user = await getDbUser()

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

  await setActiveProgramId(created.id)
  return created
}

/** Switch the active program. Rejects any program outside the user's school. */
export async function setActiveProgram(programId: string) {
  const user = await getDbUser()

  const [program] = await db
    .select({ id: programs.id })
    .from(programs)
    .where(and(eq(programs.id, programId), eq(programs.schoolId, user.schoolId)))
    .limit(1)
  if (!program) throw new Error('Program not found for this school')

  await setActiveProgramId(program.id)
}
