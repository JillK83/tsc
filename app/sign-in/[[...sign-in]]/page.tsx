import { SignIn } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <SignIn />
    </div>
  )
}
