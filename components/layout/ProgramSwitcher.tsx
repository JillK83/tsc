'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { setActiveProgram } from '@/lib/db/actions/programs'

// Mirror of ACTIVE_PROGRAM_COOKIE in lib/programs/resolver.ts. Duplicated here
// because that module imports next/headers and can't cross the client boundary.
// The cookie is intentionally non-httpOnly so this component can read it.
const ACTIVE_PROGRAM_COOKIE = 'tsc_active_program'

type Program = { id: string; sport: string; name: string }

function readActiveCookie(): string | null {
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${ACTIVE_PROGRAM_COOKIE}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

function label(p: Program) {
  return `${p.sport} — ${p.name}`
}

type Props = {
  active: Program | null
  programs: Program[]
}

export function ProgramSwitcher({ active, programs }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [activeId, setActiveId] = useState<string | null>(active?.id ?? null)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // The cookie is the source of truth for which program is active; sync from it
  // on mount so the checkmark stays correct across navigation.
  useEffect(() => {
    setActiveId(readActiveCookie() ?? active?.id ?? null)
  }, [active?.id])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Move focus to the first menu item when the menu opens.
  useEffect(() => {
    if (!open) return
    const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')
    first?.focus()
  }, [open])

  function select(id: string) {
    setOpen(false)
    if (id === activeId) return
    startTransition(async () => {
      await setActiveProgram(id)
      router.push('/dashboard')
      router.refresh()
    })
  }

  function addProgram() {
    setOpen(false)
    router.push('/dashboard/programs/new')
  }

  return (
    <div ref={ref} className="relative flex items-center">
      <span className="mx-3 text-white/40 select-none">|</span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm rounded px-1 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors disabled:opacity-60"
      >
        {active ? (
          <span>
            <span className="text-white font-semibold">{active.sport}</span>
            <span className="text-white/70 font-normal"> — {active.name}</span>
          </span>
        ) : (
          <span className="text-white/70 font-normal">Select program</span>
        )}
        <ChevronDown size={16} className={`text-white/70 ${open ? 'rotate-180 transition-transform' : 'transition-transform'}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-3 top-full mt-2 min-w-[220px] z-50 rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-white dark:bg-[#262A2F] py-1 shadow-lg"
        >
          {programs.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitem"
              onClick={() => select(p.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-[#0F1515] dark:text-[#F3F4F6] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] focus:outline-none focus-visible:bg-[#FAFAF8] dark:focus-visible:bg-[#2D3338]"
            >
              <span className="w-4 shrink-0">
                {p.id === activeId && <Check size={14} className="text-[#4A83D8] dark:text-[#5A8DEE]" />}
              </span>
              {label(p)}
            </button>
          ))}

          <div className="my-1 border-t border-[#E6E2DE] dark:border-[#30353A]" />

          <button
            type="button"
            role="menuitem"
            onClick={addProgram}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-[#4A83D8] dark:text-[#5A8DEE] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] focus:outline-none focus-visible:bg-[#FAFAF8] dark:focus-visible:bg-[#2D3338]"
          >
            <span className="w-4 shrink-0 flex justify-center">
              <Plus size={14} />
            </span>
            Add program
          </button>
        </div>
      )}
    </div>
  )
}
