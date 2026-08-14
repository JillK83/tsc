'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Pencil } from 'lucide-react'
import { updateProgramSettings } from '@/lib/db/actions/programs'

type SeasonPhase = 'offseason' | 'preseason' | 'in_season' | 'postseason'
type ConditioningGoal = 'build' | 'maintain' | 'peak'

const SEASON_OPTIONS: { value: SeasonPhase; label: string }[] = [
  { value: 'offseason', label: 'Off-Season' },
  { value: 'preseason', label: 'Preseason' },
  { value: 'in_season', label: 'In-Season' },
  { value: 'postseason', label: 'Postseason' },
]

const GOAL_OPTIONS: { value: ConditioningGoal; label: string }[] = [
  { value: 'build', label: 'Build' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'peak', label: 'Peak' },
]

const SEASON_LABELS = Object.fromEntries(
  SEASON_OPTIONS.map((o) => [o.value, o.label])
) as Record<SeasonPhase, string>
const GOAL_LABELS = Object.fromEntries(
  GOAL_OPTIONS.map((o) => [o.value, o.label])
) as Record<ConditioningGoal, string>

const SELECT_CLASS =
  'px-3 py-1.5 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors'

const LABEL_CLASS =
  'block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5'

// Arbitrary values (pr-[36px], [appearance:none]) always emit in the build and kill
// the native chevron cross-browser. Explicit pl-3/pr-[36px] (never px-*) reserves
// the custom-chevron zone.
const SELECT_TRIGGER_CLASS =
  'pl-3 pr-[36px] py-1.5 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] [appearance:none] [-webkit-appearance:none] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors'

type Props = {
  name: string
  seasonPhase: SeasonPhase
  conditioningGoal: ConditioningGoal
}

export function ProgramSettings({ name, seasonPhase, conditioningGoal }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [nameValue, setNameValue] = useState(name)
  const [phase, setPhase] = useState<SeasonPhase>(seasonPhase)
  const [goal, setGoal] = useState<ConditioningGoal>(conditioningGoal)

  function save() {
    if (!nameValue.trim()) return
    startTransition(async () => {
      await updateProgramSettings({
        name: nameValue,
        seasonPhase: phase,
        conditioningGoal: goal,
      })
      setEditing(false)
      router.refresh()
    })
  }

  function cancel() {
    setNameValue(name)
    setPhase(seasonPhase)
    setGoal(conditioningGoal)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        {SEASON_LABELS[seasonPhase] && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-[#D9D3CC] dark:border-[#383C40] text-[#6B7280] dark:text-[#9CA3AF] bg-transparent">
            {SEASON_LABELS[seasonPhase]}
          </span>
        )}
        {GOAL_LABELS[conditioningGoal] && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-[#D9D3CC] dark:border-[#383C40] text-[#6B7280] dark:text-[#9CA3AF] bg-transparent">
            {GOAL_LABELS[conditioningGoal]}
          </span>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit program settings"
          className="flex items-center gap-1 text-xs text-[#4A83D8] dark:text-[#5A8DEE] hover:underline focus:outline-none focus-visible:underline"
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-3">
      <div>
        <label htmlFor="program-name" className={LABEL_CLASS}>
          Program name
        </label>
        <input
          id="program-name"
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          placeholder="Program name"
          aria-required="true"
          className={`${SELECT_CLASS} w-full max-w-[320px]`}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <label className="sr-only" htmlFor="season-phase">
          Season phase
        </label>
        <div className="relative">
          <select
            id="season-phase"
            value={phase}
            onChange={(e) => setPhase(e.target.value as SeasonPhase)}
            className={SELECT_TRIGGER_CLASS}
          >
            {SEASON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]"
          />
        </div>
        <label className="sr-only" htmlFor="conditioning-goal">
          Conditioning goal
        </label>
        <div className="relative">
          <select
            id="conditioning-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value as ConditioningGoal)}
            className={SELECT_TRIGGER_CLASS}
          >
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]"
          />
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] dark:hover:bg-[#4A83D8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
