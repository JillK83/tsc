import { UserButton } from '@clerk/nextjs'
import { getProgram } from '@/lib/db/actions/programs'
import { ThemeToggleIcon } from '@/components/layout/ThemeToggleIcon'

// Nav bar chrome is a constant dark navy (surface/perf-tile light value) in both
// themes — it reads as structural chrome, not a page surface, so it does not
// invert in dark mode. Rendered as <nav> so print styles can suppress it.
const NAV_BG = '#0F1D2A'

export async function NavBar() {
  const program = await getProgram().catch(() => null)
  const programName = program?.name ?? null

  return (
    <nav
      style={{ backgroundColor: NAV_BG }}
      className="flex items-center h-16 w-full px-8 shrink-0 border-b border-transparent dark:border-white/[0.15]"
    >
      {/* Wordmark — placeholder for real product name */}
      <span className="text-white font-extrabold text-[18px] tracking-wide">
        MAS
      </span>

      {/* Program context — plain text now; becomes a dropdown in 7B */}
      {programName && (
        <>
          <span className="mx-3 text-white/40 select-none">|</span>
          <span className="text-white/80 font-medium text-sm">{programName}</span>
        </>
      )}

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
