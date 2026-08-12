'use server'

import { auth } from '@clerk/nextjs/server'
import { eq, and, inArray, desc, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { setSchoolContext } from '@/lib/db/with-school'
import { athletes, masResults, speedResults, programs, users, testSessions } from '@/lib/db/schema'
import { computeTeamRank, computePositionRank } from '@/lib/utils/rank'

export type TeamReportAthlete = {
  id: string
  name: string
  position: string | null
  displayId: string
  mas: {
    level: number
    shuttleInLevel: number
    totalShuttleCount: number
    masMs: number
    estimatedVo2max: number
    createdAt: Date
  }
  speed: {
    flyTimeS: number
    mssMs: number
    asrMs: number | null
  } | null
  teamRank: number | null
  positionRank: number | null
  positionTotal: number
}

export type TeamReportData = {
  session: {
    id: string
    date: string
    conditions: string | null
  }
  program: {
    sport: string
    name: string
    seasonPhase: string
    conditioningGoal: string
  }
  athletes: TeamReportAthlete[]
  dateRange: { start: Date; end: Date } | null
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

export async function getTeamReport(sessionId: string): Promise<TeamReportData> {
  const user = await getDbUser()
  const programId = await getProgramId(user.schoolId)

  const [session] = await db
    .select()
    .from(testSessions)
    .where(and(eq(testSessions.id, sessionId), eq(testSessions.schoolId, user.schoolId)))
    .limit(1)

  if (!session) throw new Error('Session not found')

  const program = await db
    .select()
    .from(programs)
    .where(eq(programs.id, programId))
    .limit(1)
    .then((rows) => rows[0])

  // MAS results for this session
  const sessionMasRows = await db
    .select()
    .from(masResults)
    .where(and(eq(masResults.sessionId, sessionId), eq(masResults.schoolId, user.schoolId)))

  if (sessionMasRows.length === 0) {
    return {
      session: { id: session.id, date: session.date, conditions: session.conditions },
      program: {
        sport: program.sport,
        name: program.name,
        seasonPhase: program.seasonPhase,
        conditioningGoal: program.conditioningGoal,
      },
      athletes: [],
      dateRange: null,
    }
  }

  const sessionAthleteIds = sessionMasRows.map((r) => r.athleteId)

  // Speed results for athletes in this session
  const sessionSpeedRows = await db
    .select()
    .from(speedResults)
    .where(
      and(
        eq(speedResults.sessionId, sessionId),
        eq(speedResults.schoolId, user.schoolId),
        inArray(speedResults.athleteId, sessionAthleteIds)
      )
    )

  const speedByAthlete = new Map(sessionSpeedRows.map((r) => [r.athleteId, r]))

  // Athlete names
  const athleteRows = await db
    .select({ id: athletes.id, name: athletes.name, position: athletes.position })
    .from(athletes)
    .where(
      and(inArray(athletes.id, sessionAthleteIds), eq(athletes.schoolId, user.schoolId))
    )

  const athleteById = new Map(athleteRows.map((a) => [a.id, a]))

  // Program-wide ranks: all active athletes with their most recent masMs
  const allActiveAthletes = await db
    .select({ id: athletes.id, position: athletes.position })
    .from(athletes)
    .where(
      and(
        eq(athletes.programId, programId),
        eq(athletes.schoolId, user.schoolId),
        eq(athletes.active, true)
      )
    )

  const allAthleteIds = allActiveAthletes.map((a) => a.id)
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

  const rankInputs = allActiveAthletes.map((a) => ({
    id: a.id,
    masMs: masByAthlete.get(a.id) ?? null,
    position: a.position ?? null,
  }))

  const teamRankMap = computeTeamRank(rankInputs)
  const positionRankMap = computePositionRank(rankInputs)

  // All athletes (active+inactive) ordered by createdAt for display IDs
  const allAthletesOrdered = await db
    .select({ id: athletes.id })
    .from(athletes)
    .where(and(eq(athletes.programId, programId), eq(athletes.schoolId, user.schoolId)))
    .orderBy(asc(athletes.createdAt))

  const positionByIndex = new Map(allAthletesOrdered.map((a, i) => [a.id, i + 1]))

  // Date range from masResults.createdAt for this session
  const masCreatedAts = sessionMasRows.map((r) => r.createdAt.getTime())
  const minTs = Math.min(...masCreatedAts)
  const maxTs = Math.max(...masCreatedAts)
  const minDate = new Date(minTs)
  const maxDate = new Date(maxTs)

  const isSameDay =
    minDate.getFullYear() === maxDate.getFullYear() &&
    minDate.getMonth() === maxDate.getMonth() &&
    minDate.getDate() === maxDate.getDate()

  const dateRange = isSameDay ? null : { start: minDate, end: maxDate }

  const reportAthletes: TeamReportAthlete[] = sessionMasRows
    .map((masRow) => {
      const athlete = athleteById.get(masRow.athleteId)
      if (!athlete) return null

      const speedRow = speedByAthlete.get(masRow.athleteId)
      const posIdx = positionByIndex.get(masRow.athleteId) ?? 0
      const displayId = String(posIdx).padStart(5, '0')
      const positionResult = positionRankMap.get(masRow.athleteId)

      return {
        id: athlete.id,
        name: athlete.name,
        position: athlete.position ?? null,
        displayId,
        mas: {
          level: masRow.level,
          shuttleInLevel: masRow.shuttleInLevel,
          totalShuttleCount: masRow.totalShuttleCount,
          masMs: masRow.masMs,
          estimatedVo2max: masRow.estimatedVo2max,
          createdAt: masRow.createdAt,
        },
        speed: speedRow
          ? {
              flyTimeS: speedRow.flyTimeS,
              mssMs: speedRow.mssMs,
              asrMs: speedRow.asrMs ?? null,
            }
          : null,
        teamRank: teamRankMap.get(masRow.athleteId) ?? null,
        positionRank: positionResult?.rank ?? null,
        positionTotal: positionResult?.total ?? 0,
      }
    })
    .filter((a): a is TeamReportAthlete => a !== null)
    .sort((a, b) => b.mas.masMs - a.mas.masMs)

  return {
    session: { id: session.id, date: session.date, conditions: session.conditions },
    program: {
      sport: program.sport,
      name: program.name,
      seasonPhase: program.seasonPhase,
      conditioningGoal: program.conditioningGoal,
    },
    athletes: reportAthletes,
    dateRange,
  }
}
