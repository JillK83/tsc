'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createAthlete,
  updateAthlete,
  deleteAthleteIfNoResults,
  checkDuplicateName,
} from '@/lib/db/actions/athletes'

type Sex = 'male' | 'female'

type Initial = {
  name: string
  position: string
  sex: Sex | ''
  birthDate: string
}

type Props =
  | { mode: 'create'; initial?: undefined; athleteId?: undefined }
  | { mode: 'edit'; initial: Initial; athleteId: string }

const INPUT_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3CC] dark:border-[#383C40] bg-[#FFFFFF] dark:bg-[#262A2F] text-[#0F1515] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4A83D8] dark:focus:border-[#5A8DEE] focus:ring-2 focus:ring-[#EBF2FD] dark:focus:ring-[rgba(90,141,238,0.15)] transition-colors'

const LABEL_CLASS =
  'block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF] mb-1.5'

export function AthleteForm({ mode, initial, athleteId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [deleteError, setDeleteError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dupWarning, setDupWarning] = useState(false)
  const [form, setForm] = useState<Initial>(
    initial ?? { name: '', position: '', sex: '', birthDate: '' }
  )

  function set(field: keyof Initial, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
    setDupWarning(false)
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.sex) next.sex = 'Sex is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    const isDup = await checkDuplicateName(form.name)
    if (isDup && mode === 'create') {
      setDupWarning(true)
    }

    startTransition(async () => {
      if (mode === 'create') {
        await createAthlete({
          name: form.name,
          position: form.position || undefined,
          sex: form.sex as Sex,
          birthDate: form.birthDate || undefined,
        })
      } else {
        await updateAthlete(athleteId, {
          name: form.name,
          position: form.position || undefined,
          sex: form.sex as Sex,
          birthDate: form.birthDate || undefined,
        })
      }
      router.push('/dashboard/roster')
      router.refresh()
    })
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Permanently delete ${form.name}? This cannot be undone. Athletes with existing results cannot be deleted.`
      )
    )
      return
    setDeleteError('')
    startDeleteTransition(async () => {
      try {
        await deleteAthleteIfNoResults(athleteId!)
        router.push('/dashboard/roster')
        router.refresh()
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : 'Delete failed')
      }
    })
  }

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#262A2F] rounded-2xl border border-[#D9D3CC] dark:border-[#383C40] p-6 space-y-5">
      <div>
        <label htmlFor="name" className={LABEL_CLASS}>
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Full name"
          aria-required="true"
          className={[
            INPUT_CLASS,
            errors.name ? 'border-[#A83232] bg-[#FDEAEA] dark:bg-[#2A1A1A]' : '',
          ].join(' ')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">{errors.name}</p>
        )}
        {dupWarning && (
          <p className="mt-1 text-xs text-[#A67520] dark:text-[#E5B84A]">
            An athlete with this name already exists in this program. Save anyway?
          </p>
        )}
      </div>

      <div>
        <label htmlFor="position" className={LABEL_CLASS}>
          Position
        </label>
        <input
          id="position"
          type="text"
          value={form.position}
          onChange={(e) => set('position', e.target.value)}
          placeholder="e.g. MF, FWD, GK"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="sex" className={LABEL_CLASS}>
          Sex <span aria-hidden="true">*</span>
        </label>
        <select
          id="sex"
          value={form.sex}
          onChange={(e) => set('sex', e.target.value)}
          aria-required="true"
          className={[
            INPUT_CLASS,
            errors.sex ? 'border-[#A83232]' : '',
          ].join(' ')}
        >
          <option value="" disabled>
            Select…
          </option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        {errors.sex && (
          <p className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">{errors.sex}</p>
        )}
      </div>

      <div>
        <label htmlFor="birthDate" className={LABEL_CLASS}>
          Birth date <span className="normal-case font-normal">(optional)</span>
        </label>
        <input
          id="birthDate"
          type="date"
          value={form.birthDate}
          onChange={(e) => set('birthDate', e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E6E2DE] dark:border-[#30353A]">
        {mode === 'edit' && (
          <div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-[#A83232] dark:text-[#EF8E8E] hover:underline focus:outline-none focus-visible:underline disabled:opacity-40"
            >
              {isDeleting ? 'Deleting…' : 'Delete athlete'}
            </button>
            {deleteError && (
              <p className="mt-1 text-xs text-[#A83232] dark:text-[#EF8E8E]">{deleteError}</p>
            )}
          </div>
        )}
        <div className={mode === 'create' ? 'ml-auto' : ''}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A83D8] dark:bg-[#5A8DEE] text-white text-sm font-semibold hover:bg-[#2E65BE] dark:hover:bg-[#4A83D8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A83D8] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending
              ? 'Saving…'
              : mode === 'create'
                ? 'Add athlete'
                : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
