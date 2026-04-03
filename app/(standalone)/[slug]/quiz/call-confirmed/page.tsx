'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'

export default function CallConfirmedPage() {
  const params = useParams()
  const slug = params.slug as string
  const [firstName, setFirstName] = useState('')
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  useEffect(() => {
    const lead = getLead()
    if (lead?.name) {
      setFirstName(lead.name.split(' ')[0])
    }
    track('booking_completed', { location: slug, booking_type: 'self', type: 'call' })
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
          You&apos;re All Set{firstName ? `, ${firstName}` : ''}.
        </h1>

        <div className="space-y-4 mb-12">
          <p className="text-lg text-white/70">Your orientation call is booked.</p>
          <p className="text-lg text-white/70">Check your email for the confirmation and calendar invite.</p>
        </div>

        <div className="border border-white/10 p-8 mb-12">
          <h2 className="font-heading text-lg uppercase font-bold tracking-tight mb-4">Before your call</h2>
          <div className="space-y-3 text-white/60">
            <p>Think about what you want to get out of training. Fitness? Self-defense? Competition? Just something new?</p>
            <p>Have your schedule handy so we can find the best class times for you.</p>
            <p>That&apos;s it. We&apos;ll handle the rest.</p>
          </div>
        </div>

        <div className="space-y-3 mb-12">
          <p className="text-white/50">In the meantime, take a look around.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`/${slug}`} className="px-6 py-3 bg-white/10 text-white text-center font-heading text-sm uppercase tracking-widest hover:bg-white/20 transition-colors">
              Explore FightCraft {locationName}
            </a>
            <a href={`/${slug}/schedule`} className="px-6 py-3 bg-white/10 text-white text-center font-heading text-sm uppercase tracking-widest hover:bg-white/20 transition-colors">
              View Schedule
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
