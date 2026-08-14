'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
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

type Props = {
  seasonPhase: SeasonPhase
  conditioningGoal: ConditioningGoal
}

export function ProgramSettings({ seasonPhase, conditioningGoal }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [phase, setPhase] = useState<SeasonPhase>(seasonPhase)
  const [goal, setGoal] = useState<ConditioningGoal>(conditioningGoal)

  function save() {
    startTransition(async () => {
      await updateProgramSettings({ seasonPhase: phase, conditioningGoal: goal })
      setEditing(false)
      router.refresh()
    })
  }

  function cancel() {
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
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <label className="sr-only" htmlFor="season-phase">
        Season phase
      </label>
      <select
        id="season-phase"
        value={phase}
        onChange={(e) => setPhase(e.target.value as SeasonPhase)}
        className={SELECT_CLASS}
      >
        {SEASON_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="conditioning-goal">
        Conditioning goal
      </label>
      <select
        id="conditioning-goal"
        value={goal}
        onChange={(e) => setGoal(e.target.value as ConditioningGoal)}
        className={SELECT_CLASS}
      >
        {GOAL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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
  )
}
