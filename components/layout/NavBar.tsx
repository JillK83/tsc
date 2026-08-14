import { UserButton } from '@clerk/nextjs'
import { getProgram, listPrograms } from '@/lib/db/actions/programs'
import { ThemeToggleIcon } from '@/components/layout/ThemeToggleIcon'
import { ProgramSwitcher } from '@/components/layout/ProgramSwitcher'

// Nav bar chrome is a constant dark navy (surface/perf-tile light value) in both
// themes — it reads as structural chrome, not a page surface, so it does not
// invert in dark mode. Rendered as <nav> so print styles can suppress it.
const NAV_BG = '#0F1D2A'

export async function NavBar() {
  const [program, programs] = await Promise.all([
    getProgram().catch(() => null),
    listPrograms().catch(() => []),
  ])
  const active = program
    ? { id: program.id, sport: program.sport, name: program.name }
    : null

  return (
    <nav
      style={{ backgroundColor: NAV_BG }}
      className="flex items-center h-16 w-full pl-8 pr-6 shrink-0 border-b border-transparent dark:border-white/[0.15]"
    >
      {/* Wordmark — placeholder for real product name */}
      <span className="text-white font-extrabold text-[18px] tracking-wide">
        MAS
      </span>

      {/* Program context — clickable switcher (chevron always shown) */}
      {programs.length > 0 && <ProgramSwitcher active={active} programs={programs} />}

      {/* Right cluster: [theme toggle] [avatar] */}
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggleIcon />
        {/*
          Fallback if Clerk <UserButton> styling conflicts on the dark nav bg:
          replace <UserButton> below with a plain initial circle. Requires
          `import { currentUser } from '@clerk/nextjs/server'` and, above:
            const user = await currentUser().catch(() => null)
            const initial =
              user?.firstName?.[0] ??
              user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? '?'
          then render:
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-white font-semibold text-sm">
              {initial}
            </div>
        */}
        <UserButton />
      </div>
    </nav>
  )
}
