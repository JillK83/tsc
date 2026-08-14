import type { AthleteCardData } from '@/lib/db/actions/athlete-card'

const SEASON_LABELS: Record<string, string> = {
  offseason: 'Off-Season',
  preseason: 'Preseason',
  in_season: 'In-Season',
  postseason: 'Postseason',
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatLevelShuttle(level: number, shuttleInLevel: number) {
  return `${level}.${shuttleInLevel}`
}

type Props = {
  data: AthleteCardData
}

export function AthleteCardPrint({ data }: Props) {
  const {
    athlete,
    program,
    mostRecentMas,
    mostRecentSpeed,
    masHistory,
    teamRank,
    teamTotal,
    positionRank,
    positionTotal,
  } = data

  const hasSpeed = mostRecentSpeed !== null
  const testDate = mostRecentMas ? formatDate(mostRecentMas.createdAt) : null
  const recentHistory = masHistory.slice(0, 3)
  const seasonLabel = SEASON_LABELS[program.seasonPhase] ?? program.seasonPhase

  return (
    <>
      <style>{`
        /* NOTE: In the Chrome print dialog, uncheck "Headers and footers"
           for a clean sheet (no URL/date margins). */
        @page {
          size: landscape;
          margin: 0.5in;
        }
        @media print {
          /* App chrome off — hides nav bar (wordmark, theme toggle, avatar) */
          nav { display: none !important; }
          a { color: #000 !important; text-decoration: none !important; }

          html, body {
            background: #fff !important;
            color: #000 !important;
          }
          body * {
            background-color: transparent !important;
            color: #000 !important;
            border-color: #D1D5DB !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Visible border on the MAS tile so hierarchy survives when
             "Background graphics" is unchecked in the Chrome print dialog. */
          .mas-print-tile {
            border: 1.5px solid #000 !important;
            border-radius: 4px;
          }
        }
      `}</style>

      <div className="hidden print:block font-sans text-black">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 border-b border-gray-300 pb-3">
          <div>
            <h1 className="text-2xl font-extrabold text-black leading-tight">{athlete.name}</h1>
            {athlete.position && (
              <div className="mt-1">
                <span className="px-2 py-0.5 border border-gray-400 rounded text-[10px] font-semibold text-black">
                  {athlete.position}
                </span>
              </div>
            )}
          </div>
          <div className="text-right text-xs text-gray-700">
            {testDate && <p className="font-semibold text-sm">{testDate}</p>}
            <p>{program.sport} — {seasonLabel}</p>
          </div>
        </div>

        {/* Speed data note — print only, plain text */}
        {!hasSpeed && (
          <p className="text-[9px] font-semibold uppercase tracking-widest text-black mb-2">
            Speed Data Missing
          </p>
        )}

        {/* Metric grid */}
        {mostRecentMas && (
          <div className="border border-gray-300 rounded mb-4">
            {/* Row 1 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="mas-print-tile px-4 py-3 border-r border-gray-300">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">MAS (M/S)</p>
                <p className="text-[32px] leading-none font-extrabold text-black tabular-nums mt-1">
                  {mostRecentMas.masMs.toFixed(1)}
                </p>
              </div>
              <div className="px-4 py-3 border-r border-gray-300">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">20M MST</p>
                <p className="text-2xl font-extrabold text-black tabular-nums mt-1">
                  {formatLevelShuttle(mostRecentMas.level, mostRecentMas.shuttleInLevel)}
                </p>
              </div>
              <div className="px-4 py-3 border-r border-gray-300">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">Total Shuttles</p>
                <p className="text-2xl font-extrabold text-black tabular-nums mt-1">
                  {mostRecentMas.totalShuttleCount}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">
                  Estimated VO2max (mL/kg/min)
                </p>
                <p className="text-2xl font-extrabold text-black tabular-nums mt-1">
                  {mostRecentMas.estimatedVo2max}
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-5">
              <div className="px-4 py-3 border-r border-gray-300">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">MSS (M/S)</p>
                <p className="text-xl font-bold text-black tabular-nums mt-1">
                  {hasSpeed ? mostRecentSpeed!.mssMs.toFixed(1) : <span className="text-gray-600 font-normal text-sm">Not recorded</span>}
                </p>
              </div>
              <div className="px-4 py-3 border-r border-gray-300">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">10M Fly Time (S)</p>
                <p className="text-xl font-bold text-black tabular-nums mt-1">
                  {hasSpeed ? mostRecentSpeed!.flyTimeS.toFixed(2) : <span className="text-gray-600 font-normal text-sm">Not recorded</span>}
                </p>
              </div>
              <div className="px-4 py-3 border-r border-gray-300">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">ASR</p>
                <p className="text-xl font-bold text-black tabular-nums mt-1">
                  {hasSpeed && mostRecentSpeed!.asrMs !== null
                    ? mostRecentSpeed!.asrMs.toFixed(1)
                    : <span className="text-gray-600 font-normal text-sm">{hasSpeed ? '—' : 'Not recorded'}</span>}
                </p>
              </div>
              <div className="px-4 py-3 border-r border-gray-300">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">Team Rank</p>
                <p className="text-xl font-bold text-black tabular-nums mt-1">
                  {teamRank !== null ? `${teamRank} of ${teamTotal}` : '—'}
                </p>
                {teamRank !== null && <p className="text-[9px] text-gray-500 mt-0.5">by MAS</p>}
              </div>
              <div className="px-4 py-3">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">Position Rank</p>
                <p className="text-xl font-bold text-black tabular-nums mt-1">
                  {positionRank !== null ? `${positionRank} of ${positionTotal}` : '—'}
                </p>
                {positionRank !== null && <p className="text-[9px] text-gray-500 mt-0.5">by MAS</p>}
              </div>
            </div>
          </div>
        )}

        {/* Test history */}
        {recentHistory.length > 0 && (
          <div className="border border-gray-300 rounded">
            <div className="px-4 py-2 border-b border-gray-300">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">
                Test History
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  {['Test Date', '20M MST', 'Total Shuttles', 'MAS (M/S)', 'Estimated VO2max (mL/kg/min)'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-1.5 text-left text-[8px] font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((row, idx) => (
                  <tr key={row.id} className="border-b last:border-0 border-gray-200">
                    <td className="px-4 py-2 text-xs text-black font-medium">
                      <span className="flex items-center gap-2">
                        {formatDate(row.createdAt)}
                        {idx === 0 && (
                          <span className="text-[8px] font-bold uppercase text-black tracking-wide">
                            LATEST
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-black tabular-nums">
                      {formatLevelShuttle(row.level, row.shuttleInLevel)}
                    </td>
                    <td className="px-4 py-2 text-xs text-black tabular-nums">
                      {row.totalShuttleCount}
                    </td>
                    <td className="px-4 py-2 text-xs text-black tabular-nums">
                      {row.masMs.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-xs text-black tabular-nums text-right">
                      {row.estimatedVo2max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-2 text-[8px] italic text-gray-500 border-t border-gray-200">
              Full test history available in app.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
