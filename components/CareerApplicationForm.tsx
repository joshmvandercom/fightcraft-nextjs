'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'

interface Props {
  roleSlug: string
  blobEnabled: boolean
}

interface Fields {
  fullName: string
  email: string
  phone: string
  linkedinUrl: string
  whyThisRole: string
  keyExperience: string
  twoYearVision: string
  resumeUrl: string
}

const EMPTY: Fields = {
  fullName: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  whyThisRole: '',
  keyExperience: '',
  twoYearVision: '',
  resumeUrl: '',
}

const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]
const MAX_RESUME_BYTES = 5 * 1024 * 1024

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[\d\s().+-]{7,}$/
const URL_RE = /^https?:\/\/.+/i

const COUNT = {
  whyThisRole: { min: 100, max: 2000 },
  keyExperience: { min: 100, max: 2000 },
  twoYearVision: { min: 50, max: 1500 },
} as const

type FieldErrors = Partial<Record<keyof Fields, string>>

function validate(fields: Fields): FieldErrors {
  const errs: FieldErrors = {}

  if (!fields.fullName.trim() || fields.fullName.trim().length < 2) {
    errs.fullName = 'Please enter your full name.'
  }
  if (!fields.email.trim()) {
    errs.email = 'Email is required.'
  } else if (!EMAIL_RE.test(fields.email.trim())) {
    errs.email = 'Enter a valid email address.'
  }
  if (fields.phone.trim() && !PHONE_RE.test(fields.phone.trim())) {
    errs.phone = 'Enter a valid phone number.'
  }
  if (fields.linkedinUrl.trim() && !URL_RE.test(fields.linkedinUrl.trim())) {
    errs.linkedinUrl = 'Must start with http:// or https://'
  }
  if (fields.resumeUrl.trim() && !URL_RE.test(fields.resumeUrl.trim())) {
    errs.resumeUrl = 'Must start with http:// or https://'
  }

  for (const key of ['whyThisRole', 'keyExperience', 'twoYearVision'] as const) {
    const val = fields[key].trim()
    const { min, max } = COUNT[key]
    if (val.length < min) errs[key] = `At least ${min} characters required (currently ${val.length}).`
    else if (val.length > max) errs[key] = `Keep it under ${max} characters (currently ${val.length}).`
  }

  return errs
}

function fieldClasses(hasError: boolean) {
  return [
    'w-full',
    'border',
    hasError ? 'border-red-600' : 'border-black/20 focus:border-black',
    'bg-white',
    'text-black',
    'px-4 py-3',
    'text-base',
    'focus:outline-none',
    'transition-colors',
    'placeholder:text-black/30',
  ].join(' ')
}

export default function CareerApplicationForm({ roleSlug, blobEnabled }: Props) {
  const router = useRouter()
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [touched, setTouched] = useState<Set<keyof Fields>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [topError, setTopError] = useState<string | null>(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [resumeError, setResumeError] = useState<string | null>(null)

  const errors = useMemo(() => validate(fields), [fields])
  const isValid = Object.keys(errors).length === 0

  const update = (key: keyof Fields) => (value: string) =>
    setFields(prev => ({ ...prev, [key]: value }))
  const blur = (key: keyof Fields) => () => setTouched(prev => new Set(prev).add(key))
  const showError = (key: keyof Fields) => touched.has(key) && errors[key]

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setResumeError(null)

    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setResumeError('Resume must be a PDF or DOCX file.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError('File is too large. Maximum 5MB.')
      e.target.value = ''
      return
    }

    setUploadingResume(true)
    setResumeFileName(file.name)
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/careers/resume-upload',
        clientPayload: JSON.stringify({ roleSlug, originalFilename: file.name }),
      })
      setFields(prev => ({ ...prev, resumeUrl: blob.url }))
    } catch (err) {
      console.error('Resume upload failed', err)
      setResumeError('Upload failed. Try again or paste a link to your resume below.')
      setResumeFileName(null)
    } finally {
      setUploadingResume(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setTouched(new Set(Object.keys(fields) as (keyof Fields)[]))
    if (!isValid) {
      setTopError('Please fix the highlighted fields and try again.')
      return
    }

    setSubmitting(true)
    setTopError(null)

    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleSlug,
          fullName: fields.fullName.trim(),
          email: fields.email.trim(),
          phone: fields.phone.trim(),
          linkedinUrl: fields.linkedinUrl.trim(),
          whyThisRole: fields.whyThisRole.trim(),
          keyExperience: fields.keyExperience.trim(),
          twoYearVision: fields.twoYearVision.trim(),
          resumeUrl: fields.resumeUrl.trim(),
        }),
      })

      if (res.ok) {
        router.push(`/careers/${roleSlug}/apply/success`)
        return
      }

      if (res.status === 429) {
        setTopError('Too many submissions from this connection. Please wait an hour and try again.')
      } else {
        const json = await res.json().catch(() => null)
        setTopError(json?.error ?? 'Something went wrong submitting your application. Please try again.')
      }
    } catch (err) {
      console.error('Application submit error:', err)
      setTopError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitDisabled = !isValid || submitting || uploadingResume

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {topError && (
        <div className="border border-red-600 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {topError}
        </div>
      )}

      <Field
        label="Full name"
        required
        error={showError('fullName') ? errors.fullName : undefined}
      >
        <input
          type="text"
          name="fullName"
          autoComplete="name"
          value={fields.fullName}
          onChange={e => update('fullName')(e.target.value)}
          onBlur={blur('fullName')}
          className={fieldClasses(!!showError('fullName'))}
        />
      </Field>

      <Field label="Email" required error={showError('email') ? errors.email : undefined}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          name="email"
          value={fields.email}
          onChange={e => update('email')(e.target.value)}
          onBlur={blur('email')}
          className={fieldClasses(!!showError('email'))}
        />
      </Field>

      <Field label="Phone" hint="Optional" error={showError('phone') ? errors.phone : undefined}>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          name="phone"
          value={fields.phone}
          onChange={e => update('phone')(e.target.value)}
          onBlur={blur('phone')}
          placeholder="(408) 555-0101"
          className={fieldClasses(!!showError('phone'))}
        />
      </Field>

      <Field
        label="LinkedIn or portfolio URL"
        hint="Optional"
        error={showError('linkedinUrl') ? errors.linkedinUrl : undefined}
      >
        <input
          type="url"
          inputMode="url"
          name="linkedinUrl"
          value={fields.linkedinUrl}
          onChange={e => update('linkedinUrl')(e.target.value)}
          onBlur={blur('linkedinUrl')}
          placeholder="https://linkedin.com/in/..."
          className={fieldClasses(!!showError('linkedinUrl'))}
        />
      </Field>

      <Field
        label="Why this role, specifically?"
        required
        helper="Not the industry — why this specific role, with us?"
        error={showError('whyThisRole') ? errors.whyThisRole : undefined}
        counter={{ value: fields.whyThisRole.length, ...COUNT.whyThisRole }}
      >
        <textarea
          name="whyThisRole"
          rows={6}
          value={fields.whyThisRole}
          onChange={e => update('whyThisRole')(e.target.value)}
          onBlur={blur('whyThisRole')}
          className={fieldClasses(!!showError('whyThisRole'))}
        />
      </Field>

      <Field
        label="Tell us about a hard moment in your work and how you handled it"
        required
        helper="A specific story beats a list of skills. What was the situation, what made it hard, what did you do?"
        error={showError('keyExperience') ? errors.keyExperience : undefined}
        counter={{ value: fields.keyExperience.length, ...COUNT.keyExperience }}
      >
        <textarea
          name="keyExperience"
          rows={6}
          value={fields.keyExperience}
          onChange={e => update('keyExperience')(e.target.value)}
          onBlur={blur('keyExperience')}
          className={fieldClasses(!!showError('keyExperience'))}
        />
      </Field>

      <Field
        label="Where do you want to be in two years?"
        required
        error={showError('twoYearVision') ? errors.twoYearVision : undefined}
        counter={{ value: fields.twoYearVision.length, ...COUNT.twoYearVision }}
      >
        <textarea
          name="twoYearVision"
          rows={5}
          value={fields.twoYearVision}
          onChange={e => update('twoYearVision')(e.target.value)}
          onBlur={blur('twoYearVision')}
          className={fieldClasses(!!showError('twoYearVision'))}
        />
      </Field>

      <Field label="Resume" hint="Optional · PDF or DOCX, max 5MB">
        {blobEnabled ? (
          <div className="space-y-2">
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              onChange={handleResumeChange}
              disabled={uploadingResume}
              className="block w-full text-sm file:mr-4 file:px-4 file:py-2 file:border file:border-black file:bg-white file:text-black file:font-heading file:text-xs file:uppercase file:tracking-widest hover:file:bg-black hover:file:text-white file:cursor-pointer file:transition-colors disabled:opacity-50"
            />
            {uploadingResume && <p className="text-sm text-black/60">Uploading {resumeFileName}…</p>}
            {!uploadingResume && fields.resumeUrl && resumeFileName && (
              <p className="text-sm text-black/60">
                Uploaded: <span className="text-black">{resumeFileName}</span>
              </p>
            )}
            {resumeError && <p className="text-sm text-red-700">{resumeError}</p>}
          </div>
        ) : (
          <input
            type="url"
            inputMode="url"
            name="resumeUrl"
            value={fields.resumeUrl}
            onChange={e => update('resumeUrl')(e.target.value)}
            onBlur={blur('resumeUrl')}
            placeholder="https://drive.google.com/..."
            className={fieldClasses(!!showError('resumeUrl'))}
          />
        )}
        {showError('resumeUrl') && !blobEnabled && (
          <p className="mt-1 text-sm text-red-700">{errors.resumeUrl}</p>
        )}
      </Field>

      <div className="pt-4 border-t border-black/10">
        <button
          type="submit"
          disabled={submitDisabled}
          className="font-heading text-sm uppercase tracking-widest bg-black text-white px-10 py-4 hover:bg-black/80 disabled:bg-black/30 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit Application'}
        </button>
        <p className="mt-3 text-xs text-black/50">
          We respond to every application within 5 business days.
        </p>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  hint,
  helper,
  error,
  counter,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  helper?: string
  error?: string
  counter?: { value: number; min: number; max: number }
  children: React.ReactNode
}) {
  const overMax = counter ? counter.value > counter.max : false
  const underMin = counter ? counter.value < counter.min : false
  const counterColor = overMax || underMin ? 'text-red-700' : 'text-black/50'
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="font-heading text-xs uppercase tracking-widest text-black">
          {label}
          {required && <span aria-hidden className="text-black/40"> *</span>}
        </span>
        {hint && <span className="text-xs text-black/40">{hint}</span>}
      </div>
      {helper && <p className="mb-2 text-sm text-black/60 leading-relaxed">{helper}</p>}
      {children}
      <div className="mt-1 flex items-baseline justify-between gap-4 min-h-[1.25rem]">
        <span className="text-sm text-red-700">{error ?? ''}</span>
        {counter && (
          <span className={`text-xs tabular-nums ${counterColor}`}>
            {counter.value} / {counter.max} (min {counter.min})
          </span>
        )}
      </div>
    </label>
  )
}
