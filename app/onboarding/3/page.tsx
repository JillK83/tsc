'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { OnboardingCard } from '@/components/onboarding/OnboardingCard'
import { StepActions } from '@/components/onboarding/StepActions'

const PROTOCOL_ROWS = [
  { label: 'Test', value: '20m Multi-Stage Shuttle Test (20m MST)' },
  { label: 'Input format', value: 'Level.Shuttle notation (e.g. "12.4")' },
  { label: 'MAS formula', value: 'Paradisi — total shuttle count → MAS (m/s)' },
  { label: 'VO2max formula', value: 'Léger & Mercier — 5.857 × level_speed − 19.458' },
  { label: 'Speed test', value: '20m build-up + 10m timed fly (seconds)' },
]

const today = new Date().toISOString().split('T')[0]

export default function ProtocolPage() {
  const router = useRouter()
  const [testDate, setTestDate] = useState(today)
  const [conditions, setConditions] = useState('')
  const [dateError, setDateError] = useState('')

  function handleContinue() {
    if (!testDate) {
      setDateError('Test date is required')
      return
    }
    // Store in sessionStorage for review screen — not persisted to DB
    sessionStorage.setItem('onboarding_test_date', testDate)
    sessionStorage.setItem('onboarding_conditions', conditions)
    router.push('/onboarding/4')
  }

  return (
    <OnboardingCard>
      <StepIndicator current={3} />

      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1">
        Step 3 of 5
      </p>
      <h1 className="text-2xl font-extrabold text-[#0F1515] dark:text-[#F3F4F6] mb-1">
        Confirm your test setup
      </h1>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-8">
        Date and conditions are saved with every result in this session.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label
            htmlFor="testDate"
            className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5"
          >
            Test date <span aria-hidden="true">*</span>
          </label>
          <input
            id="testDate"
            type="date"
            value={testDate}
            onChange={(e) => {
              setTestDate(e.target.value)
              setDateError('')
            }}
            aria-required="true"
            aria-describedby={dateError ? 'date-error' : undefined}
            className={[
              'w-full px-3 py-2 text-sm rounded-lg border bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors',
              dateError
                ? 'border-[#A83232] bg-[#FDEAEA] dark:bg-[#2A1A1A]'
                : 'border-[#D9D3CC] dark:border-[#383C40]',
            ].join(' ')}
          />
          {dateError && (
            <p id="date-error" className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">
              {dateError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="conditions"
            className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5"
          >
            Conditions / Notes
          </label>
          <input
            id="conditions"
            type="text"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="e.g. 82°F, turf, light wind"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors"
          />
        </div>
      </div>

      {/* Read-only protocol box */}
      <div className="rounded-lg bg-[#F4F3F0] dark:bg-[#1E2124] border border-[#E6E2DE] dark:border-[#30353A] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] mb-3">
          Test protocol — read-only in V1
        </p>
        <table className="w-full text-[13px]">
          <tbody>
            {PROTOCOL_ROWS.map((row) => (
              <tr key={row.label}>
                <td className="py-1 pr-4 font-medium text-[#6B7280] dark:text-[#9CA3AF] w-36 align-top">
                  {row.label}:
                </td>
                <td className="py-1 text-[#0F1515] dark:text-[#F3F4F6]">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StepActions
        backHref="/onboarding/2"
        onContinue={handleContinue}
      />
    </OnboardingCard>
  )
}
