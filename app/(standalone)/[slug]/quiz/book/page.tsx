'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import RequireLead from '@/components/RequireLead'
import { getLead } from '@/lib/lead'

// GHL calendar IDs per location per program
// Replace with actual calendar IDs as you create them
const CALENDAR_IDS: Record<string, Record<string, string>> = {
  'san-jose': {
    kickboxing: 'NPvYU17XVvlCaXGeMX6K',
    muay_thai: 'NPvYU17XVvlCaXGeMX6K',
    brazilian_jiu_jitsu: '2a7iI1uaxpFmlp8DbSba',
    no_gi_jiu_jitsu: 'OpblHcWIEyGshCL02Psd',
    kids_martial_arts: 'PRSasCkelkKCCZYvB2H3',
    mixed_martial_arts: '75KJ4CeR5rFOji88Z5L7',
    wrestling: 'jVUiSJvvlyT4x1jchvwe',
    default: 'NPvYU17XVvlCaXGeMX6K',
  },
  'merced': {},
  'brevard': {},
}

const PROGRAM_LABELS: Record<string, string> = {
  kickboxing: 'Kickboxing',
  muay_thai: 'Muay Thai',
  brazilian_jiu_jitsu: 'Brazilian Jiu Jitsu',
  no_gi_jiu_jitsu: 'No Gi Jiu Jitsu',
  kids_martial_arts: 'Kids & Teens',
  mixed_martial_arts: 'Mixed Martial Arts',
  wrestling: 'Wrestling',
  explore: 'Your First Class',
}

function BookContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const programParam = searchParams.get('p') || 'default'
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug
  const programLabel = PROGRAM_LABELS[programParam] || 'Your First Class'

  const [iframeSrc, setIframeSrc] = useState('')

  useEffect(() => {
    const lead = getLead()
    const locationCalendars = CALENDAR_IDS[slug] || CALENDAR_IDS['san-jose']
    const calendarId = locationCalendars[programParam] || locationCalendars['default'] || 'XbQDkmoCiq852ukwzNSR'

    // Build the page URL with lead data for GHL pre-fill
    const currentParams = new URLSearchParams(window.location.search)
    if (lead && !currentParams.has('email')) {
      const nameParts = (lead.name || '').trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const newParams = new URLSearchParams(currentParams)
      if (firstName) newParams.set('first_name', firstName)
      if (lastName) newParams.set('last_name', lastName)
      if (lead.email) newParams.set('email', lead.email)
      if (lead.phone) newParams.set('phone', lead.phone)

      window.location.replace(`${window.location.pathname}?${newParams.toString()}`)
      return
    }

    setIframeSrc(`https://api.leadconnectorhq.com/widget/booking/${calendarId}`)

    // Load GHL embed script
    const script = document.createElement('script')
    script.src = 'https://api.leadconnectorhq.com/js/form_embed.js'
    script.type = 'text/javascript'
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [slug, programParam])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-12">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <p className="font-heading text-xs uppercase tracking-widest text-white/40">FightCraft {locationName}</p>
      </div>

      <div className="max-w-xl w-full mx-auto flex-1">
        <p className="text-white/50 text-sm mb-3">Thank You! Final Step</p>
        <h1 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-2">
          Schedule Your <span className="text-red-500">FREE PASS</span> Below
        </h1>
        <p className="text-white/50 italic mb-8">
          (This is the most important step)
        </p>

        {iframeSrc ? (
          <div className="bg-white rounded-lg overflow-hidden mb-8">
            <iframe
              src={iframeSrc}
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '600px' }}
              scrolling="no"
            />
          </div>
        ) : (
          <div className="border border-white/20 p-12 text-center mb-8">
            <h2 className="font-heading text-2xl uppercase font-bold tracking-tight mb-4">You&apos;re In!</h2>
            <p className="text-white/60 mb-3">Our team at FightCraft {locationName} will reach out within 24 hours to get you scheduled.</p>
            <p className="text-white/50 text-sm">Keep an eye on your phone and email.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <RequireLead>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <BookContent />
      </Suspense>
    </RequireLead>
  )
}
