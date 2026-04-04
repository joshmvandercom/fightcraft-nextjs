'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'
import AutoPlayVideo from '@/components/AutoPlayVideo'

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

function Check() {
  return (
    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function XMark() {
  return (
    <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

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

  function scrollToOptions() {
    document.getElementById('gear-options')?.scrollIntoView({ behavior: 'smooth' })
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
        <AutoPlayVideo
          src="/images/home/hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 px-6 py-16 max-w-4xl mx-auto w-full">
          <h1 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {firstName ? `${firstName}, start with your own gear.` : 'Start with your own gear.'}
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mb-8">
            Loaner gear works for day one. But having your own from the start means better fit, better hygiene, and one less thing to think about when you walk in.
          </p>
          <button onClick={scrollToOptions} className="px-8 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest font-bold hover:bg-white/90 transition-colors">
            See Options
          </button>
        </div>
      </div>

      {/* Why your own gear */}
      <div className="relative py-16 md:py-24 px-6">
        <div className="absolute inset-0 bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url(/images/home/kickboxing.jpg)' }} />
        <div className="absolute inset-0 bg-black/85" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl md:text-4xl uppercase font-bold tracking-tight text-white mb-12">
            Why Your Own Gear?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Better protection</p>
                <p className="text-sm text-white/50">Fresh padding absorbs impact properly. Loaner gloves have been through hundreds of rounds.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Better fit</p>
                <p className="text-sm text-white/50">Your gloves mold to your hands over time. Loaners fit everyone and nobody.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">More hygienic</p>
                <p className="text-sm text-white/50">Your wraps, your gloves, your sweat. Not someone else&apos;s.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">You show up ready</p>
                <p className="text-sm text-white/50">No waiting for available loaners. No adjusting gear that doesn&apos;t fit right. Just train.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loaner vs own — white section for contrast */}
      <div className="bg-white text-black py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl md:text-4xl uppercase font-bold tracking-tight mb-10">
            Loaner Gear vs Your Own
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-black/10 p-6">
              <p className="font-heading text-sm uppercase tracking-widest font-bold text-black/40 mb-4">Loaner Gear</p>
              <div className="space-y-3">
                <div className="flex gap-3 items-center"><XMark /><span className="text-sm text-black/60">Compressed padding from heavy use</span></div>
                <div className="flex gap-3 items-center"><XMark /><span className="text-sm text-black/60">One-size-fits-all</span></div>
                <div className="flex gap-3 items-center"><XMark /><span className="text-sm text-black/60">Shared by dozens of members</span></div>
                <div className="flex gap-3 items-center"><XMark /><span className="text-sm text-black/60">May not be available every class</span></div>
              </div>
            </div>
            <div className="border-2 border-black p-6">
              <p className="font-heading text-sm uppercase tracking-widest font-bold mb-4">Your Own Gear</p>
              <div className="space-y-3">
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Fresh multi-layer padding</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Fitted to your hands by a coach</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Yours and only yours</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Ready every time you walk in</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div id="gear-options" className="bg-white text-black py-16 px-6 scroll-mt-8">
        <div className="max-w-4xl w-full mx-auto">
          <h2 className="font-heading text-2xl md:text-4xl uppercase font-bold tracking-tight text-center mb-2">
            {firstName ? `${firstName}, pick your setup` : 'Pick Your Setup'}
          </h2>
          <p className="text-center text-black/50 mb-10">One-time add-on. Ships with your membership.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {UPSELL_OPTIONS.map(opt => (
              <div key={opt.id} className={`p-6 flex flex-col relative ${opt.tag ? 'border-2 border-black' : 'border border-black/10'}`}>
                {opt.tag && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${opt.tagColor} text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1 rounded-full whitespace-nowrap`}>
                    {opt.tag}
                  </span>
                )}
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-1 mt-2">{opt.name}</h3>
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
      <div className="bg-black border-t border-white/10 py-6 text-center">
        <div className="w-[40px] h-[40px] bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-5 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-white/30">FightCraft {locationName}</p>
      </div>
    </div>
  )
}

export default function UpsellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <UpsellContent />
    </Suspense>
  )
}
