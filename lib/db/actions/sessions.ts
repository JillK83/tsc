'use server'

import { auth } from '@clerk/nextjs/server'
import { eq, and, desc, count, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { resolveActiveProgramId } from '@/lib/programs/resolver'
import { testSessions, users, masResults, speedResults } from '@/lib/db/schema'

type SessionInput = {
  date: string
  testType: '20M_MST' | 'speed'
  conditions?: string
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
  return resolveActiveProgramId(schoolId)
}

export async function createSession(input: SessionInput) {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  const [session] = await db
    .insert(testSessions)
    .values({
      programId,
      schoolId: user.schoolId,
      createdBy: user.id,
      date: input.date,
      testType: input.testType,
      conditions: input.conditions || null,
    })
    .returning()

  return session
}

export async function getSession(sessionId: string) {
  const user = await getDbUser()

  const [session] = await db
    .select()
    .from(testSessions)
    .where(
      and(
        eq(testSessions.id, sessionId),
        eq(testSessions.schoolId, user.schoolId)
      )
    )

  return session ?? null
}

export async function updateSessionConditions(sessionId: string, conditions: string) {
  const user = await getDbUser()

  const [updated] = await db
    .update(testSessions)
    .set({ conditions: conditions || null })
    .where(
      and(
        eq(testSessions.id, sessionId),
        eq(testSessions.schoolId, user.schoolId)
      )
    )
    .returning()

  return updated
}

export async function listSessions() {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  return db
    .select()
    .from(testSessions)
    .where(
      and(
        eq(testSessions.schoolId, user.schoolId),
        eq(testSessions.programId, programId)
      )
    )
    .orderBy(desc(testSessions.date), desc(testSessions.createdAt))
}

export async function getSessionsWithResults(sessionIds: string[]): Promise<Set<string>> {
  if (sessionIds.length === 0) return new Set()
  const user = await getDbUser()

  const [masRows, speedRows] = await Promise.all([
    db
      .selectDistinct({ sessionId: masResults.sessionId })
      .from(masResults)
      .where(
        and(
          inArray(masResults.sessionId, sessionIds),
          eq(masResults.schoolId, user.schoolId)
        )
      ),
    db
      .selectDistinct({ sessionId: speedResults.sessionId })
      .from(speedResults)
      .where(
        and(
          inArray(speedResults.sessionId, sessionIds),
          eq(speedResults.schoolId, user.schoolId)
        )
      ),
  ])

  return new Set([
    ...masRows.map((r) => r.sessionId),
    ...speedRows.map((r) => r.sessionId),
  ])
}

export async function deleteSession(sessionId: string): Promise<void> {
  const user = await getDbUser()
  if (user.role === 'director') throw new Error('Directors cannot delete sessions')

  const [[masCheck], [speedCheck]] = await Promise.all([
    db
      .select({ n: count() })
      .from(masResults)
      .where(
        and(eq(masResults.sessionId, sessionId), eq(masResults.schoolId, user.schoolId))
      ),
    db
      .select({ n: count() })
      .from(speedResults)
      .where(
        and(eq(speedResults.sessionId, sessionId), eq(speedResults.schoolId, user.schoolId))
      ),
  ])

  if ((masCheck?.n ?? 0) + (speedCheck?.n ?? 0) > 0) {
    throw new Error('Cannot delete session with saved results')
  }

  await db
    .delete(testSessions)
    .where(
      and(eq(testSessions.id, sessionId), eq(testSessions.schoolId, user.schoolId))
    )
}
