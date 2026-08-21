'use client'

import {
  useState,
  useEffect,
  useTransition,
  useRef,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  parseSpeedInput,
  computeSpeedResult,
  displayMs,
  SPEED_VALID_MIN,
  SPEED_VALID_MAX,
} from '@/lib/formulas/speed'
import { saveSpeedResults } from '@/lib/db/actions/speed-results'

type Athlete = {
  id: string
  name: string
  position: string | null
}

type ExistingSpeedResult = {
  athleteId: string
  flyTimeS: number
  mssMs: number
  asrMs: number | null
  notes: string | null
}

type RowStatus = 'pending' | 'valid' | 'invalid' | 'warning'

type RowState = {
  athleteId: string
  name: string
  position: string | null
  masMs: number | null
  input: string
  status: RowStatus
  computed: { mssMs: number; asrMs: number | null } | null
  inRange: boolean
  notes: string
  savedInput: string
}

type Props = {
  sessionId: string
  athletes: Athlete[]
  masMap: Record<string, number>
  existingResults: ExistingSpeedResult[]
}

function initRow(
  athlete: Athlete,
  masMs: number | null,
  existing?: ExistingSpeedResult
): RowState {
  if (existing) {
    const inRange =
      existing.flyTimeS >= SPEED_VALID_MIN && existing.flyTimeS <= SPEED_VALID_MAX
    const input = String(existing.flyTimeS)
    return {
      athleteId: athlete.id,
      name: athlete.name,
      position: athlete.position,
      masMs,
      input,
      status: inRange ? 'valid' : 'warning',
      computed: { mssMs: existing.mssMs, asrMs: existing.asrMs },
      inRange,
      notes: existing.notes ?? '',
      savedInput: input,
    }
  }
  return {
    athleteId: athlete.id,
    name: athlete.name,
    position: athlete.position,
    masMs,
    input: '',
    status: 'pending',
    computed: null,
    inRange: false,
    notes: '',
    savedInput: '',
  }
}

export function SpeedEntryTable({
  sessionId,
  athletes,
  masMap,
  existingResults,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const existingMap = Object.fromEntries(
    existingResults.map((r) => [r.athleteId, r])
  )

  const [rows, setRows] = useState<RowState[]>(() =>
    athletes.map((a) =>
      initRow(a, masMap[a.id] ?? null, existingMap[a.id])
    )
  )

  const hasUnsavedChanges = rows.some((r) => r.input !== r.savedInput)

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const updateRow = useCallback(
    (athleteId: string, patch: Partial<RowState>) => {
      setRows((prev) =>
        prev.map((r) => (r.athleteId === athleteId ? { ...r, ...patch } : r))
      )
    },
    []
  )

  function handleBlur(athleteId: string, value: string, masMs: number | null) {
    if (!value.trim()) {
      updateRow(athleteId, { input: '', status: 'pending', computed: null, inRange: true })
      return
    }

    const flyTimeS = parseSpeedInput(value)
    if (flyTimeS === null || flyTimeS <= 0) {
      updateRow(athleteId, { status: 'invalid', computed: null })
      return
    }

    const { mssMs, asrMs, inRange } = computeSpeedResult(flyTimeS, masMs)
    updateRow(athleteId, {
      status: inRange ? 'valid' : 'warning',
      computed: { mssMs, asrMs },
      inRange,
    })
  }

  async function save(finalize: boolean) {
    const saveable = rows.filter(
      (r) => (r.status === 'valid' || r.status === 'warning') && r.computed
    )
    if (saveable.length === 0 && finalize) return

    setIsSaving(true)
    const toSave = saveable.map((r) => ({
      athleteId: r.athleteId,
      flyTimeS: parseSpeedInput(r.input)!,
      masMs: r.masMs,
      notes: r.notes || undefined,
    }))

    startTransition(async () => {
      try {
        setSaveError(null)
        await saveSpeedResults(sessionId, toSave)
        setRows((prev) =>
          prev.map((r) =>
            r.status === 'valid' || r.status === 'warning'
              ? { ...r, savedInput: r.input }
              : r
          )
        )
        if (finalize) {
          setSavedToast(true)
          setTimeout(() => {
            router.push('/dashboard')
          }, 1800)
        }
      } catch (err) {
        console.error('Save failed:', err)
        setSaveError('Save failed. Check your connection and try again.')
      } finally {
        setIsSaving(false)
      }
    })
  }

  const saveableCount = rows.filter(
    (r) => r.status === 'valid' || r.status === 'warning'
  ).length
  const filteredRows = search.trim()
    ? rows.filter((r) =>
        r.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : rows

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Leave confirmation modal */}
      {showLeaveModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-modal-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] p-6 shadow-lg w-full max-w-sm mx-4">
            <h2
              id="leave-modal-heading"
              className="text-base font-bold text-[#0F1515] dark:text-[#F3F4F6]"
            >
              Unsaved changes
            </h2>
            <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              You have unsaved entries. Leave without saving?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] text-sm font-semibold hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] dark:hover:bg-[#4A83D8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8]"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved toast */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-[#0F1515] dark:bg-[#F3F4F6] text-white dark:text-[#0F1515] text-sm font-semibold shadow-lg"
        >
          Session saved — {saveableCount} athlete{saveableCount !== 1 ? 's' : ''} entered
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 pl-6 pr-8 py-4 border-b border-[#D9D3CC] dark:border-[#383C40]">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#0F1515] dark:text-[#F3F4F6]">
            Test Session — 10m Fly
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Enter 10m fly times for the team
          </p>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mr-2 flex-shrink-0">
            <span className="font-semibold text-[#0F1515] dark:text-[#F3F4F6]">
              {saveableCount}
            </span>{' '}
            of {athletes.length} athletes entered
          </span>
          <div className="relative min-w-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athletes…"
              aria-label="Search athletes"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FAFAF8] dark:bg-[#2D3338] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] w-full max-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto pb-16">
        <table className="w-full table-fixed">
          <thead className="sticky top-0 bg-[#FFFFFF] dark:bg-[#262A2F] z-10">
            <tr className="border-b border-[#D9D3CC] dark:border-[#383C40]">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF] w-[30%]">
                Athlete
              </th>
              <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF] w-[20%]">
                <span className="block">10m Fly Time (s)</span>
                <span className="block text-center text-[10px] font-normal normal-case tracking-normal text-[#9CA3AF] mt-0.5">
                  20m build-up + 10m timed section
                </span>
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF] w-[15%]">
                MSS (m/s)
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF] w-[15%]">
                ASR (m/s)
              </th>
              <th className="px-3 py-3 w-[10%]" aria-label="Notes" />
              <th className="px-3 py-3 w-[10%]" aria-label="Status" />
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <SpeedEntryRow
                key={row.athleteId}
                row={row}
                onInputChange={(v) => updateRow(row.athleteId, { input: v })}
                onBlur={(v) => handleBlur(row.athleteId, v, row.masMs)}
                onNotesChange={(v) => updateRow(row.athleteId, { notes: v })}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div
          role="alert"
          className="px-6 py-2.5 bg-[#FDEAEA] dark:bg-[rgba(168,50,50,0.15)] border-t border-[#A83232] dark:border-[#EF8E8E] text-sm text-[#A83232] dark:text-[#EF8E8E]"
        >
          {saveError}
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-white dark:bg-[#262A2F] border-t border-[#D9D3CC] dark:border-[#383C40]">
        <button
          type="button"
          onClick={() => {
            if (hasUnsavedChanges) { setShowLeaveModal(true); return }
            router.push('/dashboard')
          }}
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none focus-visible:underline"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={isSaving || isPending}
            className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-[#4A83D8] dark:border-[#5A8DEE] text-[#4A83D8] dark:text-[#5A8DEE] text-sm font-semibold hover:bg-[#EBF2FD] dark:hover:bg-[rgba(90,141,238,0.15)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] disabled:opacity-40"
          >
            {isSaving && !savedToast ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={saveableCount === 0 || isSaving || isPending}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] dark:hover:bg-[#4A83D8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save session
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Individual row ────────────────────────────────────────────────────────────

type RowProps = {
  row: RowState
  onInputChange: (value: string) => void
  onBlur: (value: string) => void
  onNotesChange: (value: string) => void
}

function SpeedEntryRow({ row, onInputChange, onBlur, onNotesChange }: RowProps) {
  const [notesOpen, setNotesOpen] = useState(false)
  const [warningOpen, setWarningOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { status, computed } = row

  const rowBg =
    status === 'invalid'
      ? 'bg-[#FDEAEA] dark:bg-[rgba(168,50,50,0.1)] border-l-2 border-[#A83232] dark:border-[#EF8E8E]'
      : status === 'warning'
        ? 'bg-[#FDF3DC] dark:bg-[rgba(166,117,32,0.1)] border-l-2 border-[#C98E24]'
        : ''

  return (
    <>
      <tr
        className={[
          'border-b border-[#E6E2DE] dark:border-[#30353A] hover:bg-[#FAFAF8] dark:hover:bg-[#2D3338] transition-colors',
          rowBg,
        ].join(' ')}
      >
        {/* Athlete */}
        <td className="px-6 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full bg-[#E6E2DE] dark:bg-[#383C40] flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="5" r="2.5" stroke="#9CA3AF" strokeWidth="1.2" />
                <path d="M2 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F1515] dark:text-[#F3F4F6] leading-tight">
                {row.name}
              </p>
              {row.position && (
                <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]" title={row.position}>{row.position}</p>
              )}
            </div>
          </div>
        </td>

        {/* Fly time input */}
        <td className="px-3 py-2 text-center">
          <div>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={row.input}
              onChange={(e) => onInputChange(e.target.value)}
              onBlur={(e) => onBlur(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  inputRef.current?.blur()
                  const inputs = Array.from(
                    document.querySelectorAll<HTMLInputElement>('input[inputmode="decimal"]')
                  )
                  const idx = inputs.indexOf(inputRef.current!)
                  inputs[idx + 1]?.focus()
                }
              }}
              placeholder="e.g. 1.23"
              aria-label={`10m fly time for ${row.name}`}
              aria-invalid={status === 'invalid'}
              className={[
                'block mx-auto w-[108px] px-3 py-1.5 text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors font-variant-numeric tabular-nums',
                status === 'invalid'
                  ? 'border-[#A83232] bg-[#FDEAEA] dark:bg-[rgba(168,50,50,0.15)] text-[#0F1515] dark:text-[#F3F4F6] focus:border-[#A83232]'
                  : status === 'warning'
                    ? 'border-[#C98E24] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:border-[#C98E24]'
                    : status === 'valid'
                      ? 'border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:border-[#4A83D8] dark:focus:border-[#5A8DEE]'
                      : 'border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] placeholder:text-[#9CA3AF]',
              ].join(' ')}
            />
            {status === 'invalid' && (
              <p className="mt-1 text-[11px] text-center text-[#A83232] dark:text-[#EF8E8E]">
                Invalid — enter time in seconds (e.g. 1.23)
              </p>
            )}
            {(status === 'valid' || status === 'warning') && computed && (
              <p className="mt-1 w-[108px] mx-auto text-left text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                → {displayMs(computed.mssMs)} m/s
              </p>
            )}
          </div>
        </td>

        {/* MSS */}
        <td className="px-3 py-3 text-right text-[13px] font-bold font-variant-numeric tabular-nums text-[#0F1515] dark:text-[#F3F4F6]">
          {computed ? (
            displayMs(computed.mssMs)
          ) : (
            <span className="font-normal text-[#9CA3AF]">—</span>
          )}
        </td>

        {/* ASR */}
        <td className="px-3 py-3 text-right text-[13px] font-bold font-variant-numeric tabular-nums text-[#0F1515] dark:text-[#F3F4F6]">
          {row.masMs === null ? (
            <span className="font-normal text-[#9CA3AF] text-[11px]">No MAS</span>
          ) : computed?.asrMs != null && computed.asrMs >= 0 ? (
            displayMs(computed.asrMs)
          ) : (
            <span className="font-normal text-[#9CA3AF]">—</span>
          )}
        </td>

        {/* Notes toggle */}
        <td className="px-3 py-3 text-center">
          <button
            type="button"
            title="Add note"
            onClick={() => setNotesOpen((v) => !v)}
            aria-label={`${notesOpen ? 'Close' : 'Open'} notes for ${row.name}`}
            className="text-[#9CA3AF] hover:text-[#6B7280] dark:hover:text-[#9CA3AF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] rounded"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </td>

        {/* Status icon */}
        <td className="px-3 py-3">
          <div className="flex flex-col items-center justify-center gap-1">
            {status === 'valid' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Valid" role="img">
                <path d="M3 8l3.5 3.5L13 4.5" stroke="#1E6E4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : status === 'warning' ? (
              <>
                <button
                  type="button"
                  onClick={() => setWarningOpen((v) => !v)}
                  aria-label={warningOpen ? 'Hide warning detail' : 'Show warning detail'}
                  aria-expanded={warningOpen}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] rounded"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.5" stroke="#C98E24" strokeWidth="1.5" />
                    <path d="M8 5v3.5M8 10.5v.5" stroke="#C98E24" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {warningOpen && (
                  <p className="text-[10px] text-center text-[#A67520] leading-tight">
                    Fly time outside expected range (0.8–2.5s) — check recording
                  </p>
                )}
              </>
            ) : status === 'invalid' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Invalid" role="img">
                <circle cx="8" cy="8" r="6.5" stroke="#A83232" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 10.5v.5" stroke="#A83232" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="text-[#9CA3AF] text-[13px]" aria-label="Pending">—</span>
            )}
          </div>
        </td>
      </tr>

      {/* Inline notes row */}
      {notesOpen && (
        <tr className="border-b border-[#E6E2DE] dark:border-[#30353A]">
          <td colSpan={6} className="px-6 pb-3 pt-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] flex-shrink-0">
                Note:
              </span>
              <input
                type="text"
                value={row.notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder={`Notes for ${row.name}…`}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FAFAF8] dark:bg-[#2D3338] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)]"
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
