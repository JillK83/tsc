'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { OnboardingCard } from '@/components/onboarding/OnboardingCard'
import { StepActions } from '@/components/onboarding/StepActions'
import { upsertProgram } from '@/lib/db/actions/programs'

type SeasonPhase = 'offseason' | 'preseason' | 'in_season' | 'postseason'
type ConditioningGoal = 'build' | 'maintain' | 'peak'

const SEASON_PHASES: { value: SeasonPhase; label: string }[] = [
  { value: 'offseason', label: 'Off-Season' },
  { value: 'preseason', label: 'Preseason' },
  { value: 'in_season', label: 'In-Season' },
  { value: 'postseason', label: 'Postseason' },
]

const CONDITIONING_GOALS: { value: ConditioningGoal; label: string }[] = [
  { value: 'build', label: 'Build' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'peak', label: 'Peak' },
]

export default function ProgramSetupPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    sport: '',
    name: '',
    seasonPhase: '' as SeasonPhase | '',
    conditioningGoal: '' as ConditioningGoal | '',
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!form.sport.trim()) next.sport = 'Sport is required'
    if (!form.name.trim()) next.name = 'Program name is required'
    if (!form.seasonPhase) next.seasonPhase = 'Season phase is required'
    if (!form.conditioningGoal) next.conditioningGoal = 'Conditioning goal is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function save(advance: boolean) {
    if (advance && !validate()) return
    if (!form.sport.trim() && !form.name.trim()) return

    startTransition(async () => {
      await upsertProgram({
        sport: form.sport,
        name: form.name,
        seasonPhase: (form.seasonPhase || 'offseason') as SeasonPhase,
        conditioningGoal: (form.conditioningGoal || 'build') as ConditioningGoal,
      })
      if (advance) router.push('/onboarding/2')
    })
  }

  return (
    <OnboardingCard>
      <StepIndicator current={1} />

      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1">
        Step 1 of 5
      </p>
      <h1 className="text-2xl font-extrabold text-[#0F1515] dark:text-[#F3F4F6] mb-1">
        Set up your program
      </h1>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-8">
        Takes about 2 minutes. You can update these any time.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="sport"
            className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5"
          >
            Sport <span aria-hidden="true">*</span>
          </label>
          <input
            id="sport"
            type="text"
            value={form.sport}
            onChange={(e) => set('sport', e.target.value)}
            placeholder="e.g. Soccer"
            aria-required="true"
            aria-describedby={errors.sport ? 'sport-error' : undefined}
            className={[
              'w-full px-3 py-2 text-sm rounded-lg border bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors',
              errors.sport
                ? 'border-[#A83232] bg-[#FDEAEA] dark:bg-[#2A1A1A]'
                : 'border-[#D9D3CC] dark:border-[#383C40]',
            ].join(' ')}
          />
          {errors.sport && (
            <p id="sport-error" className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">
              {errors.sport}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5"
          >
            Program name <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Women's Varsity"
            aria-required="true"
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={[
              'w-full px-3 py-2 text-sm rounded-lg border bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors',
              errors.name
                ? 'border-[#A83232] bg-[#FDEAEA] dark:bg-[#2A1A1A]'
                : 'border-[#D9D3CC] dark:border-[#383C40]',
            ].join(' ')}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">
              {errors.name}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="seasonPhase"
            className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5"
          >
            Season phase
          </label>
          <select
            id="seasonPhase"
            value={form.seasonPhase}
            onChange={(e) => set('seasonPhase', e.target.value)}
            aria-describedby={errors.seasonPhase ? 'season-error' : undefined}
            className={[
              'w-full px-3 py-2 text-sm rounded-lg border bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors cursor-pointer',
              errors.seasonPhase
                ? 'border-[#A83232]'
                : 'border-[#D9D3CC] dark:border-[#383C40]',
            ].join(' ')}
          >
            <option value="" disabled>Select…</option>
            {SEASON_PHASES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {errors.seasonPhase && (
            <p id="season-error" className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">
              {errors.seasonPhase}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="conditioningGoal"
            className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5"
          >
            Conditioning goal
          </label>
          <select
            id="conditioningGoal"
            value={form.conditioningGoal}
            onChange={(e) => set('conditioningGoal', e.target.value)}
            aria-describedby={errors.conditioningGoal ? 'goal-error' : undefined}
            className={[
              'w-full px-3 py-2 text-sm rounded-lg border bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors cursor-pointer',
              errors.conditioningGoal
                ? 'border-[#A83232]'
                : 'border-[#D9D3CC] dark:border-[#383C40]',
            ].join(' ')}
          >
            <option value="" disabled>Select…</option>
            {CONDITIONING_GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          {errors.conditioningGoal && (
            <p id="goal-error" className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">
              {errors.conditioningGoal}
            </p>
          )}
        </div>
      </div>

      <StepActions
        onSaveDraft={() => save(false)}
        onContinue={() => save(true)}
        isSubmitting={isPending}
      />
    </OnboardingCard>
  )
}
