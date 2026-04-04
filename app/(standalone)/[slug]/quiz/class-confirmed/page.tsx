'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'
import { getLead } from '@/lib/lead'

function ClassConfirmedContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const [firstName, setFirstName] = useState('')
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  const className = searchParams.get('class') || 'Your first class'
  const day = searchParams.get('day') || ''
  const time = searchParams.get('time') || ''

  useEffect(() => {
    const lead = getLead()
    if (lead?.name) setFirstName(lead.name.split(' ')[0])
    track('booking_completed', { location: slug, type: 'class', class_name: className, day, time, booking_type: 'self' })
    metaPixelTrack('Schedule')
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-16">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <p className="font-heading text-xs uppercase tracking-widest text-white/40">FightCraft {locationName}</p>
      </div>

      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center">
        <h1 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">
          You&apos;re Booked{firstName ? `, ${firstName}` : ''}.
        </h1>

        {day && time && (
          <div className="border border-white/10 p-6 mb-8">
            <p className="font-heading text-lg uppercase font-bold tracking-tight mb-1">{className}</p>
            <p className="text-white/60">{day} at {time}</p>
          </div>
        )}

        <div className="space-y-3 mb-10">
          <p className="text-lg text-white/70">A calendar invite was just downloaded.</p>
          <p className="text-lg text-white/70">Add it to your calendar so you don&apos;t forget.</p>
        </div>

        <div className="border border-white/10 p-8 mb-10">
          <h2 className="font-heading text-lg uppercase font-bold tracking-tight mb-4">What to bring</h2>
          <div className="space-y-2 text-white/60">
            <p>Comfortable athletic clothes and water.</p>
            <p>We provide gloves, wraps, and everything else.</p>
            <p>Show up 10 minutes early so we can get you settled.</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-white/50">In the meantime, take a look around.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`/${slug}`} className="px-6 py-3 bg-white/10 text-white text-center font-heading text-sm uppercase tracking-widest hover:bg-white/20 transition-colors">
              Explore FightCraft {locationName}
            </a>
            <a href={`/${slug}/schedule`} className="px-6 py-3 bg-white/10 text-white text-center font-heading text-sm uppercase tracking-widest hover:bg-white/20 transition-colors">
              Full Schedule
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClassConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ClassConfirmedContent />
    </Suspense>
  )
}
