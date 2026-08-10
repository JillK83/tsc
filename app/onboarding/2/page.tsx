'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { OnboardingCard } from '@/components/onboarding/OnboardingCard'
import { StepActions } from '@/components/onboarding/StepActions'
import { bulkInsertAthletes } from '@/lib/db/actions/athletes'

type Sex = 'male' | 'female'

type AthleteRow = {
  id: string
  name: string
  position: string
  sex: Sex | ''
  birthDate: string
}

type ParseError = {
  row: number
  message: string
}

function newRow(): AthleteRow {
  return { id: crypto.randomUUID(), name: '', position: '', sex: '', birthDate: '' }
}

export default function RosterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'csv' | 'manual'>('csv')

  // CSV state
  const [csvAthletes, setCsvAthletes] = useState<AthleteRow[]>([])
  const [csvErrors, setCsvErrors] = useState<ParseError[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual state
  const [manualAthletes, setManualAthletes] = useState<AthleteRow[]>([newRow()])

  function parseFile(file: File) {
    setCsvErrors([])
    setCsvAthletes([])

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows: AthleteRow[] = []
        const errs: ParseError[] = []

        results.data.forEach((raw, i) => {
          const norm: Record<string, string> = {}
          for (const [k, v] of Object.entries(raw)) norm[k.trim().toLowerCase()] = v

          const name = (norm['name'] ?? '').trim()
          const position = (norm['position'] ?? '').trim()
          const sexRaw = (norm['sex'] ?? '').trim().toLowerCase()
          const birthDate = (norm['birth_date'] ?? norm['birthdate'] ?? norm['birth date'] ?? '').trim()

          if (!name) {
            errs.push({ row: i + 2, message: `Row ${i + 2}: name is required` })
            return
          }

          const sex: Sex | '' =
            sexRaw === 'male' || sexRaw === 'm'
              ? 'male'
              : sexRaw === 'female' || sexRaw === 'f'
                ? 'female'
                : ''

          if (!sex) {
            errs.push({ row: i + 2, message: `Row ${i + 2}: sex must be "male" or "female"` })
            return
          }

          rows.push({ id: crypto.randomUUID(), name, position, sex, birthDate })
        })

        setCsvAthletes(rows)
        if (errs.length > 0) setCsvErrors(errs)
      },
      error(err) {
        setCsvErrors([{ row: 0, message: `Could not read file: ${err.message}` }])
      },
    })
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }, [])

  function removeManualRow(id: string) {
    setManualAthletes((rows) => {
      const next = rows.filter((r) => r.id !== id)
      return next.length === 0 ? [newRow()] : next
    })
  }

  function updateManualRow(id: string, field: keyof AthleteRow, value: string) {
    setManualAthletes((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  async function handleContinue() {
    const source = tab === 'csv' ? csvAthletes : manualAthletes

    const valid = source.filter(
      (a) => a.name.trim() && (a.sex === 'male' || a.sex === 'female')
    )

    startTransition(async () => {
      if (valid.length > 0) {
        await bulkInsertAthletes(
          valid.map((a) => ({
            name: a.name,
            position: a.position || undefined,
            sex: a.sex as Sex,
            birthDate: a.birthDate || undefined,
          }))
        )
      }
      router.push('/onboarding/3')
    })
  }

  return (
    <OnboardingCard maxWidth="720px">
      <StepIndicator current={2} />

      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1">
        Step 2 of 5
      </p>
      <h1 className="text-2xl font-extrabold text-[#0F1515] dark:text-[#F3F4F6] mb-1">
        Add your athletes
      </h1>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
        Upload a CSV or enter manually. You can add more later.
      </p>

      {/* Tab toggle */}
      <div className="flex border-b border-[#D9D3CC] dark:border-[#383C40] mb-6">
        {(['csv', 'manual'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'px-4 pb-2 text-sm font-medium transition-colors focus:outline-none focus-visible:underline',
              tab === t
                ? 'text-[#4A83D8] dark:text-[#5A8DEE] border-b-2 border-[#4A83D8] dark:border-[#5A8DEE] -mb-px'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F1515] dark:hover:text-[#F3F4F6]',
            ].join(' ')}
          >
            {t === 'csv' ? 'CSV upload' : 'Manual entry'}
          </button>
        ))}
      </div>

      {tab === 'csv' ? (
        <div>
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop roster CSV or click to browse"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={[
              'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors',
              isDragging
                ? 'border-[#4A83D8] bg-[#EBF2FD] dark:border-[#5A8DEE] dark:bg-[rgba(90,141,238,0.1)]'
                : 'border-[#D9D3CC] dark:border-[#383C40] hover:border-[#4A83D8] dark:hover:border-[#5A8DEE]',
            ].join(' ')}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="text-[#9CA3AF]">
              <rect x="6" y="4" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10h8M10 14h8M10 18h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M20 18l4 4m0 0l-4 4m4-4H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-[#0F1515] dark:text-[#F3F4F6]">
              Drop roster CSV or click to browse
            </p>
            <p className="text-xs text-[#9CA3AF]">
              Required columns: name, position, sex · birth_date optional
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) parseFile(file)
            }}
          />
          <p className="mt-2 text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
            Accepts .csv files only. In Google Sheets: File → Download → Comma-separated values (.csv)
          </p>

          {/* Parse errors */}
          {csvErrors.length > 0 && (
            <div className="mt-4 rounded-lg border border-[#A83232] bg-[#FDEAEA] dark:bg-[#2A1A1A] p-3">
              <p className="text-xs font-semibold text-[#A83232] dark:text-[#EF8E8E] mb-1">
                Fix these issues before continuing:
              </p>
              <ul className="list-disc list-inside text-xs text-[#A83232] dark:text-[#EF8E8E] space-y-0.5">
                {csvErrors.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview table */}
          {csvAthletes.length > 0 && csvErrors.length === 0 && (
            <div className="mt-4">
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                {csvAthletes.length} athlete{csvAthletes.length !== 1 ? 's' : ''} ready to import
              </p>
              <div className="overflow-x-auto rounded-lg border border-[#E6E2DE] dark:border-[#30353A]">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E6E2DE] dark:border-[#30353A]">
                      {['Name', 'Position', 'Sex', 'Birth date'].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280] dark:text-[#9CA3AF]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvAthletes.slice(0, 8).map((a) => (
                      <tr key={a.id} className="border-b last:border-0 border-[#E6E2DE] dark:border-[#30353A]">
                        <td className="px-3 py-2 text-[#0F1515] dark:text-[#F3F4F6]">{a.name}</td>
                        <td className="px-3 py-2 text-[#6B7280] dark:text-[#9CA3AF]">{a.position || '—'}</td>
                        <td className="px-3 py-2 text-[#6B7280] dark:text-[#9CA3AF] capitalize">{a.sex}</td>
                        <td className="px-3 py-2 text-[#6B7280] dark:text-[#9CA3AF]">{a.birthDate || '—'}</td>
                      </tr>
                    ))}
                    {csvAthletes.length > 8 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-2 text-xs text-[#9CA3AF] dark:text-[#6B7280]"
                        >
                          …and {csvAthletes.length - 8} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Manual entry rows */}
          <div className="space-y-3">
            {manualAthletes.map((row, idx) => (
              <div key={row.id} className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_24px] gap-3 items-end">
                <div>
                  {idx === 0 && (
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                      Name *
                    </label>
                  )}
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateManualRow(row.id, 'name', e.target.value)}
                    placeholder="Full name"
                    aria-label="Athlete name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)]"
                  />
                </div>
                <div>
                  {idx === 0 && (
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                      Position
                    </label>
                  )}
                  <input
                    type="text"
                    value={row.position}
                    onChange={(e) => updateManualRow(row.id, 'position', e.target.value)}
                    placeholder="e.g. MF"
                    aria-label="Position"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)]"
                  />
                </div>
                <div>
                  {idx === 0 && (
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                      Sex *
                    </label>
                  )}
                  <select
                    value={row.sex}
                    onChange={(e) => updateManualRow(row.id, 'sex', e.target.value)}
                    aria-label="Sex"
                    className="px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] cursor-pointer"
                  >
                    <option value="" disabled>—</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div>
                  {idx === 0 && (
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                      Birth date
                    </label>
                  )}
                  <input
                    type="date"
                    value={row.birthDate}
                    onChange={(e) => updateManualRow(row.id, 'birthDate', e.target.value)}
                    aria-label="Birth date (optional)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)]"
                  />
                </div>
                <div className={idx === 0 ? 'mt-6' : ''}>
                  <button
                    type="button"
                    onClick={() => removeManualRow(row.id)}
                    aria-label={`Remove ${row.name || 'athlete'}`}
                    className="p-2 text-[#9CA3AF] hover:text-[#A83232] dark:hover:text-[#EF8E8E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] rounded"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setManualAthletes((rows) => [...rows, newRow()])}
            className="mt-4 text-sm text-[#4A83D8] dark:text-[#5A8DEE] hover:underline focus:outline-none focus-visible:underline"
          >
            + Add another athlete
          </button>
        </div>
      )}

      <StepActions
        backHref="/onboarding/1"
        onContinue={handleContinue}
        continueDisabled={
          tab === 'csv'
            ? csvErrors.length > 0
            : false
        }
        isSubmitting={isPending}
      />
    </OnboardingCard>
  )
}
