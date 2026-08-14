import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { getAthletesForProgramming } from '@/lib/db/actions/coach-programming'
import { CoachProgrammingClient } from '@/components/coach-programming/CoachProgrammingClient'

export default async function CoachProgrammingPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const role = user.publicMetadata?.role as string | undefined
  if (!role) {
    return (
      <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] flex items-center justify-center">
        <p className="text-sm text-[#9CA3AF]">
          Account not provisioned. Contact your administrator.
        </p>
      </div>
    )
  }

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  const athletes = await getAthletesForProgramming()

  return (
    <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <CoachProgrammingClient athletes={athletes} />
      </div>
    </div>
  )
}
