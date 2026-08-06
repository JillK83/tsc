'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { OnboardingCard } from '@/components/onboarding/OnboardingCard'
import { StepActions } from '@/components/onboarding/StepActions'
import { updateProgramPrintPrefs } from '@/lib/db/actions/programs'

type PaperSize = 'letter_8_5x11' | 'a4'
type PrintColor = 'color' | 'bw'

const PAPER_OPTIONS: { value: PaperSize; label: string; description: string }[] = [
  {
    value: 'letter_8_5x11',
    label: 'US Letter (8.5 × 11")',
    description: 'Landscape — recommended for V1',
  },
  {
    value: 'a4',
    label: 'A4',
    description: 'Stored now, full layout support in V2',
  },
]

const COLOR_OPTIONS: { value: PrintColor; label: string }[] = [
  { value: 'color', label: 'Color' },
  { value: 'bw', label: 'Black & White' },
]

export default function PrintPreferencesPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [paperSize, setPaperSize] = useState<PaperSize>('letter_8_5x11')
  const [printColor, setPrintColor] = useState<PrintColor>('color')

  function handleContinue() {
    startTransition(async () => {
      await updateProgramPrintPrefs({ printPaperSize: paperSize, printColor })
      router.push('/onboarding/5')
    })
  }

  return (
    <OnboardingCard>
      <StepIndicator current={4} />

      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1">
        Step 4 of 5
      </p>
      <h1 className="text-2xl font-extrabold text-[#0F1515] dark:text-[#F3F4F6] mb-1">
        Print preferences
      </h1>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-8">
        Set your default for athlete cards and team reports.
      </p>

      {/* Paper size */}
      <fieldset className="mb-6">
        <legend className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-3">
          Paper size
        </legend>
        <div className="space-y-2">
          {PAPER_OPTIONS.map((opt) => {
            const selected = paperSize === opt.value
            return (
              <label
                key={opt.value}
                className={[
                  'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors',
                  selected
                    ? 'border-[#4A83D8] bg-[#EBF2FD] dark:border-[#5A8DEE] dark:bg-[rgba(90,141,238,0.12)]'
                    : 'border-[#D9D3CC] dark:border-[#383C40] hover:border-[#9CA3AF] dark:hover:border-[#6B7280]',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="paperSize"
                  value={opt.value}
                  checked={selected}
                  onChange={() => setPaperSize(opt.value)}
                  className="accent-[#4A83D8] dark:accent-[#5A8DEE] w-4 h-4"
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

      {/* Print color */}
      <fieldset>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-3">
          Print color
        </legend>
        <div className="space-y-2">
          {COLOR_OPTIONS.map((opt) => {
            const selected = printColor === opt.value
            return (
              <label
                key={opt.value}
                className={[
                  'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors',
                  selected
                    ? 'border-[#4A83D8] bg-[#EBF2FD] dark:border-[#5A8DEE] dark:bg-[rgba(90,141,238,0.12)]'
                    : 'border-[#D9D3CC] dark:border-[#383C40] hover:border-[#9CA3AF] dark:hover:border-[#6B7280]',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="printColor"
                  value={opt.value}
                  checked={selected}
                  onChange={() => setPrintColor(opt.value)}
                  className="accent-[#4A83D8] dark:accent-[#5A8DEE] w-4 h-4"
                />
                <p className="text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6]">
                  {opt.label}
                </p>
              </label>
            )
          })}
        </div>
      </fieldset>

      <StepActions
        backHref="/onboarding/3"
        onContinue={handleContinue}
        isSubmitting={isPending}
      />
    </OnboardingCard>
  )
}
