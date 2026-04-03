'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import RequireLead from '@/components/RequireLead'
import { getLead } from '@/lib/lead'

const BOOKING_IDS: Record<string, string> = {
  'san-jose': 'XbQDkmoCiq852ukwzNSR',
  'merced': 'XbQDkmoCiq852ukwzNSR',
  'brevard': 'XbQDkmoCiq852ukwzNSR',
}

function CallContent() {
  const params = useParams()
  const slug = params.slug as string
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug
  const [iframeSrc, setIframeSrc] = useState('')

  useEffect(() => {
    const lead = getLead()
    const currentParams = new URLSearchParams(window.location.search)

    // If lead exists but params aren't on the URL yet, redirect to add them
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

    const bookingId = BOOKING_IDS[slug] || BOOKING_IDS['san-jose']
    setIframeSrc(`https://api.leadconnectorhq.com/widget/booking/${bookingId}`)

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
  }, [slug])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-12">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <p className="font-heading text-xs uppercase tracking-widest text-white/40">FightCraft {locationName}</p>
      </div>

      <div className="max-w-xl w-full mx-auto flex-1">
        <h1 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-4">
          Book Your FREE Orientation Call
        </h1>
        <p className="text-white/60 mb-3">
          This is the fun part.
        </p>
        <p className="text-white/50 mb-8">
          One of our coaches will walk you through everything. Your goals, your schedule, the right program for you. By the end of the call you&apos;ll have a clear plan and know exactly what your first day looks like.
        </p>

        {/* GHL Booking Widget */}
        {iframeSrc && (
          <div className="bg-white rounded-lg overflow-hidden mb-8">
            <iframe
              src={iframeSrc}
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '600px' }}
              scrolling="no"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function CallPage() {
  return (
    <RequireLead>
      <CallContent />
    </RequireLead>
  )
}
