import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/db/actions/sessions'
import { getAthletes } from '@/lib/db/actions/athletes'
import { getMasResultsForSession } from '@/lib/db/actions/results'
import { getProgram } from '@/lib/db/actions/programs'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { SessionSidebar } from '@/components/session/SessionSidebar'
import { BulkEntryTable } from '@/components/session/BulkEntryTable'

type Props = {
  params: Promise<{ id: string }>
}

export default async function MasEntryPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  const { id } = await params

  const [session, program, athletes, existingResults] = await Promise.all([
    getSession(id),
    getProgram(),
    getAthletes(),          // active only
    getMasResultsForSession(id),
  ])

  if (!session || session.testType !== '20M_MST') notFound()
  if (!program) redirect('/dashboard')

  const mappedResults = existingResults.map((r) => ({
    athleteId: r.athleteId,
    level: r.level,
    shuttleInLevel: r.shuttleInLevel,
    totalShuttleCount: r.totalShuttleCount,
    masMs: r.masMs,
    estimatedVo2max: r.estimatedVo2max,
    notes: r.notes,
  }))

  return (
    <div className="flex h-screen bg-[#EEECEA] dark:bg-[#181A1C] overflow-hidden">
      <SessionSidebar
        sessionId={id}
        date={session.date}
        conditions={session.conditions}
        seasonPhase={program.seasonPhase}
        testType="20M_MST"
      />
      <div className="flex flex-col flex-1 min-w-0 bg-[#FFFFFF] dark:bg-[#262A2F]">
        <BulkEntryTable
          sessionId={id}
          athletes={athletes.map((a) => ({
            id: a.id,
            name: a.name,
            position: a.position ?? null,
          }))}
          existingResults={mappedResults}
        />
      </div>
    </div>
  )
}
