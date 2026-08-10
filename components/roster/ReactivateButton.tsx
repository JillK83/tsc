'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reactivateAthlete } from '@/lib/db/actions/athletes'

type Props = {
  athleteId: string
  athleteName: string
}

export function ReactivateButton({ athleteId, athleteName }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const confirmed = window.confirm(
      `Reactivate ${athleteName}? They will appear in bulk entry again.`
    )
    if (!confirmed) return
    startTransition(async () => {
      await reactivateAthlete(athleteId)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1E6E4C] dark:hover:text-[#5ECFA0] transition-colors focus:outline-none focus-visible:underline disabled:opacity-40"
    >
      {isPending ? 'Reactivating…' : 'Reactivate'}
    </button>
  )
}
