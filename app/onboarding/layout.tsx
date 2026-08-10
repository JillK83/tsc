import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (status?.completed) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#EEECEA] dark:bg-[#181A1C] flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      {children}
    </div>
  )
}
