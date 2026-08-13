'use client'

import { useState, useTransition } from 'react'
import { updateSessionConditions } from '@/lib/db/actions/sessions'
import { updateProgramSeasonPhase } from '@/lib/db/actions/programs'

type SeasonPhase = 'offseason' | 'preseason' | 'in_season' | 'postseason'

const SEASON_LABELS: Record<SeasonPhase, string> = {
  offseason: 'Off-Season',
  preseason: 'Preseason',
  in_season: 'In-Season',
  postseason: 'Postseason',
}

type Props = {
  sessionId: string
  date: string
  conditions: string | null
  seasonPhase: SeasonPhase
  testType: '20M_MST' | 'speed'
}

export function SessionSidebar({
  sessionId,
  date,
  conditions: initialConditions,
  seasonPhase: initialPhase,
  testType,
}: Props) {
  const [open, setOpen] = useState(true)
  const [conditions, setConditions] = useState(initialConditions ?? '')
  const [seasonPhase, setSeasonPhase] = useState<SeasonPhase>(initialPhase)
  const [, startTransition] = useTransition()

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })

  function handleConditionsBlur() {
    startTransition(async () => {
      try {
        await updateSessionConditions(sessionId, conditions)
      } catch (err) {
        console.error('Failed to save conditions:', err)
      }
    })
  }

  function handlePhaseChange(phase: SeasonPhase) {
    setSeasonPhase(phase)
    startTransition(async () => {
      try {
        await updateProgramSeasonPhase(phase)
      } catch (err) {
        console.error('Failed to save season phase:', err)
      }
    })
  }

  const labelClass =
    'block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5'
  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors'

  return (
    <aside
      className={[
        'relative flex-shrink-0 bg-[#FFFFFF] dark:bg-[#262A2F] border-r border-[#D9D3CC] dark:border-[#383C40] transition-all duration-250 ease-in-out',
        open ? 'w-56' : 'w-8',
      ].join(' ')}
      style={{ transitionProperty: 'width' }}
    >
      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Collapse session details' : 'Expand session details'}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#FFFFFF] dark:bg-[#262A2F] border border-[#D9D3CC] dark:border-[#383C40] flex items-center justify-center text-[#6B7280] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] shadow-sm"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          className={['transition-transform', open ? '' : 'rotate-180'].join(' ')}
        >
          <path
            d="M6.5 2L3.5 5l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Content — hidden when collapsed */}
      {open && (
        <div className="p-4 space-y-5 overflow-hidden">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
            Session details
          </p>

          <div>
            <label className={labelClass}>Date</label>
            <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FAFAF8] dark:bg-[#2D3338] text-[#0F1515] dark:text-[#F3F4F6]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="text-[#6B7280] flex-shrink-0">
                <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 1v2M10 1v2M1 5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {displayDate}
            </div>
          </div>

          <div>
            <label htmlFor="sidebarPhase" className={labelClass}>
              Season phase
            </label>
            <select
              id="sidebarPhase"
              value={seasonPhase}
              onChange={(e) => handlePhaseChange(e.target.value as SeasonPhase)}
              className={inputClass + ' cursor-pointer'}
            >
              {(Object.keys(SEASON_LABELS) as SeasonPhase[]).map((p) => (
                <option key={p} value={p}>
                  {SEASON_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sidebarConditions" className={labelClass}>
              Conditions
            </label>
            <input
              id="sidebarConditions"
              type="text"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              onBlur={handleConditionsBlur}
              placeholder="e.g. Clear, 22°C"
              className={inputClass}
            />
          </div>

          {testType === 'speed' && (
            <div>
              <label className={labelClass}>Test type</label>
              <p className="text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6]">
                Speed — 10m fly
              </p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                20m build-up + 10m timed section
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
