'use server'

import { auth } from '@clerk/nextjs/server'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { testSessions, users, programs } from '@/lib/db/schema'

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
  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.schoolId, schoolId))
    .limit(1)
  if (!program) throw new Error('No program found for this school')
  return program.id
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

  return db
    .select()
    .from(testSessions)
    .where(eq(testSessions.schoolId, user.schoolId))
    .orderBy(desc(testSessions.date), desc(testSessions.createdAt))
}
