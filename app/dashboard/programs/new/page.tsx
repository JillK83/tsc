import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { NewProgramForm } from '@/components/dashboard/NewProgramForm'

export default async function NewProgramPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  return (
    <div className="min-h-full bg-[#EEECEA] dark:bg-[#181A1C] flex items-center justify-center px-4 py-12">
      <NewProgramForm />
    </div>
  )
}
