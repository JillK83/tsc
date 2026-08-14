import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { getTeamReport } from '@/lib/db/actions/team-report'
import { TeamReportTable } from '@/components/team-report/TeamReportTable'
import { PrintButton } from '@/components/athlete-card/PrintButton'

const SEASON_LABELS: Record<string, string> = {
  offseason: 'Off-Season',
  preseason: 'Preseason',
  in_season: 'In-Season',
  postseason: 'Postseason',
}

const CONDITIONING_LABELS: Record<string, string> = {
  build: 'Build',
  maintain: 'Maintain',
  peak: 'Peak',
}

function formatDateLong(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatSessionDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateRange(start: Date, end: Date) {
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = end.getFullYear()

  if (startMonth === endMonth && start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${startDay}–${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function TeamReportPage({ params }: Props) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  const { id } = await params

  const data = await getTeamReport(id)

  const dateDisplay = data.dateRange
    ? formatDateRange(data.dateRange.start, data.dateRange.end)
    : formatSessionDate(data.session.date)

  const seasonLabel = SEASON_LABELS[data.program.seasonPhase] ?? data.program.seasonPhase
  const conditioningLabel = CONDITIONING_LABELS[data.program.conditioningGoal] ?? data.program.conditioningGoal

  return (
    <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline mb-4 inline-block print:hidden"
        >
          ← Dashboard
        </Link>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] mb-1">
              {data.program.sport} · {data.program.name}
            </p>
            <h1 className="text-2xl font-bold text-[#0F1515] dark:text-[#F3F4F6]">Team Report</h1>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              {dateDisplay} — {seasonLabel} · {conditioningLabel}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 print:hidden">
            <PrintButton label="Print Report" />
            <p className="text-[11px] text-[#9CA3AF] dark:text-[#6B7280] max-w-[180px] text-right">
              For best results, uncheck Headers and footers in the print dialog.
            </p>
          </div>
        </div>

        {data.athletes.length === 0 ? (
          <div className="bg-white dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] px-8 py-16 text-center">
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              No MAS results recorded for this session yet.
            </p>
          </div>
        ) : (
          <TeamReportTable data={data} />
        )}
      </div>
    </div>
  )
}
