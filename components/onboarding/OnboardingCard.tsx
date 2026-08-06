import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function OnboardingCard({ children }: Props) {
  return (
    <div className="w-full max-w-[540px] bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] p-8 shadow-none">
      {children}
    </div>
  )
}
