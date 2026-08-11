'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSession } from '@/lib/db/actions/sessions'

type Props = {
  sessionId: string
  hasResults: boolean
}

export function DeleteSessionButton({ sessionId, hasResults }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  function handleClick() {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    setDeleteError(null)
    startTransition(async () => {
      try {
        await deleteSession(sessionId)
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
        onClick={handleClick}
        disabled={isPending}
        className="text-sm text-[#9CA3AF] hover:text-[#A83232] dark:hover:text-[#EF8E8E] transition-colors focus:outline-none focus-visible:underline disabled:opacity-40"
      >
        {isPending ? 'Deleting…' : 'Delete'}
      </button>
      {deleteError && (
        <p className="mt-1 text-[11px] text-[#A83232] dark:text-[#EF8E8E]">
          {deleteError}
        </p>
      )}
    </div>
  )
}
