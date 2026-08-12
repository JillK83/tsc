import type { AthleteCardData } from '@/lib/db/actions/athlete-card'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatLevelShuttle(level: number, shuttleInLevel: number) {
  return `${level}.${shuttleInLevel}`
}

type MetricTileProps = {
  label: string
  subLabel?: string
  value: React.ReactNode
  borderLeft?: boolean
}

function MetricTile({ label, subLabel, value, borderLeft = true }: MetricTileProps) {
  return (
    <div
      className={[
        'px-4 py-3 flex flex-col justify-between',
        borderLeft ? 'border-l border-[#E6E2DE] dark:border-[#30353A]' : '',
      ].join(' ')}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
          {label}
        </p>
        {subLabel && (
          <p className="text-[9px] text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">{subLabel}</p>
        )}
      </div>
      <div className="text-[17px] font-semibold text-[#0F1515] dark:text-[#F3F4F6] tabular-nums mt-2">
        {value}
      </div>
    </div>
  )
}

type Props = {
  data: AthleteCardData
}

export function AthleteCardScreen({ data }: Props) {
  const {
    athlete,
    program,
    displayId,
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

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
          Athlete Score Card
        </p>
        {!hasSpeed && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FDF3DC] text-[#A67520] border border-[#C98E24]">
            Speed Data Missing
          </span>
        )}
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] overflow-hidden">
        {/* Top: name + date */}
        <div className="flex items-start justify-between px-8 pt-8 pb-6">
          <div>
            <h2 className="text-[24px] font-extrabold text-[#0F1515] dark:text-[#F3F4F6] leading-tight">
              {athlete.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {athlete.position && (
                <span className="px-2.5 py-0.5 rounded-md border border-[#D9D3CC] dark:border-[#383C40] text-xs font-semibold text-[#0F1515] dark:text-[#F3F4F6]">
                  {athlete.position}
                </span>
              )}
              <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">ID: {displayId}</span>
            </div>
          </div>
          {testDate && (
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
                Test Date
              </p>
              <p className="text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6] mt-1">
                {testDate}
              </p>
            </div>
          )}
        </div>

        {/* Metric grid */}
        {mostRecentMas ? (
          <div className="flex border-t border-[#E6E2DE] dark:border-[#30353A]">
            {/* MAS hero tile */}
            <div className="flex-shrink-0 w-[260px] bg-[#0F1D2A] dark:bg-[#0A1219] px-6 py-6 flex flex-col justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                MAS (M/S)
              </p>
              <p className="text-[52px] font-extrabold leading-none text-[#E8632A] dark:text-[#F07848] tabular-nums my-2">
                {mostRecentMas.masMs.toFixed(1)}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                Primary Training Metric
              </p>
            </div>

            {/* Right tiles */}
            <div className="flex-1">
              {/* Row 1 */}
              <div className="grid grid-cols-3 border-b border-[#E6E2DE] dark:border-[#30353A]">
                <MetricTile
                  label="20M MST"
                  subLabel="Level.Shuttle"
                  value={formatLevelShuttle(mostRecentMas.level, mostRecentMas.shuttleInLevel)}
                />
                <MetricTile
                  label="Total Shuttles"
                  subLabel="Completed"
                  value={mostRecentMas.totalShuttleCount}
                />
                <MetricTile
                  label="Estimated VO2max"
                  subLabel="mL/kg/min"
                  value={mostRecentMas.estimatedVo2max}
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-5">
                <MetricTile
                  label="MSS"
                  subLabel="Max Sprint · m/s"
                  value={
                    hasSpeed ? (
                      mostRecentSpeed!.mssMs.toFixed(1)
                    ) : (
                      <span className="text-[14px] font-normal text-[#9CA3AF] dark:text-[#6B7280]">
                        Not recorded
                      </span>
                    )
                  }
                />
                <MetricTile
                  label="10M Fly Time"
                  subLabel="seconds"
                  value={
                    hasSpeed ? (
                      mostRecentSpeed!.flyTimeS.toFixed(2)
                    ) : (
                      <span className="text-[14px] font-normal text-[#9CA3AF] dark:text-[#6B7280]">
                        Not recorded
                      </span>
                    )
                  }
                />
                <MetricTile
                  label="ASR"
                  subLabel="m/s"
                  value={
                    hasSpeed && mostRecentSpeed!.asrMs !== null ? (
                      mostRecentSpeed!.asrMs.toFixed(1)
                    ) : hasSpeed ? (
                      <span className="text-[14px] font-normal text-[#9CA3AF] dark:text-[#6B7280]">—</span>
                    ) : (
                      <span className="text-[14px] font-normal text-[#9CA3AF] dark:text-[#6B7280]">
                        Not recorded
                      </span>
                    )
                  }
                />
                <MetricTile
                  label="Team Rank"
                  subLabel="by MAS"
                  value={
                    teamRank !== null ? (
                      <span className="font-mono">{teamRank} of {teamTotal}</span>
                    ) : (
                      <span className="text-[#9CA3AF] dark:text-[#6B7280]">—</span>
                    )
                  }
                />
                <MetricTile
                  label="Position Rank"
                  subLabel="by MAS"
                  value={
                    positionRank !== null ? (
                      <span className="font-mono">{positionRank} of {positionTotal}</span>
                    ) : (
                      <span className="text-[#9CA3AF] dark:text-[#6B7280]">—</span>
                    )
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 py-6 text-sm text-[#9CA3AF] dark:text-[#6B7280] border-t border-[#E6E2DE] dark:border-[#30353A]">
            No MAS test on record.
          </div>
        )}

        {/* Test history */}
        {masHistory.length > 0 && (
          <div className="border-t border-[#D9D3CC] dark:border-[#383C40]">
            <div className="px-8 py-4 border-b border-[#E6E2DE] dark:border-[#30353A]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
                Test History
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6E2DE] dark:border-[#30353A]">
                  {['Test Date', '20M MST', 'Total Shuttles', 'MAS (M/S)', 'Estimated VO2max (mL/kg/min)'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {masHistory.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 border-[#E6E2DE] dark:border-[#30353A]"
                  >
                    <td className="px-6 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] font-semibold">
                      <span className="flex items-center gap-2">
                        {formatDate(row.createdAt)}
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDE8DC] dark:bg-[#3D2318] text-[#E8632A] dark:text-[#F07848]">
                            LATEST
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                      {formatLevelShuttle(row.level, row.shuttleInLevel)}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                      {row.totalShuttleCount}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums">
                      {row.masMs.toFixed(1)}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#0F1515] dark:text-[#F3F4F6] tabular-nums text-right">
                      {row.estimatedVo2max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
