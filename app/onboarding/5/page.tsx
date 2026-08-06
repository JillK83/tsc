'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { OnboardingCard } from '@/components/onboarding/OnboardingCard'
import { StepActions } from '@/components/onboarding/StepActions'
import { markOnboardingComplete } from '@/lib/db/actions/onboarding'
import { getProgram } from '@/lib/db/actions/programs'
import { getAthletes } from '@/lib/db/actions/athletes'

const SEASON_LABELS: Record<string, string> = {
  offseason: 'Off-Season',
  preseason: 'Preseason',
  in_season: 'In-Season',
  postseason: 'Postseason',
}
const GOAL_LABELS: Record<string, string> = {
  build: 'Build',
  maintain: 'Maintain',
  peak: 'Peak',
}

type ReviewData = {
  sport: string
  programName: string
  seasonPhase: string
  conditioningGoal: string
  athleteCount: number
  testDate: string
  paperSize: string
  printColor: string
}

function formatTestDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatPrint(paperSize: string, printColor: string) {
  const paper = paperSize === 'letter_8_5x11' ? 'US Letter' : 'A4'
  const orientation = 'Landscape'
  const color = printColor === 'bw' ? 'Black & White' : 'Color'
  return `${paper} · ${orientation} · ${color}`
}

export default function ReviewLaunchPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [review, setReview] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [program, athletes] = await Promise.all([getProgram(), getAthletes()])
      const testDate = sessionStorage.getItem('onboarding_test_date') ?? ''

      if (program) {
        setReview({
          sport: program.sport,
          programName: program.name,
          seasonPhase: program.seasonPhase,
          conditioningGoal: program.conditioningGoal,
          athleteCount: athletes.length,
          testDate,
          paperSize: program.printPaperSize,
          printColor: program.printColor,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function handleLaunch() {
    startTransition(async () => {
      await markOnboardingComplete()
      sessionStorage.removeItem('onboarding_test_date')
      sessionStorage.removeItem('onboarding_conditions')
      router.push('/dashboard')
    })
  }

  if (loading) {
    return (
      <OnboardingCard>
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-[#9CA3AF]">Loading…</span>
        </div>
      </OnboardingCard>
    )
  }

  const rows = review
    ? [
        { label: 'Program', value: `${review.sport} — ${review.programName}` },
        { label: 'Season phase', value: SEASON_LABELS[review.seasonPhase] ?? review.seasonPhase },
        { label: 'Conditioning goal', value: GOAL_LABELS[review.conditioningGoal] ?? review.conditioningGoal },
        {
          label: 'Athletes',
          value: review.athleteCount > 0 ? `${review.athleteCount} loaded` : 'None added',
          badge:
            review.athleteCount > 0
              ? { text: 'Ready', color: 'success' as const }
              : undefined,
        },
        { label: 'Test date', value: formatTestDate(review.testDate) },
        {
          label: 'Print',
          value: formatPrint(review.paperSize, review.printColor),
        },
      ]
    : []

  return (
    <OnboardingCard>
      <StepIndicator current={5} />

      {/* Success circle */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-full bg-[#D6F0E5] dark:bg-[#0B2D1E] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12l4.5 4.5L19 7"
              stroke="#1E6E4C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1 text-center">
        Step 5 of 5
      </p>
      <h1 className="text-2xl font-extrabold text-[#0F1515] dark:text-[#F3F4F6] mb-1 text-center">
        You're ready to go
      </h1>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-8 text-center">
        Review your setup before launching the dashboard.
      </p>

      {/* Review table */}
      <div className="rounded-xl border border-[#D9D3CC] dark:border-[#383C40] overflow-hidden mb-2">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={[
              'flex items-center justify-between px-4 py-3',
              i < rows.length - 1
                ? 'border-b border-[#E6E2DE] dark:border-[#30353A]'
                : '',
            ].join(' ')}
          >
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6]">
                {row.value}
              </span>
              {row.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D6F0E5] text-[#1E6E4C] dark:bg-[#0B2D1E] dark:text-[#5ECFA0]">
                  {row.badge.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <StepActions
        backHref="/onboarding/4"
        onContinue={handleLaunch}
        continueLabel="Launch dashboard"
        isSubmitting={isPending}
        launchVariant
      />
    </OnboardingCard>
  )
}
