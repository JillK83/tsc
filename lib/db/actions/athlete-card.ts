'use server'

import { auth } from '@clerk/nextjs/server'
import { eq, and, inArray, desc, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { resolveActiveProgramId } from '@/lib/programs/resolver'
import { athletes, masResults, speedResults, programs, users } from '@/lib/db/schema'
import { computeTeamRank, computePositionRank } from '@/lib/utils/rank'

export type MasHistoryRow = {
  id: string
  level: number
  shuttleInLevel: number
  totalShuttleCount: number
  masMs: number
  estimatedVo2max: number
  sessionId: string
  createdAt: Date
}

export type SpeedRow = {
  flyTimeS: number
  mssMs: number
  asrMs: number | null
}

export type AthleteCardData = {
  athlete: {
    id: string
    name: string
    position: string | null
    active: boolean
  }
  program: {
    sport: string
    name: string
    seasonPhase: string
    conditioningGoal: string
  }
  displayId: string
  mostRecentMas: MasHistoryRow | null
  mostRecentSpeed: SpeedRow | null
  masHistory: MasHistoryRow[]
  teamRank: number | null
  teamTotal: number
  positionRank: number | null
  positionTotal: number
  navAthletes?: { id: string; name: string }[]
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

export async function getAthleteCard(
  athleteId: string,
  sessionId?: string
): Promise<AthleteCardData> {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  const [athlete] = await db
    .select()
    .from(athletes)
    .where(and(eq(athletes.id, athleteId), eq(athletes.schoolId, user.schoolId)))
    .limit(1)

  if (!athlete) throw new Error('Athlete not found')

  // All MAS results for this athlete, most recent first
  const masRows = await db
    .select({
      id: masResults.id,
      level: masResults.level,
      shuttleInLevel: masResults.shuttleInLevel,
      totalShuttleCount: masResults.totalShuttleCount,
      masMs: masResults.masMs,
      estimatedVo2max: masResults.estimatedVo2max,
      sessionId: masResults.sessionId,
      createdAt: masResults.createdAt,
    })
    .from(masResults)
    .where(and(eq(masResults.athleteId, athleteId), eq(masResults.schoolId, user.schoolId)))
    .orderBy(desc(masResults.createdAt))

  const [mostRecentSpeedRow] = await db
    .select({
      flyTimeS: speedResults.flyTimeS,
      mssMs: speedResults.mssMs,
      asrMs: speedResults.asrMs,
    })
    .from(speedResults)
    .where(and(eq(speedResults.athleteId, athleteId), eq(speedResults.schoolId, user.schoolId)))
    .orderBy(desc(speedResults.createdAt))
    .limit(1)

  // All active athletes in program with their most recent masMs for rank computation
  const allAthleteRows = await db
    .select({ id: athletes.id, position: athletes.position })
    .from(athletes)
    .where(
      and(
        eq(athletes.programId, programId),
        eq(athletes.schoolId, user.schoolId),
        eq(athletes.active, true)
      )
    )

  const allAthleteIds = allAthleteRows.map((a) => a.id)
  const allMasRows =
    allAthleteIds.length > 0
      ? await db
          .select({ athleteId: masResults.athleteId, masMs: masResults.masMs })
          .from(masResults)
          .where(
            and(
              eq(masResults.schoolId, user.schoolId),
              inArray(masResults.athleteId, allAthleteIds)
            )
          )
          .orderBy(desc(masResults.createdAt))
      : []

  const masByAthlete = new Map<string, number>()
  for (const r of allMasRows) {
    if (!masByAthlete.has(r.athleteId)) masByAthlete.set(r.athleteId, r.masMs)
  }

  const rankInputs = allAthleteRows.map((a) => ({
    id: a.id,
    masMs: masByAthlete.get(a.id) ?? null,
    position: a.position ?? null,
  }))

  const teamRankMap = computeTeamRank(rankInputs)
  const positionRankMap = computePositionRank(rankInputs)

  const teamTotal = rankInputs.filter((a) => a.masMs !== null).length
  const positionResult = positionRankMap.get(athleteId)

  // All athletes (active+inactive) ordered by createdAt for display ID
  const allAthletesOrdered = await db
    .select({ id: athletes.id })
    .from(athletes)
    .where(and(eq(athletes.programId, programId), eq(athletes.schoolId, user.schoolId)))
    .orderBy(asc(athletes.createdAt))

  const displayIndex = allAthletesOrdered.findIndex((a) => a.id === athleteId)
  const displayId = String(displayIndex + 1).padStart(5, '0')

  // Nav athletes: athletes with MAS in this session, ordered by masMs DESC
  let navAthletes: { id: string; name: string }[] | undefined
  if (sessionId) {
    const sessionMasRows = await db
      .select({
        athleteId: masResults.athleteId,
        masMs: masResults.masMs,
      })
      .from(masResults)
      .where(
        and(eq(masResults.sessionId, sessionId), eq(masResults.schoolId, user.schoolId))
      )
      .orderBy(desc(masResults.masMs))

    const sessionAthleteIds = sessionMasRows.map((r) => r.athleteId)
    if (sessionAthleteIds.length > 0) {
      const sessionAthletes = await db
        .select({ id: athletes.id, name: athletes.name })
        .from(athletes)
        .where(
          and(
            inArray(athletes.id, sessionAthleteIds),
            eq(athletes.schoolId, user.schoolId)
          )
        )

      const nameById = new Map(sessionAthletes.map((a) => [a.id, a.name]))
      navAthletes = sessionMasRows
        .filter((r) => nameById.has(r.athleteId))
        .map((r) => ({ id: r.athleteId, name: nameById.get(r.athleteId)! }))
    }
  }

  const program = await db
    .select()
    .from(programs)
    .where(eq(programs.id, programId))
    .limit(1)
    .then((rows) => rows[0])

  return {
    athlete: {
      id: athlete.id,
      name: athlete.name,
      position: athlete.position ?? null,
      active: athlete.active,
    },
    program: {
      sport: program.sport,
      name: program.name,
      seasonPhase: program.seasonPhase,
      conditioningGoal: program.conditioningGoal,
    },
    displayId,
    mostRecentMas: masRows[0] ?? null,
    mostRecentSpeed: mostRecentSpeedRow ?? null,
    masHistory: masRows,
    teamRank: teamRankMap.get(athleteId) ?? null,
    teamTotal,
    positionRank: positionResult?.rank ?? null,
    positionTotal: positionResult?.total ?? 0,
    navAthletes,
  }
}
