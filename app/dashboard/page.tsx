import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { listSessions, getSessionsWithResults } from '@/lib/db/actions/sessions'
import { getProgram } from '@/lib/db/actions/programs'
import { ThemeToggle } from '@/components/theme-toggle'
import { DeleteSessionButton } from '@/components/session/DeleteSessionButton'

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const TEST_TYPE_LABELS: Record<string, string> = {
  '20M_MST': '20m MST',
  speed: 'Speed',
}

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const role = user.publicMetadata?.role as string | undefined
  if (!role) {
    return (
      <div className="min-h-screen bg-[#EEECEA] dark:bg-[#181A1C] flex items-center justify-center">
        <p className="text-sm text-[#9CA3AF]">
          Account not provisioned. Contact your administrator.
        </p>
      </div>
    )
  }

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  const [program, sessions] = await Promise.all([getProgram(), listSessions()])
  const sessionResultSet = sessions.length > 0
    ? await getSessionsWithResults(sessions.map((s) => s.id))
    : new Set<string>()

  return (
    <div className="min-h-screen bg-[#EEECEA] dark:bg-[#181A1C] px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            {program && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] mb-1">
                {program.sport} · {program.name}
              </p>
            )}
            <h1 className="text-2xl font-bold text-[#0F1515] dark:text-[#F3F4F6]">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard/coach-programming"
              className="px-4 py-2 rounded-xl border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] text-sm font-semibold hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
            >
              Coach Programming
            </Link>
            <Link
              href="/dashboard/roster"
              className="px-4 py-2 rounded-xl border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] text-sm font-semibold hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
            >
              Roster
            </Link>
            <Link
              href="/dashboard/session/new"
              className="px-4 py-2 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] dark:hover:bg-[#4A83D8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
            >
              + New session
            </Link>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D9D3CC] dark:border-[#383C40]">
            <h2 className="text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6]">
              Sessions
            </h2>
          </div>

          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                No sessions yet. Create your first session to start entering data.
              </p>
              <Link
                href="/dashboard/session/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] transition-colors"
              >
                + New session
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D9D3CC] dark:border-[#383C40]">
                  {['Date', 'Type', 'Conditions', ''].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 border-[#E6E2DE] dark:border-[#30353A] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] transition-colors"
                  >
                    <td className="px-6 py-3 text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                      {formatDate(s.date)}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {TEST_TYPE_LABELS[s.testType] ?? s.testType}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {s.conditions || '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <DeleteSessionButton
                          sessionId={s.id}
                          hasResults={sessionResultSet.has(s.id)}
                        />
                        <Link
                          href={
                            s.testType === '20M_MST'
                              ? `/dashboard/session/${s.id}/mas-entry`
                              : `/dashboard/session/${s.id}/speed-entry`
                          }
                          className="text-sm text-[#4A83D8] dark:text-[#5A8DEE] hover:underline focus:outline-none focus-visible:underline"
                        >
                          Open →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
