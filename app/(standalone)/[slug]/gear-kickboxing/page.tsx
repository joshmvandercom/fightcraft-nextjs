'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLead, setLead } from '@/lib/lead'
import { setSidCookie } from '@/lib/sid'
import { identify, track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'
import AutoPlayVideo from '@/components/AutoPlayVideo'

const LOCATION_DATA: Record<string, { name: string; address: string; city: string; state: string; zip: string; owner: string }> = {
  'san-jose': { name: 'San Jose', address: '1825 W. San Carlos St.', city: 'San Jose', state: 'CA', zip: '95128', owner: 'Josh' },
  'merced': { name: 'Merced', address: '2844 G St', city: 'Merced', state: 'CA', zip: '95430', owner: 'Patrick' },
  'brevard': { name: 'Brevard', address: '69 West French Broad', city: 'Brevard', state: 'NC', zip: '28712', owner: 'Ricky' },
}

function Check() {
  return (
    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function XMark() {
  return (
    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function GearPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const loc = LOCATION_DATA[slug] || LOCATION_DATA['san-jose']

  const [processing, setProcessing] = useState<string | null>(null)
  const [name, setName] = useState(() => {
    if (typeof window === 'undefined') return ''
    return getLead()?.name || ''
  })
  const [phone, setPhone] = useState(() => {
    if (typeof window === 'undefined') return ''
    return getLead()?.phone || ''
  })
  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return ''
    return getLead()?.email || ''
  })
  const firstName = name ? name.split(' ')[0] : ''

  const [pageLoadTime] = useState(() => Date.now())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalOffer, setModalOffer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    import('@/lib/lead').then(({ getLeadWithSid, hasSidParam }) => {
      if (!hasSidParam() && name) return
      getLeadWithSid().then(lead => {
        if (lead) {
          setName(lead.name)
          setEmail(lead.email)
          setPhone(lead.phone)
        }
      })
    })
  }, [])

  useEffect(() => {
    track('page_view', { location: slug, page: 'gear' })
  }, [slug])

  async function checkout(offer: string) {
    if (!name || !email || !phone) {
      setModalOffer(offer)
      setModalOpen(true)
      return
    }
    await startCheckout(offer)
  }

  async function startCheckout(offer: string) {
    setProcessing(offer)

    if (!getLead()) {
      const data = { name, email, phone, location: slug, website: '', lead_source: 'gear', _t: pageLoadTime }
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          const json = await res.json()
          if (json.sid) setSidCookie(json.sid)
          setLead({ name, email, phone, location: slug })
          identify(email, { name, location: slug })
        }
      } catch {}
    }

    track('gear_checkout_started', { location: slug, offer })
    metaPixelTrack('InitiateCheckout')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, phone, location: slug, offer, cancelPath: `/${slug}/gear-kickboxing` }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
    } catch {}
    setProcessing(null)
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !phone) return
    setSubmitting(true)
    setModalOpen(false)
    await startCheckout(modalOffer)
    setSubmitting(false)
  }

  function scrollToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col bg-black min-h-screen">

      {/* Hero — full bleed video background */}
      <div className="relative min-h-[70vh] flex items-center overflow-hidden">
        <AutoPlayVideo
          src="/images/home/hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 px-6 py-16 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
            <p className="font-heading text-xs uppercase tracking-widest text-white/40">FightCraft {loc.name}</p>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl uppercase font-bold tracking-tight text-white mb-6 leading-[1.1]">
            {firstName
              ? <><span className="shimmer-once bg-[linear-gradient(90deg,#ef4444_0%,#f97316_40%,#fff_50%,#f97316_60%,#ef4444_100%)] bg-clip-text text-transparent">{firstName}</span>, your gear matters more than you think.</>
              : <>Your gear matters more than you think.</>
            }
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mb-8">
            The right equipment protects you, protects your training partners, and lets you focus on learning instead of fighting your own gloves.
          </p>
          <button onClick={scrollToPricing} className="px-8 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest font-bold hover:bg-white/90 transition-colors">
            See Options
          </button>
        </div>
      </div>

      {/* What you need — fixed background image */}
      <div className="relative py-20 px-6">
        <div className="absolute inset-0 bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url(/images/home/kickboxing.jpg)' }} />
        <div className="absolute inset-0 bg-black/85" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-4">
            What You Actually Need
          </h2>
          <p className="text-white/50 mb-14 max-w-xl">Three pieces of equipment. That&apos;s it. Everything else we provide.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="font-heading text-6xl font-bold text-white/30">1</span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight text-white mb-3 -mt-2">Boxing Gloves</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Gloves protect your hands and your partner&apos;s face. Cheap gloves lose their padding in weeks. A good pair of 16oz gloves lasts 2+ years and absorbs impact the way it&apos;s supposed to. The single most important piece of gear you&apos;ll own.
              </p>
            </div>

            <div>
              <span className="font-heading text-6xl font-bold text-white/30">2</span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight text-white mb-3 -mt-2">Shin Guards</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Every time you check a kick or throw one at a partner, your shins take the hit. Without guards, one bad exchange and you&apos;re sitting out for a week. Good shin guards let you train at full speed without fear.
              </p>
            </div>

            <div>
              <span className="font-heading text-6xl font-bold text-white/30">3</span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight text-white mb-3 -mt-2">Hand Wraps</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Wraps support the small bones in your hands and wrists. Without them, even light bag work can lead to sprains over time. They also keep your gloves dry and extend the life of your gear.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why not Amazon — white bg for contrast */}
      <div className="bg-white text-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-4">
            Why Not Just Buy on Amazon?
          </h2>
          <p className="text-black/50 mb-12">You can find gloves on Amazon for $25. Here&apos;s what you&apos;re actually getting at that price.</p>

          <div className="space-y-6 mb-12">
            <div className="flex gap-4 items-start">
              <XMark />
              <div>
                <p className="font-bold mb-1">Padding breaks down in weeks</p>
                <p className="text-sm text-black/60">Cheap foam compresses fast. After a few weeks of real training, you&apos;re essentially hitting with a leather glove. Your hands hurt. Your partner&apos;s face hurts.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <XMark />
              <div>
                <p className="font-bold mb-1">Wrist support is nonexistent</p>
                <p className="text-sm text-black/60">Budget gloves have velcro straps that loosen mid-round. One bad angle with a loose wrist and you&apos;re dealing with a sprain that takes weeks to heal.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <XMark />
              <div>
                <p className="font-bold mb-1">Sizing is a gamble</p>
                <p className="text-sm text-black/60">Amazon gloves run small, have odd shapes, and leave gaps around the thumb. You can&apos;t try them on before you buy.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <XMark />
              <div>
                <p className="font-bold mb-1">You end up buying twice</p>
                <p className="text-sm text-black/60">Almost every member who starts with cheap gear replaces it within 2 months. You spend more than if you&apos;d bought right the first time.</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-black pl-6 py-2">
            <p className="text-black/70 italic">
              &ldquo;I bought $30 gloves from Amazon before my first class. Three weeks in, my coach told me he could feel my knuckles through the pad. I ordered real ones that night.&rdquo;
            </p>
            <p className="font-heading text-xs uppercase tracking-widest font-bold mt-3 text-black/40">Every beginner, eventually</p>
          </div>
        </div>
      </div>

      {/* What we source — dark, with video */}
      <div className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-6">
                What We Put in Your Hands
              </h2>
              <p className="text-white/50 mb-8">We tested dozens of brands. We chose the gear our own coaches train with every day.</p>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <Check />
                  <div>
                    <p className="font-bold mb-1">Multi-layer foam padding</p>
                    <p className="text-sm text-white/50">Holds its shape through thousands of rounds.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Check />
                  <div>
                    <p className="font-bold mb-1">Reinforced wrist closure</p>
                    <p className="text-sm text-white/50">Locks your wrist in place. No slipping mid-round.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Check />
                  <div>
                    <p className="font-bold mb-1">Built for 2+ years of daily use</p>
                    <p className="text-sm text-white/50">Same gear our coaches use, 6 days a week.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Check />
                  <div>
                    <p className="font-bold mb-1">Fitted by your coach</p>
                    <p className="text-sm text-white/50">No guessing on sizes. No returns. No wasted time.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <AutoPlayVideo
                src="/images/home/reel.mp4"
                className="w-full aspect-[9/16] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coach note */}
      <div className="relative py-20 px-6 overflow-hidden">
        <img src="/images/home/lian2.jpeg" alt="FightCraft training" className="absolute inset-0 w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-white">
          <p className="font-heading text-sm uppercase tracking-widest text-white/40 mb-4">From Coach {loc.owner}</p>
          <div className="space-y-4 text-lg text-white/70">
            <p>I&apos;ve been coaching for over a decade. The number one thing that slows beginners down isn&apos;t fitness or talent. <span className="text-white font-medium">It&apos;s gear problems.</span></p>
            <p>Bad gloves lead to sore hands. Sore hands lead to skipped classes. Skipped classes lead to quitting.</p>
            <p>The right gear doesn&apos;t make you a better fighter. But it removes the excuse. You show up, your gear works, you focus on learning.</p>
            <p className="text-white font-bold">{firstName ? `${firstName}, that's the whole point.` : "That's the whole point."}</p>
          </div>
        </div>
      </div>

      {/* Pricing — white bg for clarity */}
      <div id="pricing" className="bg-white text-black py-20 px-6 scroll-mt-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-center mb-2">
            {firstName ? `${firstName}, Pick Your Path` : 'Pick Your Path'}
          </h2>
          <p className="text-center text-black/50 mb-12">Member-only pricing. Available today only.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Gear Package */}
            <div className="border border-black/10 p-8 flex flex-col">
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-6">Gear Package</h3>

              <div className="mb-4">
                <span className="text-black/30 line-through text-lg">$289</span>
                <p className="font-heading text-5xl font-bold tracking-tight">$249<span className="text-lg align-top">*</span></p>
              </div>

              <div className="bg-neutral-100 text-center py-2 mb-8">
                <p className="font-heading text-sm uppercase font-bold tracking-wider text-black/60">14% Savings</p>
              </div>

              <div className="space-y-4 flex-1 mb-8">
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">Gloves <span className="text-black/40">($129 value)</span></span>
                </div>
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">Shins <span className="text-black/40">($137 value)</span></span>
                </div>
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">Handwraps <span className="text-black/40">($20 value)</span></span>
                </div>
              </div>

              <button
                onClick={() => checkout('gear-package-249')}
                disabled={processing !== null}
                className="w-full py-4 bg-black text-white font-heading text-sm uppercase tracking-widest font-bold hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {processing === 'gear-package-249' ? 'Processing...' : 'Get Gear for $249'}
              </button>
            </div>

            {/* Six Week Beginner Program */}
            <div className="border-2 border-black p-8 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-green-600 text-white font-heading text-xs uppercase tracking-widest font-bold px-5 py-1.5 rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              </div>

              <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-6 mt-2">Six Week Beginner Program</h3>

              <div className="mb-4">
                <span className="text-black/30 line-through text-lg">$1,678</span>
                <p className="font-heading text-5xl font-bold tracking-tight text-green-700">$499<span className="text-lg align-top">*</span></p>
              </div>

              <div className="bg-black text-white text-center py-2 mb-8">
                <p className="font-heading text-sm uppercase font-bold tracking-wider">70% Off Instant Savings</p>
              </div>

              <p className="text-sm font-bold mb-4">Everything you need for 6 weeks:</p>

              <div className="space-y-4 flex-1 mb-8">
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">All gear included <span className="text-black/40">($289 value)</span></span>
                </div>
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">Yellow Belt Roadmap Accelerator <span className="text-black/40">($179 value)</span></span>
                </div>
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">Accountability Coach <span className="text-black/40">($25/wk, $125 value)</span></span>
                </div>
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">Meal Plan <span className="text-black/40">($97 value)</span></span>
                </div>
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">Online Academy <span className="text-black/40">($288 value)</span></span>
                </div>
                <div className="flex gap-3 items-center">
                  <Check />
                  <span className="text-sm">14 Semi Private Labs <span className="text-black/40">($50/each, $700 value)</span></span>
                </div>
              </div>

              <button
                onClick={() => checkout('beginner-program-499')}
                disabled={processing !== null}
                className="w-full py-4 bg-black text-white font-heading text-sm uppercase tracking-widest font-bold hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {processing === 'beginner-program-499' ? 'Processing...' : 'Get the Program for $499'}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-black/40">* Discount applies to <strong>today</strong> only</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-12">
            Common Questions
          </h2>

          <div className="space-y-8">
            {[
              { q: 'Can I just use loaner gear?', a: 'For your first class, absolutely. But loaner gloves have been on hundreds of hands and the padding is compressed. Most members want their own gear by week two.' },
              { q: 'What size gloves do I need?', a: '16oz for training. That\'s what we include. Your coach will verify the fit when you pick them up.' },
              { q: 'What\'s the Six Week Beginner Program?', a: 'It\'s everything you need to go from zero to confident in six weeks. Gear, a structured curriculum, an accountability coach checking in weekly, a meal plan, access to our online academy, and 14 semi-private lab sessions with a coach.' },
              { q: 'Can I buy gear somewhere else?', a: 'Of course. Just make sure you get 16oz gloves with proper wrist support and full-length shin guards. Avoid anything under $80 for gloves or $100 for shins.' },
              { q: 'What if I already have gear?', a: 'Bring it in and your coach will check it. If it\'s good to go, you\'re set.' },
            ].map(item => (
              <div key={item.q}>
                <p className="font-bold text-lg mb-2">{item.q}</p>
                <p className="text-white/50">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-white/10 py-8 px-6 text-center">
        <div className="w-[50px] h-[50px] bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-6 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-white/30">Copyright {new Date().getFullYear()}, FightCraft Martial Arts</p>
        <p className="text-[10px] text-white/30">{loc.address}, {loc.city}, {loc.state} {loc.zip}</p>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden">
              <div className="p-8">
                <h2 className="text-xl font-bold mb-2">Almost there!</h2>
                <p className="text-sm text-black/50 mb-6">We just need your info to complete the order.</p>
                <form onSubmit={handleModalSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Phone <span className="text-red-500">*</span></label>
                    <input type="tel" placeholder="Your Mobile Phone" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input type="email" placeholder="Your Best Email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-4 bg-black text-white font-heading text-lg font-bold uppercase tracking-widest rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50">
                    {submitting ? 'Processing...' : 'Continue to Checkout'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
