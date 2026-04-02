'use client'

import { useParams } from 'next/navigation'
import RequireLead from '@/components/RequireLead'

function CallContent() {
  const params = useParams()
  const slug = params.slug as string
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  // TODO: Replace with actual GHL/Calendly booking embed per location
  const bookingLinks: Record<string, string> = {
    'san-jose': '#',
    'merced': '#',
    'brevard': '#',
  }

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
          Book Your FREE Orientation Call
        </h1>
        <p className="text-white/60 mb-3">
          This is the fun part.
        </p>
        <p className="text-white/50 mb-12">
          One of our coaches will walk you through everything. Your goals, your schedule, the right program for you. By the end of the call you&apos;ll have a clear plan and know exactly what your first day looks like.
        </p>

        {/* Placeholder for booking embed */}
        <div className="border border-white/20 p-12 text-center mb-12">
          <p className="text-white/40 mb-6">Booking calendar will be embedded here</p>
          <a
            href={bookingLinks[slug] || '#'}
            className="inline-block w-full max-w-sm py-4 bg-white text-black text-center font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
          >
            Book My Orientation Call
          </a>
        </div>

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
