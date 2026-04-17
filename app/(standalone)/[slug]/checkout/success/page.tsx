'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'

const OFFER_VALUES: Record<string, number> = {
  'web-special-97': 97,
  'fast-pass-499': 499,
  'early-riser-33': 33,
  'start-33': 33,
  'start-bjj-33': 33,
  'gear-package-249': 249,
  'beginner-program-499': 499,
}

function SuccessContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const offer = searchParams.get('offer') || ''
  const [firstName, setFirstName] = useState('')
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  useEffect(() => {
    const lead = getLead()
    if (lead?.name) setFirstName(lead.name.split(' ')[0])
    const value = OFFER_VALUES[offer] || 33
    track('purchase_completed', { location: slug, offer })
    metaPixelTrack('Purchase', { currency: 'USD', value, content_name: offer || 'membership' })
  }, [slug, offer])

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
          {firstName ? `Let's go, ${firstName}.` : "Let's go."}
        </h1>

        <div className="space-y-4 mb-12">
          <p className="text-lg text-white/70">You're in. Welcome to FightCraft.</p>
          <p className="text-lg text-white/70">A team member will reach out shortly to help you get started.</p>
        </div>

        <div className="border border-white/10 p-8 mb-12">
          <h2 className="font-heading text-lg uppercase font-bold tracking-tight mb-4">What to Expect</h2>
          <div className="space-y-3 text-white/60">
            <p>One of our coaches will reach out within a few hours to welcome you and answer any questions.</p>
            <p>We'll help you pick your first class and make sure you feel ready before you walk in.</p>
            <p>All you need is athletic clothes and water. We handle the rest.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <a href={`/${slug}`} className="px-6 py-3 bg-white text-black text-center font-heading text-sm uppercase tracking-widest hover:bg-white/90 transition-colors">
            Explore FightCraft {locationName}
          </a>
          <a href={`/${slug}/schedule`} className="px-6 py-3 bg-white/10 text-white text-center font-heading text-sm uppercase tracking-widest hover:bg-white/20 transition-colors">
            View Schedule
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SuccessContent />
    </Suspense>
  )
}
