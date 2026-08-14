'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingCard } from '@/components/onboarding/OnboardingCard'
import { createProgram } from '@/lib/db/actions/programs'

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

const INPUT_BASE =
  'w-full px-3 py-2 text-sm rounded-lg border bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors'

export function NewProgramForm() {
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
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function create() {
    if (!validate()) return
    startTransition(async () => {
      await createProgram({
        sport: form.sport.trim(),
        name: form.name.trim(),
        seasonPhase: (form.seasonPhase || 'offseason') as SeasonPhase,
        conditioningGoal: (form.conditioningGoal || 'build') as ConditioningGoal,
      })
      // createProgram set the new program as active; land on its dashboard.
      router.push('/dashboard')
      router.refresh()
    })
  }

  return (
    <OnboardingCard maxWidth="520px">
      <h1 className="text-2xl font-extrabold text-[#0F1515] dark:text-[#F3F4F6] mb-1">
        Add a program
      </h1>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-8">
        Create another program for your school. You can set up its roster and tests afterward.
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
              INPUT_BASE,
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
            placeholder="e.g. Men's"
            aria-required="true"
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={[
              INPUT_BASE,
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

      <div className="grid grid-cols-2 gap-4 mb-8">
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
            className={[INPUT_BASE, 'cursor-pointer border-[#D9D3CC] dark:border-[#383C40]'].join(' ')}
          >
            <option value="" disabled>Select…</option>
            {SEASON_PHASES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
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
            className={[INPUT_BASE, 'cursor-pointer border-[#D9D3CC] dark:border-[#383C40]'].join(' ')}
          >
            <option value="" disabled>Select…</option>
            {CONDITIONING_GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] focus:outline-none focus-visible:underline disabled:opacity-60 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={create}
          disabled={isPending}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#4A83D8] hover:bg-[#2E65BE] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Creating…' : 'Create Program'}
        </button>
      </div>
    </OnboardingCard>
  )
}
