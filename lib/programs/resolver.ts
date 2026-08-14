import { cookies } from 'next/headers'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { programs } from '@/lib/db/schema'

/**
 * Active-program persistence for the V1 pilot.
 *
 * A GA can run multiple programs under one school; the "active" one is stored
 * in a cookie. This is deliberately the ONLY place that knows the persistence
 * mechanism — V1.5 swaps the cookie for a `users.current_program_id` column
 * here without touching any call site.
 *
 * Cookie is NOT httpOnly on purpose: the client ProgramSwitcher reads it to
 * mark the active row. The value is only a program id already visible in the UI.
 */
export const ACTIVE_PROGRAM_COOKIE = 'tsc_active_program'

/**
 * Resolve the active program id for a school. Reads the cookie and verifies the
 * program belongs to this school (a foreign/stale cookie can never resolve to
 * another school's program — preserves school isolation). Falls back to the
 * school's oldest program (the onboarding-created one) when absent or invalid.
 */
export async function resolveActiveProgramId(schoolId: string): Promise<string> {
  const cookieStore = await cookies()
  const requested = cookieStore.get(ACTIVE_PROGRAM_COOKIE)?.value

  if (requested) {
    const [scoped] = await db
      .select({ id: programs.id })
      .from(programs)
      .where(and(eq(programs.id, requested), eq(programs.schoolId, schoolId)))
      .limit(1)
    if (scoped) return scoped.id
  }

  const [oldest] = await db
    .select({ id: programs.id })
    .from(programs)
    .where(eq(programs.schoolId, schoolId))
    .orderBy(asc(programs.createdAt))
    .limit(1)
  if (!oldest) throw new Error('No program found for this school')
  return oldest.id
}

/**
 * Persist the active program. Must be called from a Server Action or Route
 * Handler (cookies are read-only during RSC render).
 */
export async function setActiveProgramId(programId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_PROGRAM_COOKIE, programId, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  })
}
