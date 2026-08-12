'use client'

interface ChipOption {
  label: string
  value: number
}

interface ChipSelectorProps {
  label: string
  options: ChipOption[]
  selected: number[]
  onChange: (values: number[]) => void
  maxSelections: number
}

export function ChipSelector({ label, options, selected, onChange, maxSelections }: ChipSelectorProps) {
  function toggle(value: number) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else if (selected.length < maxSelections) {
      onChange([...selected, value])
    }
  }

  const atMax = selected.length >= maxSelections

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value)
          const isDisabled = atMax && !isSelected
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]',
                isSelected
                  ? 'bg-[#4A83D8] dark:bg-[#5A8DEE] text-white'
                  : isDisabled
                  ? 'border border-[#D9D3CC] dark:border-[#383C40] text-[#0F1515] dark:text-[#F3F4F6] opacity-40 cursor-not-allowed'
                  : 'border border-[#D9D3CC] dark:border-[#383C40] text-[#0F1515] dark:text-[#F3F4F6] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
