'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import RequireLead from '@/components/RequireLead'
import { getLead } from '@/lib/lead'

function ThankYouContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug
  const firstName = (getLead()?.name || '').trim().split(/\s+/)[0] || ''
  const r = searchParams.get('r') || ''
  const showDatePicker = r === 'C' || r === 'D'

  const [followUpDate, setFollowUpDate] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!followUpDate) return
    setSubmitting(true)
    const lead = getLead()
    await fetch('/api/quiz-followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: slug,
        email: lead?.email || '',
        name: lead?.name || '',
        phone: lead?.phone || '',
        followUpDate,
        reason: r === 'C' ? 'travel' : 'exploring',
      }),
    }).catch(() => {})
    setSubmitted(true)
    setSubmitting(false)
  }

  // Min date: tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-16">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <p className="font-heading text-xs uppercase tracking-widest text-white/40">FightCraft {locationName}</p>
      </div>

      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center">
        <h1 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-4">
          {firstName ? `Thanks, ${firstName}.` : 'Thanks for completing your profile.'}
        </h1>

        {showDatePicker && !submitted ? (
          <>
            <p className="text-white/60 mb-6">
              {r === 'C'
                ? "No rush — enjoy your trip. When would you like us to follow up so we can get you started?"
                : "Take your time. When would be a good time for us to check back in?"}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: '1 Week', days: 7 },
                { label: '2 Weeks', days: 14 },
                { label: '1 Month', days: 30 },
                { label: '3 Months', days: 90 },
              ].map(opt => {
                const d = new Date()
                d.setDate(d.getDate() + opt.days)
                const val = d.toISOString().split('T')[0]
                return (
                  <button
                    key={opt.label}
                    onClick={() => setFollowUpDate(val)}
                    className={`px-4 py-2 text-sm font-heading uppercase tracking-widest border transition-colors cursor-pointer ${
                      followUpDate === val
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!followUpDate || submitting}
              className="w-full max-w-sm py-4 bg-white text-black text-center font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? '...' : 'Set Reminder'}
            </button>
          </>
        ) : submitted ? (
          <>
            <p className="text-white/60 mb-4">
              We&apos;ll reach out on {new Date(followUpDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Looking forward to it{firstName ? `, ${firstName}` : ''}.
            </p>
            <a
              href={`/${slug}`}
              className="inline-block w-full max-w-sm py-4 bg-white text-black text-center font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              Back to Home
            </a>
          </>
        ) : (
          <>
            <p className="text-white/60 mb-4">
              We&apos;ve got your info and a coach from our {locationName} location will be reaching out to you soon.
            </p>
            <p className="text-white/60 mb-8">
              In the meantime, keep an eye on your phone and email. We&apos;ll be in touch within 24 hours.
            </p>
            <a
              href={`/${slug}`}
              className="inline-block w-full max-w-sm py-4 bg-white text-black text-center font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              Back to Home
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <RequireLead>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <ThankYouContent />
      </Suspense>
    </RequireLead>
  )
}
