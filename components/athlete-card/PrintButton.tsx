'use client'

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 rounded-xl border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] text-sm font-semibold hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
    >
      {label}
    </button>
  )
}
