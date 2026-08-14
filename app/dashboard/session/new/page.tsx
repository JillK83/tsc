'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSession } from '@/lib/db/actions/sessions'

type TestType = '20M_MST' | 'speed'

const today = new Date().toISOString().split('T')[0]

const TEST_TYPES: { value: TestType; label: string; description: string }[] = [
  {
    value: '20M_MST',
    label: '20m Multi-Stage Shuttle Test',
    description: 'Level.Shuttle input — computes MAS and Estimated VO2max',
  },
  {
    value: 'speed',
    label: 'Speed test — 10m fly',
    description: '20m build-up + 10m timed section — computes MSS and ASR',
  },
]

export default function NewSessionPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [testType, setTestType] = useState<TestType>('20M_MST')
  const [date, setDate] = useState(today)
  const [conditions, setConditions] = useState('')
  const [dateError, setDateError] = useState('')

  function handleCreate() {
    if (!date) {
      setDateError('Date is required')
      return
    }
    startTransition(async () => {
      const session = await createSession({ date, testType, conditions: conditions || undefined })
      const route =
        testType === '20M_MST'
          ? `/dashboard/session/${session.id}/mas-entry`
          : `/dashboard/session/${session.id}/speed-entry`
      router.push(route)
    })
  }

  return (
    <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] px-8 py-10">
      <div className="w-[520px] max-w-full mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline mb-4 inline-block"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#0F1515] dark:text-[#F3F4F6] mb-6">
          New session
        </h1>

        <div className="w-full bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] p-6 space-y-6">
          {/* Test type */}
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-3">
              Test type
            </legend>
            <div className="space-y-2">
              {TEST_TYPES.map((opt) => {
                const selected = testType === opt.value
                return (
                  <label
                    key={opt.value}
                    className={[
                      'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors',
                      selected
                        ? 'border-[#4A83D8] bg-[#EBF2FD] dark:border-[#5A8DEE] dark:bg-[rgba(90,141,238,0.12)]'
                        : 'border-[#D9D3CC] dark:border-[#383C40] hover:border-[#9CA3AF] dark:hover:border-[#6B7280]',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="testType"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setTestType(opt.value)}
                      className="mt-0.5 accent-[#4A83D8] dark:accent-[#5A8DEE] w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6]">
                        {opt.label}
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {opt.description}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Date */}
          <div>
            <label
              htmlFor="sessionDate"
              className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5"
            >
              Test date <span aria-hidden="true">*</span>
            </label>
            <input
              id="sessionDate"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setDateError('')
              }}
              aria-required="true"
              className={[
                'w-full px-3 py-2 text-sm rounded-lg border bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors',
                dateError
                  ? 'border-[#A83232] bg-[#FDEAEA] dark:bg-[#2A1A1A]'
                  : 'border-[#D9D3CC] dark:border-[#383C40]',
              ].join(' ')}
            />
            {dateError && (
              <p className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">{dateError}</p>
            )}
          </div>

          {/* Conditions */}
          <div>
            <label
              htmlFor="conditions"
              className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5"
            >
              Conditions / Notes{' '}
              <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              id="conditions"
              type="text"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g. Clear, 22°C"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E6E2DE] dark:border-[#30353A]">
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating…' : 'Start session →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
