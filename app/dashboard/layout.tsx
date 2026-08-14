import { NavBar } from '@/components/layout/NavBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  )
}
