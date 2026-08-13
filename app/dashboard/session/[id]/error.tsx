'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Session route error:', error)
  }, [error])

  return (
    <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] flex items-center justify-center px-8">
      <div className="bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] p-8 max-w-md w-full text-center">
        <h1 className="text-lg font-bold text-[#0F1515] dark:text-[#F3F4F6]">
          Something went wrong on this session
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
          The screen hit an unexpected error. Your saved results are safe — only
          unsaved entries on this screen may be lost.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] dark:hover:bg-[#4A83D8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] text-sm font-semibold hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
