'use server'

import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function markOnboardingComplete() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  await db
    .update(users)
    .set({ onboardingCompletedAt: new Date() })
    .where(eq(users.clerkUserId, userId))
}

export async function getOnboardingStatus() {
  const { userId } = await auth()
  if (!userId) return null

  const [user] = await db
    .select({ onboardingCompletedAt: users.onboardingCompletedAt })
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1)

  if (!user) return null
  return { completed: !!user.onboardingCompletedAt }
}
