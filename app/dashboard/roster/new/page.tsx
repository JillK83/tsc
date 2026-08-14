import { AthleteForm } from '@/components/roster/AthleteForm'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import Link from 'next/link'

export default async function NewAthletePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  return (
    <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] px-8 py-10">
      <div className="w-[520px] max-w-full mx-auto">
        <Link
          href="/dashboard/roster"
          className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline mb-4 inline-block"
        >
          ← Roster
        </Link>
        <h1 className="text-2xl font-bold text-[#0F1515] dark:text-[#F3F4F6] mb-6">
          Add athlete
        </h1>
        <AthleteForm mode="create" />
      </div>
    </div>
  )
}
