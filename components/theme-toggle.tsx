'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored ? stored === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="text-sm font-semibold px-3 py-1.5 rounded-xl border border-[#D9D3CC] dark:border-[#383C40] text-[#0F1515] dark:text-[#F3F4F6] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}
