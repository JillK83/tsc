import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { getAthleteCard } from '@/lib/db/actions/athlete-card'
import { AthleteCardScreen } from '@/components/athlete-card/AthleteCardScreen'
import { AthleteCardPrint } from '@/components/athlete-card/AthleteCardPrint'
import { PrintButton } from '@/components/athlete-card/PrintButton'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session?: string }>
}

export default async function AthleteCardPage({ params, searchParams }: Props) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  const { id } = await params
  const { session: sessionId } = await searchParams

  let data
  try {
    data = await getAthleteCard(id, sessionId)
  } catch {
    notFound()
  }

  const navAthletes = data.navAthletes ?? []
  const currentIdx = navAthletes.findIndex((a) => a.id === id)
  const hasPrev = currentIdx !== -1 && navAthletes.length > 1
  const prevAthlete = hasPrev
    ? navAthletes[(currentIdx - 1 + navAthletes.length) % navAthletes.length]
    : null
  const nextAthlete = hasPrev
    ? navAthletes[(currentIdx + 1) % navAthletes.length]
    : null

  const buildAthleteUrl = (athleteId: string) =>
    sessionId
      ? `/dashboard/athlete/${athleteId}?session=${sessionId}`
      : `/dashboard/athlete/${athleteId}`

  return (
    <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Screen nav */}
        <div className="flex items-start justify-between mb-6 print:hidden">
          {sessionId ? (
            <Link
              href={`/dashboard/session/${sessionId}/report`}
              className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline"
            >
              ← Back to Team Report
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline"
            >
              ← Dashboard
            </Link>
          )}
          <div className="flex flex-col items-end gap-1">
            <PrintButton label="Print Card" />
            <p className="text-[11px] text-[#9CA3AF] dark:text-[#6B7280] max-w-[180px] text-right">
              For best results, uncheck Headers and footers in the print dialog.
            </p>
          </div>
        </div>

        {/* Screen card */}
        <div className="print:hidden">
          <AthleteCardScreen data={data} />
        </div>

        {/* Prev/next nav — below card, muted */}
        {hasPrev && (
          <div className="flex items-center justify-between mt-4 print:hidden">
            <div>
              {prevAthlete && (
                <Link
                  href={buildAthleteUrl(prevAthlete.id)}
                  className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline"
                >
                  ← {prevAthlete.name}
                </Link>
              )}
            </div>
            <div>
              {nextAthlete && (
                <Link
                  href={buildAthleteUrl(nextAthlete.id)}
                  className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline"
                >
                  {nextAthlete.name} →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Print card */}
        <AthleteCardPrint data={data} />
      </div>
    </div>
  )
}
