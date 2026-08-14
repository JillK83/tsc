import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/db/actions/sessions'
import { getAthletes } from '@/lib/db/actions/athletes'
import { getSpeedResultsForSession, getMasForSpeedEntry } from '@/lib/db/actions/speed-results'
import { getProgram } from '@/lib/db/actions/programs'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { SessionSidebar } from '@/components/session/SessionSidebar'
import { SpeedEntryTable } from '@/components/session/SpeedEntryTable'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SpeedEntryPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  const { id } = await params

  const [session, program, athletes, existingResults] = await Promise.all([
    getSession(id),
    getProgram(),
    getAthletes(),
    getSpeedResultsForSession(id),
  ])

  if (!session || session.testType !== 'speed') notFound()
  if (!program) redirect('/dashboard')

  const masMap = await getMasForSpeedEntry(
    id,
    athletes.map((a) => a.id)
  )

  const mappedResults = existingResults.map((r) => ({
    athleteId: r.athleteId,
    flyTimeS: r.flyTimeS,
    mssMs: r.mssMs,
    asrMs: r.asrMs,
    notes: r.notes,
  }))

  return (
    <div className="flex h-full bg-[#EEECEA] dark:bg-[#181A1C] overflow-hidden">
      <SessionSidebar
        sessionId={id}
        date={session.date}
        conditions={session.conditions}
        seasonPhase={program.seasonPhase}
        testType="speed"
      />
      <div className="flex flex-col flex-1 min-w-0 bg-[#FFFFFF] dark:bg-[#262A2F]">
        <SpeedEntryTable
          sessionId={id}
          athletes={athletes.map((a) => ({
            id: a.id,
            name: a.name,
            position: a.position ?? null,
          }))}
          masMap={Object.fromEntries(masMap)}
          existingResults={mappedResults}
        />
      </div>
    </div>
  )
}
