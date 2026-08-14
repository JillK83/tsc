import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import { db } from '@/lib/db'
import { athletes, users } from '@/lib/db/schema'
import { getOnboardingStatus } from '@/lib/db/actions/onboarding'
import { AthleteForm } from '@/components/roster/AthleteForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditAthletePage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const status = await getOnboardingStatus()
  if (!status?.completed) redirect('/onboarding/1')

  const { id } = await params

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))

  if (!user) redirect('/sign-in')

  const [athlete] = await db
    .select()
    .from(athletes)
    .where(and(eq(athletes.id, id), eq(athletes.schoolId, user.schoolId)))

  if (!athlete) notFound()

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
          Edit athlete
        </h1>
        <AthleteForm
          mode="edit"
          athleteId={id}
          initial={{
            name: athlete.name,
            position: athlete.position ?? '',
            sex: athlete.sex,
            birthDate: athlete.birthDate ?? '',
          }}
        />
      </div>
    </div>
  )
}
