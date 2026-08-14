'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type SelectOption = { value: string; label: string; disabled?: boolean }

type Props = {
  id?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  invalid?: boolean
}

// Custom listbox replacing native <select> so browsers can't paint their own
// chevron/picker. Same outside-click + keyboard model as ProgramSwitcher.
const TRIGGER_BASE =
  'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg border bg-[#FFFFFF] dark:bg-[#262A2F] text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EBF2FD] dark:focus-visible:ring-[rgba(90,141,238,0.15)] focus-visible:border-[#4A83D8] dark:focus-visible:border-[#5A8DEE]'

export function SelectMenu({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  invalid,
}: Props) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])

  const selected = options.find((o) => o.value === value && !o.disabled) ?? null

  function firstEnabled() {
    return Math.max(0, options.findIndex((o) => !o.disabled))
  }
  function nextEnabled(from: number) {
    for (let i = from + 1; i < options.length; i++) if (!options[i].disabled) return i
    return from
  }
  function prevEnabled(from: number) {
    for (let i = from - 1; i >= 0; i--) if (!options[i].disabled) return i
    return from
  }

  // Outside click closes.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // Move focus to the active option while open.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  function openMenu() {
    const sel = options.findIndex((o) => o.value === value && !o.disabled)
    setActiveIndex(sel === -1 ? firstEnabled() : sel)
    setOpen(true)
  }
  function closeMenu(focusTrigger = true) {
    setOpen(false)
    if (focusTrigger) triggerRef.current?.focus()
  }
  function choose(index: number) {
    const opt = options[index]
    if (!opt || opt.disabled) return
    onChange(opt.value)
    closeMenu()
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault()
      openMenu()
    }
  }
  function onListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => nextEnabled(i))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => prevEnabled(i))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(firstEnabled())
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(prevEnabled(options.length))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        choose(activeIndex)
        break
      case 'Escape':
        e.preventDefault()
        closeMenu()
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          TRIGGER_BASE,
          invalid ? 'border-[#A83232]' : 'border-[#D9D3CC] dark:border-[#383C40]',
        ].join(' ')}
      >
        <span
          className={
            selected ? 'text-[#0F1515] dark:text-[#F3F4F6]' : 'text-[#9CA3AF]'
          }
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="shrink-0 text-[#6B7280] dark:text-[#9CA3AF]"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-activedescendant={id ? `${id}-opt-${activeIndex}` : undefined}
          onKeyDown={onListKeyDown}
          className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] py-1 shadow-lg"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value && !opt.disabled
            const isActive = i === activeIndex
            return (
              <li
                key={opt.value || `ph-${i}`}
                id={id ? `${id}-opt-${i}` : undefined}
                ref={(el) => {
                  optionRefs.current[i] = el
                }}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                tabIndex={-1}
                onClick={() => choose(i)}
                onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                className={[
                  'flex items-center gap-2 px-3 py-2 text-sm outline-none',
                  opt.disabled
                    ? 'text-[#9CA3AF] cursor-default'
                    : 'text-[#0F1515] dark:text-[#F3F4F6] cursor-pointer',
                  isActive && !opt.disabled ? 'bg-[#FAFAF8] dark:bg-[#2D3338]' : '',
                ].join(' ')}
              >
                <span className="w-4 shrink-0">
                  {isSelected && (
                    <Check size={14} className="text-[#4A83D8] dark:text-[#5A8DEE]" />
                  )}
                </span>
                {opt.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
