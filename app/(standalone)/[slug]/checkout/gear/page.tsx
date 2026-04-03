'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'

const UPSELL_OPTIONS = [
  {
    id: 'handwraps',
    name: 'Hand Wraps',
    price: 12,
    description: 'Your own wraps from day one.',
    pitch: "Loaner wraps work, but they've been on a lot of hands. Your own wraps are more hygienic, fit better, and you'll never have to wait for a pair.",
    items: ['Hand Wraps (pair)', 'Carry pouch'],
    tag: null,
    tagColor: '',
  },
  {
    id: 'premium-gear',
    name: 'Premium Gear Set + FREE T-Shirt',
    price: 199,
    description: 'Top-tier gear plus a FightCraft team shirt on us.',
    pitch: "Walk in on day one looking and feeling like you belong. Premium gloves, wraps, shins, bag, and a FightCraft shirt that says you're part of the team. Only $19 more than basic.",
    items: ['Premium Boxing Gloves (16oz)', 'Hand Wraps (pair)', 'Premium Shin Guards', 'FightCraft Team T-Shirt (FREE)'],
    tag: 'Best Value',
    tagColor: 'bg-green-600',
  },
  {
    id: 'basic-gear',
    name: 'Basic Gear Set',
    price: 180,
    description: 'Everything you need. Built to last 2+ years.',
    pitch: "This is the set most of our members end up buying within the first month anyway. Get it now and skip the awkward loaner phase entirely.",
    items: ['Basic Boxing Gloves', 'Hand Wraps (pair)', 'Shin Guards'],
    tag: null,
    tagColor: '',
  },
]

function UpsellContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const sessionId = searchParams.get('session_id') || ''
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  const [processing, setProcessing] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    const lead = getLead()
    if (lead?.name) setFirstName(lead.name.split(' ')[0])
    track('upsell_viewed', { location: slug, offer: 'gear-upsell' })
  }, [slug])

  async function acceptUpsell(optionId: string) {
    setProcessing(optionId)
    const payload = { sessionId, location: slug, upsellId: optionId }
    console.log('Upsell payload:', payload)
    try {
      const res = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        track('upsell_accepted', { location: slug, offer: optionId })
        router.push(`/${slug}/checkout/accelerator?session_id=${sessionId}&upsell=${optionId}`)
        return
      }
    } catch {}
    setProcessing(null)
  }

  function declineUpsell() {
    track('upsell_declined', { location: slug })
    router.push(`/${slug}/checkout/accelerator?session_id=${sessionId}`)
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Green confirmation bar */}
      <div className="bg-green-600 text-white text-center py-3 px-4">
        <p className="font-heading text-sm uppercase tracking-widest font-bold">
          Payment Confirmed! Your $97 month is locked in.
        </p>
      </div>

      <div className="flex-1 px-4 py-12">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-black/50 uppercase tracking-widest mb-3">One-time offer before you go</p>
            <h1 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-3">
              Start With Your Own Gear{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-black/60 max-w-xl mx-auto">
              Loaner gear is available, but having your own from day one makes a difference. Pick an option below or skip and use loaners.
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {UPSELL_OPTIONS.map(opt => (
              <div key={opt.id} className="border border-black/10 p-6 flex flex-col relative">
                {opt.tag && (
                  <span className={`absolute -top-3 left-4 ${opt.tagColor} text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1`}>
                    {opt.tag}
                  </span>
                )}
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-1 mt-2">{opt.name}</h3>
                <p className="text-2xl font-bold mb-2">${opt.price}</p>
                <p className="text-sm text-black/50 mb-4">{opt.description}</p>
                <p className="text-xs text-black/60 leading-relaxed mb-4 italic">{opt.pitch}</p>

                <div className="space-y-2 mb-6 flex-1">
                  {opt.items.map(item => (
                    <div key={item} className="flex gap-2 items-center">
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => acceptUpsell(opt.id)}
                  disabled={processing !== null}
                  className="w-full py-3 bg-black text-white font-heading text-sm uppercase tracking-widest rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50"
                >
                  {processing === opt.id ? 'Processing...' : `Add for $${opt.price}`}
                </button>
              </div>
            ))}
          </div>

          {/* Decline */}
          <div className="text-center">
            <button
              onClick={declineUpsell}
              className="text-sm text-black/40 hover:text-black/60 transition-colors cursor-pointer underline"
            >
              No thanks, I&apos;ll use loaner gear for now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <div className="w-[40px] h-[40px] bg-black rounded-full flex items-center justify-center mx-auto mb-2">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-5 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-black/40">FightCraft {locationName}</p>
      </div>
    </div>
  )
}

export default function UpsellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <UpsellContent />
    </Suspense>
  )
}
