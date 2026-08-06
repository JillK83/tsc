'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

type Props = {
  onSaveDraft?: () => void
  onContinue?: () => void
  continueLabel?: string
  continueDisabled?: boolean
  backHref?: string
  isSubmitting?: boolean
  launchVariant?: boolean
}

export function StepActions({
  onSaveDraft,
  onContinue,
  continueLabel = 'Save & continue →',
  continueDisabled = false,
  backHref,
  isSubmitting = false,
  launchVariant = false,
}: Props) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E6E2DE] dark:border-[#30353A]">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] text-sm font-medium hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
        )}
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors disabled:opacity-40 focus:outline-none focus-visible:underline"
          >
            Save draft
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onContinue}
        disabled={continueDisabled || isSubmitting}
        className={[
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed',
          launchVariant
            ? 'bg-[#2E9E6F] hover:bg-[#248057] focus-visible:ring-[#2E9E6F]'
            : 'bg-[#4A83D8] hover:bg-[#2E65BE] dark:bg-[#5A8DEE] dark:hover:bg-[#4A83D8] focus-visible:ring-[#4A83D8]',
        ].join(' ')}
      >
        {isSubmitting ? 'Saving…' : continueLabel}
      </button>
    </div>
  )
}
