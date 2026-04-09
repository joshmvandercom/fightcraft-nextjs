'use client'

import { useParams } from 'next/navigation'
import RequireLead from '@/components/RequireLead'
import { getLead } from '@/lib/lead'

function ThankYouContent() {
  const params = useParams()
  const slug = params.slug as string
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug
  const firstName = (getLead()?.name || '').trim().split(/\s+/)[0] || ''

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
        <p className="text-white/60 mb-4">
          We've got your info and a coach from our {locationName} location will be reaching out to you soon.
        </p>
        <p className="text-white/60 mb-8">
          In the meantime, keep an eye on your phone and email. We'll be in touch within 24 hours.
        </p>
        <a
          href={`/${slug}`}
          className="inline-block w-full max-w-sm py-4 bg-white text-black text-center font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <RequireLead>
      <ThankYouContent />
    </RequireLead>
  )
}
