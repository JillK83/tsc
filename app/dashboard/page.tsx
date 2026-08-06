import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const role = user.publicMetadata?.role as string | undefined

  if (!role) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted">
          Account not provisioned. Contact your administrator.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <p className="text-sm text-muted">Role: {role}</p>
      <h1 className="text-2xl font-semibold mt-2">Dashboard</h1>
    </div>
  )
}
