'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'

export default function WebSpecialSuccessPage() {
  const params = useParams()
  const slug = params.slug as string
  const [firstName, setFirstName] = useState('')
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  useEffect(() => {
    const lead = getLead()
    if (lead?.name) setFirstName(lead.name.split(' ')[0])
    track('purchase_completed', { location: slug, offer: 'web-special-97', amount: 97 })
  }, [slug])

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
          Welcome to FightCraft{firstName ? `, ${firstName}` : ''}.
        </h1>

        <div className="space-y-4 mb-12">
          <p className="text-lg text-white/70">Your $97 first month is confirmed.</p>
          <p className="text-lg text-white/70">You now have unlimited access to every class and every program for 30 days.</p>
        </div>

        <div className="border border-white/10 p-8 mb-12">
          <h2 className="font-heading text-lg uppercase font-bold tracking-tight mb-4">What Happens Next</h2>
          <div className="space-y-3 text-white/60">
            <p>One of our coaches will reach out within a few hours to help you pick your first class.</p>
            <p>In the meantime, check out the schedule and start planning your week.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <a href={`/${slug}/quiz`} className="px-6 py-3 bg-white text-black text-center font-heading text-sm uppercase tracking-widest hover:bg-white/90 transition-colors">
            Take the Quiz &amp; Book a Class
          </a>
          <a href={`/${slug}/schedule`} className="px-6 py-3 bg-white/10 text-white text-center font-heading text-sm uppercase tracking-widest hover:bg-white/20 transition-colors">
            View Schedule
          </a>
        </div>
      </div>
    </div>
  )
}
