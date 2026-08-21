'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { deleteSession } from '@/lib/db/actions/sessions'

type Props = {
  sessionId: string
  hasResults: boolean
}

function ConfirmDeleteModal({ onCancel, onConfirm, isPending, deleteError }: {
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
  deleteError: string | null
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Move focus into modal on mount
  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onCancel(); return }
    if (e.key === 'Tab') {
      const els = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLButtonElement[]
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-heading"
        className="relative bg-white dark:bg-[#262A2F] border border-[#D9D3CC] dark:border-[#383C40] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-lg"
      >
        <h2
          id="delete-modal-heading"
          className="text-base font-semibold text-[#0F1515] dark:text-[#F3F4F6] mb-2 text-center"
        >
          Delete session?
        </h2>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6 text-center">
          This cannot be undone.
        </p>
        {deleteError && (
          <p className="text-sm text-[#A83232] dark:text-[#EF8E8E] mb-4">
            {deleteError}
          </p>
        )}
        <div className="flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-xl border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] text-sm font-semibold hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-1.5 rounded-xl border-2 border-transparent bg-[#A83232] dark:bg-[#C04040] text-white text-sm font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A83232] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function DeleteSessionButton({ sessionId, hasResults }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  if (hasResults) {
    return (
      <button
        type="button"
        disabled
        title="Cannot delete session with saved results"
        className="text-sm text-[#9CA3AF] select-none"
        aria-label="Cannot delete session with saved results"
      >
        Delete
      </button>
    )
  }

  function handleConfirm() {
    setDeleteError(null)
    startTransition(async () => {
      try {
        await deleteSession(sessionId)
        setShowModal(false)
        router.refresh()
      } catch {
        setDeleteError('Delete failed — please try again.')
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="text-sm text-[#9CA3AF] hover:text-[#A83232] dark:hover:text-[#EF8E8E] transition-colors focus:outline-none focus-visible:underline disabled:opacity-40"
      >
        {isPending ? 'Deleting…' : 'Delete'}
      </button>
      {showModal && (
        <ConfirmDeleteModal
          onCancel={() => { setShowModal(false); setDeleteError(null) }}
          onConfirm={handleConfirm}
          isPending={isPending}
          deleteError={deleteError}
        />
      )}
    </div>
  )
}
