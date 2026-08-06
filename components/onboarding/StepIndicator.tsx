'use client'

const STEPS = [
  { label: 'PROGRAM' },
  { label: 'ROSTER' },
  { label: 'PROTOCOL' },
  { label: 'PRINT' },
  { label: 'LAUNCH' },
]

type Props = {
  current: number // 1-indexed
}

export function StepIndicator({ current }: Props) {
  return (
    <div className="flex items-start gap-0 mb-8">
      {STEPS.map((step, i) => {
        const stepNum = i + 1
        const done = stepNum < current
        const active = stepNum === current

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                  done
                    ? 'bg-[#0F1515] border-[#0F1515] text-white dark:bg-[#F3F4F6] dark:border-[#F3F4F6] dark:text-[#181A1C]'
                    : active
                      ? 'bg-white border-[#4A83D8] text-[#4A83D8] dark:bg-[#262A2F] dark:border-[#5A8DEE] dark:text-[#5A8DEE]'
                      : 'bg-white border-[#D9D3CC] text-[#9CA3AF] dark:bg-[#262A2F] dark:border-[#383C40] dark:text-[#6B7280]',
                ].join(' ')}
                aria-label={`Step ${stepNum}: ${step.label}${done ? ' (complete)' : active ? ' (current)' : ''}`}
              >
                {done ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7l3.5 3.5L12 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={[
                  'text-[9px] font-semibold tracking-[0.06em] uppercase',
                  active
                    ? 'text-[#4A83D8] dark:text-[#5A8DEE]'
                    : 'text-[#9CA3AF] dark:text-[#6B7280]',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={[
                  'h-[2px] w-12 mb-5 mx-1',
                  done
                    ? 'bg-[#0F1515] dark:bg-[#F3F4F6]'
                    : 'bg-[#D9D3CC] dark:bg-[#383C40]',
                ].join(' ')}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
