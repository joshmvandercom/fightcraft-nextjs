'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'

const GI_OPTIONS = [
  {
    id: 'gi-white',
    name: 'White Gi',
    price: 129,
    image: '/images/home/gi-white.jpg',
    description: 'The classic. Required for most competitions.',
    pitch: "White is the traditional gi color and accepted everywhere — tournaments, open mats, drop-ins. If you only own one gi, make it white.",
    items: ['Gi Jacket (Pearl Weave)', 'Gi Pants (Ripstop)', 'White Belt'],
  },
  {
    id: 'gi-black',
    name: 'Black Gi',
    price: 129,
    image: '/images/home/gi-black.jpg',
    description: 'Clean look. Hides stains better.',
    pitch: "Black gis look sharp, stay cleaner-looking longer, and are accepted at most gyms and many tournaments. The go-to for people who want something a little different.",
    items: ['Gi Jacket (Pearl Weave)', 'Gi Pants (Ripstop)', 'White Belt'],
  },
]

function Check() {
  return (
    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function GearBJJContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const sessionId = searchParams.get('session_id') || ''
  const offer = searchParams.get('offer') || ''
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  const [processing, setProcessing] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    const lead = getLead()
    if (lead?.name) setFirstName(lead.name.split(' ')[0])
    track('upsell_viewed', { location: slug, offer: 'gear-bjj-upsell' })
  }, [slug])

  async function acceptUpsell(optionId: string) {
    setProcessing(optionId)
    const payload = { sessionId, location: slug, upsellId: optionId }
    try {
      const res = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        track('upsell_accepted', { location: slug, offer: optionId })
        metaPixelTrack('Purchase', { currency: 'USD', value: GI_OPTIONS.find(o => o.id === optionId)!.price, content_name: optionId })
        router.push(`/${slug}/checkout/accelerator?session_id=${sessionId}&gear=${optionId}&offer=${offer}`)
        return
      }
    } catch {}
    setProcessing(null)
  }

  function declineUpsell() {
    track('upsell_declined', { location: slug, offer: 'gear-bjj-upsell' })
    router.push(`/${slug}/checkout/accelerator?session_id=${sessionId}&offer=${offer}`)
  }

  function scrollToOptions() {
    document.getElementById('gi-options')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col bg-black min-h-screen">
      {/* Confirmation bar */}
      <div className="bg-green-600 text-white text-center py-3 px-4">
        <p className="font-heading text-sm uppercase tracking-widest font-bold">
          Payment Confirmed!
        </p>
      </div>

      {/* Hero */}
      <div className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/home/bjj-callout.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 px-6 py-16 max-w-4xl mx-auto w-full">
          <h1 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {firstName ? `${firstName}, grab your gi.` : 'Grab your gi.'}
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mb-8">
            You&apos;ll need a gi for class. Get yours now and show up ready to train on day one.
          </p>
          <button onClick={scrollToOptions} className="px-8 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest font-bold hover:bg-white/90 transition-colors">
            Pick Your Gi
          </button>
        </div>
      </div>

      {/* Why your own gi */}
      <div className="bg-white text-black py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl md:text-4xl uppercase font-bold tracking-tight mb-10">
            Why Get Your Gi Now?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold mb-1">You need one for Gi classes</p>
                <p className="text-sm text-black/50">We have loaners, but they&apos;re limited and well-worn. Your own gi fits better, feels better, and is more hygienic.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold mb-1">Sized to you</p>
                <p className="text-sm text-black/50">Let our coaches know your height and weight when you come in — we&apos;ll make sure you get the right fit.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold mb-1">Built to last</p>
                <p className="text-sm text-black/50">Pearl weave jacket, ripstop pants. This gi will hold up through years of training.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold mb-1">One less thing to think about</p>
                <p className="text-sm text-black/50">Show up to your first class with everything you need. No scrambling, no waiting for a loaner.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div id="gi-options" className="bg-neutral-100 text-black py-16 px-6 scroll-mt-8">
        <div className="max-w-3xl w-full mx-auto">
          <h2 className="font-heading text-2xl md:text-4xl uppercase font-bold tracking-tight text-center mb-2">
            {firstName ? `${firstName}, pick your gi` : 'Pick Your Gi'}
          </h2>
          <p className="text-center text-black/50 mb-10">Both are $129. Same quality. Just pick your color.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {GI_OPTIONS.map(opt => (
              <div key={opt.id} className="bg-white border border-black/10 flex flex-col overflow-hidden">
                <div className="bg-neutral-50 p-6 flex items-center justify-center">
                  <img
                    src={opt.image}
                    alt={opt.name}
                    className="w-full max-w-[280px] object-contain"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-1">{opt.name}</h3>
                  <p className="font-heading text-3xl font-bold mb-2">${opt.price}</p>
                  <p className="text-sm text-black/50 mb-3">{opt.description}</p>
                  <p className="text-xs text-black/50 leading-relaxed mb-4 italic">{opt.pitch}</p>

                  <div className="space-y-2 mb-6 flex-1">
                    {opt.items.map(item => (
                      <div key={item} className="flex gap-2 items-center">
                        <Check />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => acceptUpsell(opt.id)}
                    disabled={processing !== null}
                    className="w-full py-3 bg-black text-white font-heading text-sm uppercase tracking-widest font-bold hover:bg-black/80 transition-colors disabled:opacity-50"
                  >
                    {processing === opt.id ? 'Processing...' : `Get ${opt.name} — $${opt.price}`}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Decline */}
          <div className="text-center">
            <button
              onClick={declineUpsell}
              className="text-sm text-black/40 hover:text-black/60 transition-colors cursor-pointer underline"
            >
              No thanks, I&apos;ll get a gi later
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-white/10 py-6 text-center">
        <div className="w-[40px] h-[40px] bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-5 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-white/30">FightCraft {locationName}</p>
      </div>
    </div>
  )
}

export default function GearBJJPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <GearBJJContent />
    </Suspense>
  )
}
