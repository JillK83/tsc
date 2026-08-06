'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deactivateAthlete } from '@/lib/db/actions/athletes'

type Props = {
  athleteId: string
  athleteName: string
}

export function DeactivateButton({ athleteId, athleteName }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const confirmed = window.confirm(
      `Deactivate ${athleteName}? They will no longer appear in bulk entry. Historical results are preserved.`
    )
    if (!confirmed) return
    startTransition(async () => {
      await deactivateAthlete(athleteId)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#A83232] dark:hover:text-[#EF8E8E] transition-colors focus:outline-none focus-visible:underline disabled:opacity-40"
    >
      {isPending ? 'Deactivating…' : 'Deactivate'}
    </button>
  )
}
