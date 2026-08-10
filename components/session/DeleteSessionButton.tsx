'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSession } from '@/lib/db/actions/sessions'

type Props = {
  sessionId: string
  hasResults: boolean
}

export function DeleteSessionButton({ sessionId, hasResults }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (hasResults) {
    return (
      <button
        type="button"
        disabled
        title="Cannot delete session with saved results"
        className="text-xs text-[#9CA3AF] cursor-not-allowed select-none"
        aria-label="Cannot delete session with saved results"
      >
        Delete
      </button>
    )
  }

  function handleClick() {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    startTransition(async () => {
      await deleteSession(sessionId)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-[#9CA3AF] hover:text-[#A83232] dark:hover:text-[#EF8E8E] transition-colors focus:outline-none focus-visible:underline disabled:opacity-40"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
