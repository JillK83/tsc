'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChipSelector } from './ChipSelector'
import {
  masDistanceStraight,
  masDistanceShuttle,
  asrDistance,
} from '@/lib/formulas/coach-programming'
import type { ProgrammingAthlete } from '@/lib/db/actions/coach-programming'

// ─── Option sets ─────────────────────────────────────────────────────────────

const MAS_INTENSITIES = [85, 90, 95, 100, 105, 110].map((v) => ({
  label: `${v}%`,
  value: v,
}))

const MAS_WORK_TIMES = [10, 15, 20, 25, 30, 40, 45, 60, 90, 120, 150, 200, 240, 300, 360, 420].map(
  (v) => ({ label: `${v}s`, value: v })
)

const ASR_PCTS = [10, 20, 25, 30, 40].map((v) => ({ label: `${v}%`, value: v }))

const ASR_WORK_TIMES = [6, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 90, 120, 150, 200, 240, 300].map(
  (v) => ({ label: `${v}s`, value: v })
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return value.toFixed(1)
}

// Groups athletes by a display key (rounded to 1 decimal), sorted descending.
function groupByDisplayed<T extends { id: string; name: string }>(
  athletes: T[],
  getValue: (a: T) => number,
  descending = true
): Array<{ key: string; numericValue: number; athletes: T[] }> {
  const map = new Map<string, { numericValue: number; athletes: T[] }>()
  for (const a of athletes) {
    const key = getValue(a).toFixed(1)
    if (!map.has(key)) {
      map.set(key, { numericValue: getValue(a), athletes: [] })
    }
    map.get(key)!.athletes.push(a)
  }
  const groups = Array.from(map.entries()).map(([key, g]) => ({ key, ...g }))
  groups.sort((a, b) =>
    descending ? b.numericValue - a.numericValue : a.numericValue - b.numericValue
  )
  return groups
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            'px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]',
            value === opt.value
              ? 'bg-[#4A83D8] dark:bg-[#5A8DEE] text-white'
              : 'border border-[#D9D3CC] dark:border-[#383C40] text-[#0F1515] dark:text-[#F3F4F6] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338]',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function AthleteNameChips({ athletes }: { athletes: ProgrammingAthlete[] }) {
  return (
    <div className="flex flex-wrap gap-1 mt-0.5">
      {athletes.map((a) => (
        <span
          key={a.id}
          className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAFAF8] dark:bg-[#2D3338] text-[#0F1515] dark:text-[#F3F4F6]"
        >
          {a.name}
        </span>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
        Select intensity and work time to generate distances
      </p>
    </div>
  )
}

// ─── MAS Panel ───────────────────────────────────────────────────────────────

function MasPanel({ athletes }: { athletes: ProgrammingAthlete[] }) {
  const [intensities, setIntensities] = useState<number[]>([])
  const [workTimes, setWorkTimes] = useState<number[]>([])
  const [isShuttle, setIsShuttle] = useState(false)
  const [mode, setMode] = useState<'team' | 'individual'>('team')
  const [selectedId, setSelectedId] = useState<string>('')

  const masAthletes = athletes.filter((a) => a.masMs !== null) as Array<
    ProgrammingAthlete & { masMs: number }
  >

  const displayAthletes =
    mode === 'individual' && selectedId
      ? masAthletes.filter((a) => a.id === selectedId)
      : masAthletes

  const groups = groupByDisplayed(displayAthletes, (a) => a.masMs)

  // Sorted columns: intensities ascending × work times ascending
  const sortedIntensities = [...intensities].sort((a, b) => a - b)
  const sortedWorkTimes = [...workTimes].sort((a, b) => a - b)
  const columns = sortedIntensities.flatMap((int) =>
    sortedWorkTimes.map((wt) => ({ int, wt }))
  )

  const hasSelections = columns.length > 0

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <ChipSelector
          label="Intensity"
          options={MAS_INTENSITIES}
          selected={intensities}
          onChange={setIntensities}
          maxSelections={3}
        />
        <ChipSelector
          label="Work time"
          options={MAS_WORK_TIMES}
          selected={workTimes}
          onChange={setWorkTimes}
          maxSelections={2}
        />
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
              Distance
            </span>
            <ToggleGroup
              options={[
                { label: 'Straight-line', value: 'straight' },
                { label: 'Shuttle', value: 'shuttle' },
              ]}
              value={isShuttle ? 'shuttle' : 'straight'}
              onChange={(v) => setIsShuttle(v === 'shuttle')}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
              View
            </span>
            <ToggleGroup
              options={[
                { label: 'Team', value: 'team' },
                { label: 'Individual', value: 'individual' },
              ]}
              value={mode}
              onChange={(v) => {
                setMode(v as 'team' | 'individual')
                setSelectedId('')
              }}
            />
            {mode === 'individual' && (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="ml-2 px-3 py-1.5 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] dark:focus-visible:ring-[#5A8DEE]"
              >
                <option value="">Select athlete…</option>
                {masAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {!hasSelections ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr className="border-b border-[#D9D3CC] dark:border-[#383C40]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF] min-w-[200px]">
                  Athlete
                </th>
                {columns.map(({ int, wt }) => (
                  <th
                    key={`${int}-${wt}`}
                    className={[
                      'px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF]',
                      isShuttle ? 'min-w-[150px]' : 'min-w-[120px]',
                    ].join(' ')}
                  >
                    {int}% · {wt}s{isShuttle ? ' (SHUTTLE)' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group, i) => {
                const masVal = group.numericValue
                return (
                  <tr
                    key={group.key}
                    className="border-b border-[#E6E2DE] dark:border-[#30353A] last:border-0 hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col justify-center h-full">
                        <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] block mb-1">
                          #{i + 1} · {group.key} m/s
                        </span>
                        <AthleteNameChips athletes={group.athletes} />
                      </div>
                    </td>
                    {columns.map(({ int, wt }) => {
                      const dist = isShuttle
                        ? masDistanceShuttle(masVal, int, wt)
                        : masDistanceStraight(masVal, int, wt)
                      return (
                        <td
                          key={`${int}-${wt}`}
                          className="px-4 py-3 text-right text-[13px] text-[#0F1515] dark:text-[#F3F4F6] tabular-nums align-middle"
                        >
                          {isShuttle ? `${fmt(dist)} / ${fmt(dist)}` : `${fmt(dist)}m`}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {groups.length === 0 && mode === 'individual' && !selectedId && (
                <tr>
                  <td
                    colSpan={1 + columns.length}
                    className="px-4 py-8 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]"
                  >
                    Select an athlete to view distances
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── ASR Panel ───────────────────────────────────────────────────────────────

function AsrPanel({ athletes }: { athletes: ProgrammingAthlete[] }) {
  const [asrPcts, setAsrPcts] = useState<number[]>([])
  const [workTimes, setWorkTimes] = useState<number[]>([])
  const [mode, setMode] = useState<'team' | 'individual'>('team')
  const [selectedId, setSelectedId] = useState<string>('')

  const withBoth = athletes.filter(
    (a) => a.masMs !== null && a.asrMs !== null
  ) as Array<ProgrammingAthlete & { masMs: number; asrMs: number }>

  const excludedCount = athletes.filter((a) => a.masMs !== null && a.asrMs === null).length

  const sortedWithBoth = [...withBoth].sort((a, b) => b.asrMs - a.asrMs)

  const displayAthletes =
    mode === 'individual' && selectedId
      ? sortedWithBoth.filter((a) => a.id === selectedId)
      : sortedWithBoth

  const sortedPcts = [...asrPcts].sort((a, b) => a - b)
  const sortedWorkTimes = [...workTimes].sort((a, b) => a - b)
  const columns = sortedPcts.flatMap((pct) =>
    sortedWorkTimes.map((wt) => ({ pct, wt }))
  )

  const hasSelections = columns.length > 0

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <ChipSelector
          label="ASR %"
          options={ASR_PCTS}
          selected={asrPcts}
          onChange={setAsrPcts}
          maxSelections={3}
        />
        <ChipSelector
          label="Work time"
          options={ASR_WORK_TIMES}
          selected={workTimes}
          onChange={setWorkTimes}
          maxSelections={2}
        />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
            View
          </span>
          <ToggleGroup
            options={[
              { label: 'Team', value: 'team' },
              { label: 'Individual', value: 'individual' },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as 'team' | 'individual')
              setSelectedId('')
            }}
          />
          {mode === 'individual' && (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="ml-2 px-3 py-1.5 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] dark:focus-visible:ring-[#5A8DEE]"
            >
              <option value="">Select athlete…</option>
              {withBoth.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Exclusion banner */}
      {excludedCount > 0 && (
        <div className="text-sm text-[#A67520] dark:text-[#E5B84A] bg-[#FDF3DC] dark:bg-[rgba(166,117,32,0.1)] border border-[#C98E24] rounded-lg px-4 py-2 mb-4">
          {excludedCount} athlete{excludedCount > 1 ? 's' : ''} excluded — speed test required
        </div>
      )}

      {/* Table */}
      {!hasSelections ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr className="border-b border-[#D9D3CC] dark:border-[#383C40]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF] min-w-[200px]">
                  Athlete
                </th>
                {columns.map(({ pct, wt }) => (
                  <th
                    key={`${pct}-${wt}`}
                    className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF] min-w-[120px]"
                  >
                    ASR {pct}% · {wt}s
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayAthletes.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-[#E6E2DE] dark:border-[#30353A] last:border-0 hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col justify-center h-full">
                      <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] block mb-1">
                        {a.asrMs.toFixed(1)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#FAFAF8] dark:bg-[#2D3338] text-[#0F1515] dark:text-[#F3F4F6] inline-block">
                        {a.name}
                      </span>
                    </div>
                  </td>
                  {columns.map(({ pct, wt }) => (
                    <td
                      key={`${pct}-${wt}`}
                      className="px-4 py-3 text-right text-[13px] text-[#0F1515] dark:text-[#F3F4F6] tabular-nums align-middle"
                    >
                      {fmt(asrDistance(a.masMs, a.asrMs, pct, wt))}m
                    </td>
                  ))}
                </tr>
              ))}
              {displayAthletes.length === 0 && mode === 'individual' && !selectedId && (
                <tr>
                  <td
                    colSpan={1 + columns.length}
                    className="px-4 py-8 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]"
                  >
                    Select an athlete to view distances
                  </td>
                </tr>
              )}
              {withBoth.length === 0 && (
                <tr>
                  <td
                    colSpan={1 + columns.length}
                    className="px-4 py-8 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]"
                  >
                    No athletes have both MAS and speed test results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

interface CoachProgrammingClientProps {
  athletes: ProgrammingAthlete[]
}

export function CoachProgrammingClient({ athletes }: CoachProgrammingClientProps) {
  const [activeTab, setActiveTab] = useState<'mas' | 'asr'>('mas')

  return (
    <div>
      <Link
        href="/dashboard"
        className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline mb-4 inline-block"
      >
        ← Dashboard
      </Link>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] mb-1">
            Coach Tools
          </p>
          <h1 className="text-2xl font-bold text-[#0F1515] dark:text-[#F3F4F6]">
            Coach Programming
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={activeTab === 'mas'}
            onClick={() => setActiveTab('mas')}
            className={[
              'px-4 py-2 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]',
              activeTab === 'mas'
                ? 'bg-[#4A83D8] dark:bg-[#5A8DEE] text-white'
                : 'border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)]',
            ].join(' ')}
          >
            MAS Calculator
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'asr'}
            onClick={() => setActiveTab('asr')}
            className={[
              'px-4 py-2 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]',
              activeTab === 'asr'
                ? 'bg-[#4A83D8] dark:bg-[#5A8DEE] text-white'
                : 'border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)]',
            ].join(' ')}
          >
            ASR Calculator
          </button>
        </div>
      </div>

      {/* Panel */}
      <div className="bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] p-6">
        {activeTab === 'mas' ? (
          <MasPanel athletes={athletes} />
        ) : (
          <AsrPanel athletes={athletes} />
        )}
      </div>
    </div>
  )
}
