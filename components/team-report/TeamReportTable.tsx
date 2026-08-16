'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { TeamReportData } from '@/lib/db/actions/team-report'

type SortKey = 'mas' | 'vo2max' | 'mss'

const SORT_LABELS: Record<SortKey, string> = {
  mas: 'MAS',
  vo2max: 'Estimated VO2max',
  mss: 'MSS',
}

function computeRanks(
  sorted: TeamReportData['athletes'],
  sortKey: SortKey
): Map<string, number | null> {
  const ranks = new Map<string, number | null>()

  const getValue = (a: TeamReportData['athletes'][number]) =>
    sortKey === 'mas' ? a.mas.masMs
    : sortKey === 'vo2max' ? a.mas.estimatedVo2max
    : a.speed?.mssMs ?? null

  const validCount = sorted.filter((a) => {
    const v = getValue(a)
    return v !== null && v !== undefined
  }).length

  if (validCount < 2) {
    for (const a of sorted) ranks.set(a.id, null)
    return ranks
  }

  let rank = 1
  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i]
    const val = getValue(curr)
    if (val === null || val === undefined) { ranks.set(curr.id, null); continue }
    if (i > 0) {
      const prevVal = getValue(sorted[i - 1])
      if (val !== prevVal) rank = i + 1
    }
    ranks.set(curr.id, rank)
  }
  return ranks
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
}

type Props = {
  data: TeamReportData
}

export function TeamReportTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('mas')

  const sorted = [...data.athletes].sort((a, b) => {
    if (sortKey === 'mas') return b.mas.masMs - a.mas.masMs
    if (sortKey === 'vo2max') return b.mas.estimatedVo2max - a.mas.estimatedVo2max
    if (sortKey === 'mss') {
      const bMss = b.speed?.mssMs ?? -Infinity
      const aMss = a.speed?.mssMs ?? -Infinity
      return bMss - aMss
    }
    return 0
  })

  const ranks = computeRanks(sorted, sortKey)

  const displayRank = (athlete: TeamReportData['athletes'][number]) => {
    if (sortKey === 'mas') return athlete.teamRank
    return ranks.get(athlete.id) ?? null
  }

  const colHeaders: { key: SortKey | null; label: string; printLabel?: string; subLabel?: string }[] = [
    { key: null, label: 'Rank' },
    { key: null, label: 'Athlete Name' },
    { key: null, label: 'POS' },
    { key: null, label: '20M MST', subLabel: 'Level.Shuttle' },
    { key: null, label: 'Total Shuttles' },
    { key: 'mas', label: 'MAS (M/S)' },
    { key: 'vo2max', label: 'Estimated VO2max', printLabel: 'Est. VO2max', subLabel: 'mL/kg/min' },
    { key: 'mss', label: 'MSS (M/S)' },
    { key: null, label: 'ASR' },
    { key: null, label: 'Test Date' },
  ]

  return (
    <div>
      <style>{`
        /* NOTE: In the Chrome print dialog, uncheck "Headers and footers"
           for a clean sheet (no URL/date margins). */
        @page {
          size: landscape;
          margin: 0.5in;
        }
        @media print {
          /* App chrome off */
          nav { display: none !important; }
          a { color: #000 !important; text-decoration: none !important; }

          /* Force legible black-on-white regardless of light/dark theme */
          html, body { background: #fff !important; }
          .team-report-table,
          .team-report-table th,
          .team-report-table td {
            color: #000 !important;
            background: #fff !important;
            border-color: #D1D5DB !important;
          }
          /* MAS column header + sort indicator (blue on screen) → black on paper */
          .team-report-table th * { color: #000 !important; }

          .team-report-table {
            table-layout: fixed;
            width: 100%;
            font-size: 10px;
          }
          .team-report-table th,
          .team-report-table td {
            padding: 4px 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          /* Explicit column widths so long names don't truncate and the
             Est. VO2max header doesn't clip. Name column wraps instead. */
          .team-report-table th:nth-child(1),
          .team-report-table td:nth-child(1) { width: 5%; }
          .team-report-table th:nth-child(2),
          .team-report-table td:nth-child(2) { width: 22%; white-space: normal; }
          .team-report-table th:nth-child(3),
          .team-report-table td:nth-child(3) { width: 15%; white-space: normal; }
          .team-report-table th:nth-child(4),
          .team-report-table td:nth-child(4) { width: 9%; }
          .team-report-table th:nth-child(5),
          .team-report-table td:nth-child(5) { width: 9%; }
          .team-report-table th:nth-child(6),
          .team-report-table td:nth-child(6) { width: 8%; }
          .team-report-table th:nth-child(7),
          .team-report-table td:nth-child(7) { width: 11%; }
          .team-report-table th:nth-child(8),
          .team-report-table td:nth-child(8) { width: 7%; }
          .team-report-table th:nth-child(9),
          .team-report-table td:nth-child(9) { width: 5%; }
          .team-report-table th:nth-child(10),
          .team-report-table td:nth-child(10) { width: 9%; }
        }
      `}</style>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Sort by</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-sm border border-[#D9D3CC] dark:border-[#383C40] bg-white dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] rounded-lg px-3 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] dark:focus-visible:ring-[#5A8DEE]"
          >
            <option value="mas">MAS</option>
            <option value="vo2max">Estimated VO2max</option>
            <option value="mss">MSS</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] overflow-x-auto">
        <table className="w-full team-report-table">
          <thead>
            <tr className="border-b border-[#D9D3CC] dark:border-[#383C40]">
              {colHeaders.map((col) => (
                <th
                  key={col.label}
                  className={[
                    'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] whitespace-nowrap',
                    col.key === sortKey
                      ? 'text-[#4A83D8] dark:text-[#5A8DEE]'
                      : 'text-[#6B7280] dark:text-[#9CA3AF]',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => col.key && setSortKey(col.key)}
                    className={[
                      'flex flex-col items-start gap-0.5',
                      col.key ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] dark:focus-visible:ring-[#5A8DEE] rounded' : 'cursor-default',
                    ].join(' ')}
                    tabIndex={col.key ? 0 : -1}
                    aria-sort={col.key === sortKey ? 'descending' : undefined}
                  >
                    <span className="flex items-center gap-1">
                      {col.printLabel ? (
                        <>
                          {/* Screen keeps full word; print abbreviates (pending
                              Roger sign-off — see DECISIONS.md open decisions). */}
                          <span className="print:hidden">{col.label}</span>
                          <span className="hidden print:inline">{col.printLabel}</span>
                        </>
                      ) : (
                        col.label
                      )}
                      {col.key === sortKey && <span>↓</span>}
                    </span>
                    {col.subLabel && (
                      <span className="text-[9px] font-normal normal-case tracking-normal opacity-70">
                        {col.subLabel}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((athlete) => (
              <tr
                key={athlete.id}
                className="border-b last:border-0 border-[#E6E2DE] dark:border-[#30353A] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] transition-colors"
              >
                <td className="px-4 py-3 text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6] tabular-nums whitespace-nowrap">
                  {displayRank(athlete) !== null ? `#${displayRank(athlete)}` : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  <Link
                    href={`/dashboard/athlete/${athlete.id}?session=${data.session.id}`}
                    className="text-[#4A83D8] dark:text-[#5A8DEE] hover:underline focus:outline-none focus-visible:underline"
                  >
                    {athlete.name}
                  </Link>
                </td>
                <td
                  className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]"
                  title={athlete.position ?? undefined}
                >
                  {athlete.position ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                  {athlete.mas.level}.{athlete.mas.shuttleInLevel}
                </td>
                <td className="px-4 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                  {athlete.mas.totalShuttleCount}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                  {athlete.mas.masMs.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                  {athlete.mas.estimatedVo2max}
                </td>
                <td className="px-4 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                  {athlete.speed ? athlete.speed.mssMs.toFixed(1) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                  {athlete.speed?.asrMs != null ? athlete.speed.asrMs.toFixed(1) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] tabular-nums whitespace-nowrap">
                  {formatDate(athlete.mas.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p className="mt-3 text-[11px] text-[#9CA3AF] dark:text-[#6B7280]">
        {data.athletes.length} athlete{data.athletes.length !== 1 ? 's' : ''} · Sorted by{' '}
        {SORT_LABELS[sortKey]}
      </p>
    </div>
  )
}
