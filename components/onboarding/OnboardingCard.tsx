import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  maxWidth?: string
}

export function OnboardingCard({ children, maxWidth }: Props) {
  return (
    <div
      className="w-full bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] p-8 shadow-none"
      style={{ maxWidth: maxWidth ?? '540px' }}
    >
      {children}
    </div>
  )
}
