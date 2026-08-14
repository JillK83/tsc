import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAthletes } from '@/lib/db/actions/athletes'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { DeactivateButton } from '@/components/roster/DeactivateButton'
import { ReactivateButton } from '@/components/roster/ReactivateButton'

export default async function RosterPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  const athletes = await getAthletes(true) // include inactive

  return (
    <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline mb-1 inline-block"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#0F1515] dark:text-[#F3F4F6]">Roster</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/roster/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] dark:hover:bg-[#4A83D8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
            >
              + Add athlete
            </Link>
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] overflow-hidden">
          {athletes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                No athletes yet. Add your first athlete to get started.
              </p>
              <Link
                href="/dashboard/roster/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] transition-colors"
              >
                + Add athlete
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D9D3CC] dark:border-[#383C40]">
                  {['Name', 'Position', 'Sex', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete) => (
                  <tr
                    key={athlete.id}
                    className={[
                      'border-b last:border-0 border-[#E6E2DE] dark:border-[#30353A] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] transition-colors',
                      !athlete.active ? 'opacity-60' : '',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#0F1515] dark:text-[#F3F4F6]">
                      {athlete.name}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">
                      {athlete.position || '—'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280] dark:text-[#9CA3AF] capitalize">
                      {athlete.sex}
                    </td>
                    <td className="px-4 py-3">
                      {athlete.active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D6F0E5] text-[#1E6E4C] dark:bg-[#0B2D1E] dark:text-[#5ECFA0]">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAFAF8] text-[#9CA3AF] dark:bg-[#2D3338] dark:text-[#6B7280]">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          href={`/dashboard/roster/${athlete.id}/edit`}
                          className="text-xs text-[#4A83D8] dark:text-[#5A8DEE] hover:underline focus:outline-none focus-visible:underline"
                        >
                          Edit
                        </Link>
                        {athlete.active ? (
                          <DeactivateButton athleteId={athlete.id} athleteName={athlete.name} />
                        ) : (
                          <ReactivateButton athleteId={athlete.id} athleteName={athlete.name} />
                        )}
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
