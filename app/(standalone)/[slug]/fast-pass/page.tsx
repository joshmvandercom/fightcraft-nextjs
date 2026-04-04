'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { setLead } from '@/lib/lead'
import { setSidCookie } from '@/lib/sid'
import { identify, track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'
import { useRouter } from 'next/navigation'

const LOCATION_DATA: Record<string, { name: string; address: string; city: string; state: string; zip: string; owner: string }> = {
  'san-jose': { name: 'San Jose', address: '1825 W. San Carlos St.', city: 'San Jose', state: 'CA', zip: '95128', owner: 'Josh' },
  'merced': { name: 'Merced', address: '2844 G St', city: 'Merced', state: 'CA', zip: '95430', owner: 'Patrick' },
  'brevard': { name: 'Brevard', address: '69 West French Broad', city: 'Brevard', state: 'NC', zip: '28712', owner: 'Ricky' },
}

function getDeadline(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${days[tomorrow.getDay()]}, ${months[tomorrow.getMonth()]} ${tomorrow.getDate()}`
}

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function CTAButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-lg mx-auto py-4 px-8 bg-black text-white rounded-xl hover:bg-black/80 transition-colors cursor-pointer block"
    >
      <span className="font-heading text-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
        Claim Your 90-Day Pass
      </span>
      <span className="text-xs text-white/60 uppercase tracking-widest">Limited availability</span>
    </button>
  )
}

export default function FastPassPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const loc = LOCATION_DATA[slug] || LOCATION_DATA['san-jose']
  const deadline = getDeadline()

  const [modalOpen, setModalOpen] = useState(false)
  const [exitTriggered, setExitTriggered] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    track('page_view', { location: slug, page: 'fast-pass', lead_source: 'meta' })

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitTriggered) {
        setExitTriggered(true)
        if (!sessionStorage.getItem('lead_modal_dismissed')) {
          setModalOpen(true)
        }
      }
    }
    document.addEventListener('mouseout', handler)
    return () => document.removeEventListener('mouseout', handler)
  }, [exitTriggered, slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !phone || !email) return
    setSubmitting(true)

    const data = { name, email, phone, location: slug, website: '', lead_source: 'meta' }
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
        track('lead_created', { location: slug, lead_source: 'meta', offer: 'fast-pass-499' })
        metaPixelTrack('Lead')

        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, phone, location: slug, offer: 'fast-pass-499', cancelPath: `/${slug}/fast-pass` }),
        })
        const checkoutData = await checkoutRes.json()
        if (checkoutData.url) {
          window.location.href = checkoutData.url
          return
        }
      }
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Urgency banner */}
      <div className="bg-red-500 text-white text-center py-2 px-4">
        <p className="font-heading text-xs md:text-sm uppercase tracking-widest font-bold">
          Only 3 of 10 Fast Passes Remaining
        </p>
      </div>

      {/* Hero */}
      <div className="relative bg-neutral-100">
        <div className="absolute top-0 left-0 right-0 h-[65%] bg-black" />
        <div className="relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center pt-6 md:pt-8 pb-4">
            <p className="font-heading text-sm uppercase tracking-widest text-white/50 mb-3">90-Day Fast Pass</p>
            <h1 className="font-heading text-4xl md:text-6xl uppercase font-bold tracking-tight text-white mb-3 leading-[1.1]">
              Save $307 on Your<br />Membership
            </h1>
            <p className="text-xl text-white/70">
              with our 90-Day Fast Pass. Pay once. Train everything.
            </p>
          </div>

          <div className="flex justify-center">
            <img src="/images/home/kickboxing.jpg" alt="FightCraft Training" className="w-full max-w-xl shadow-xl" />
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div className="bg-neutral-100 py-6 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <Stars />
          <p className="text-sm text-black/60">
            Rated <strong>4.9</strong> out of 5 from <strong>139+ reviews</strong> on Google
          </p>
        </div>
      </div>

      {/* What you get */}
      <div className="bg-neutral-100 text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            What&apos;s Included
          </h2>

          <div className="space-y-6 mb-12">
            {[
              { title: '90 Days of Unlimited Access', desc: 'Every class, every program, every day. Kickboxing, Muay Thai, BJJ, MMA, Wrestling, Kids. All of it.' },
              { title: 'Zero Distractions', desc: 'One payment. Done. No recurring charges for 3 months. Just focus on training.' },
              { title: 'All Coaching Included', desc: 'World-class instruction in every session. Our coaches have trained competitive fighters and complete beginners.' },
              { title: 'Loaner Gear Available', desc: 'We have gloves and gear you can borrow while you get started. Just show up in athletic clothes with water.' },
              { title: 'No Contract After', desc: 'When your 90 days are up, continue month-to-month or walk away. Zero pressure.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-black/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <CTAButton onClick={() => setModalOpen(true)} />
        </div>
      </div>

      {/* Coach section */}
      <div className="bg-black text-white py-16 md:pb-[calc(4rem+224px)] px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-6">A note from Coach {loc.owner}</p>

          <div className="text-left space-y-4 text-white/70 mb-8">
            <p>The 90-Day Fast Pass exists for one reason: <span className="text-white">commitment creates results.</span></p>
            <p>I&apos;ve watched hundreds of people start training. The ones who transform aren&apos;t the most talented. They&apos;re the ones who gave it 90 days without looking back.</p>
            <p>Three months is the threshold. It&apos;s where technique becomes instinct. Where the gym stops being a place you go and starts being part of who you are.</p>
            <p>This price exists to make that commitment a no-brainer. You&apos;re saving $307 and getting three full months to prove to yourself what you&apos;re capable of.</p>
            <p className="text-white font-medium">Lock it in. Show up. Everything else takes care of itself.</p>
          </div>

          <p className="text-white/40 text-sm">Coach {loc.owner}, FightCraft {loc.name}</p>
        </div>
      </div>

      {/* Aspirational image */}
      <div className="bg-neutral-100 text-black pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="md:mt-[-224px]">
            <img src="/images/home/lian.jpeg" alt="FightCraft member" className="w-full max-w-2xl mx-auto grayscale hover:grayscale-0 transition-all duration-700 mb-6 shadow-xl" />
          </div>
          <p className="font-heading text-xs uppercase tracking-widest text-black/40 mb-6">Meet Your Alter Ego</p>
          <p className="font-heading text-2xl md:text-3xl uppercase font-bold tracking-tight mb-3">
            Discover What You&apos;re Capable Of
          </p>
          <p className="text-sm text-black/50">Most of our members had no idea what was possible until they took the first step. Some even discovered they were a champion. What will you discover?</p>
        </div>
      </div>

      {/* Who this is for */}
      <div className="bg-white text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            This Is For You If
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              "You're done with half-measures and ready to commit to real change",
              "You want to save money by paying upfront instead of month-to-month",
              "You know that 90 days of consistency will change your life",
              "You've been thinking about this for too long and you're ready to just do it",
              "You want access to everything without restrictions",
              "You're the kind of person who goes all in when you decide to do something",
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-black/70">{item}</p>
              </div>
            ))}
          </div>

          <CTAButton onClick={() => setModalOpen(true)} />
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-neutral-100 text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            Don&apos;t Take Our Word For It
          </h2>

          <div className="space-y-6 mb-12">
            {[
              { name: 'Sarah B.', quote: "As an introvert who works a high stress medical career I value and look forward to my time at FightCraft. It has by now become a lifestyle. I am in the best shape I've ever been." },
              { name: 'Zach H.', quote: "From the moment you walk in the door you know there is something special about this place. The coaches are extremely knowledgeable, very friendly, and passionate about wanting you to learn the craft correctly." },
              { name: 'Dakota S.', quote: "The environment is very laid back and the people are great. I had no prior striking experience before my first class but that was no problem at all. Coach Josh broke everything down so it was easy to pick up quickly." },
            ].map(t => (
              <div key={t.name} className="bg-white p-6 border border-black/10">
                <Stars />
                <p className="text-sm text-black/60 leading-relaxed mt-3 mb-3">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-heading text-xs uppercase tracking-widest font-bold">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            Common Questions
          </h2>

          <div className="space-y-6 mb-12">
            {[
              { q: 'What happens after 90 days?', a: 'You continue month-to-month at the regular rate. No contract. Or you can walk away. Your call.' },
              { q: 'Can I really attend any class?', a: 'Every single one. Kickboxing, Muay Thai, BJJ, MMA, Wrestling, Kids. Unlimited. No restrictions.' },
              { q: 'Do I need experience?', a: 'None. Most members start as complete beginners. Our coaches meet you exactly where you are.' },
              { q: 'Is this refundable?', a: 'The 90-Day Fast Pass is a commitment. That is the point. No refunds, but you can freeze for injury or travel.' },
              { q: 'Can I share it with someone?', a: 'The pass is for one person. But check out our buddy pass if you want to bring a friend.' },
            ].map(item => (
              <div key={item.q}>
                <p className="font-bold mb-1">{item.q}</p>
                <p className="text-sm text-black/60">{item.a}</p>
              </div>
            ))}
          </div>

          <CTAButton onClick={() => setModalOpen(true)} />
        </div>
      </div>

      {/* Final push */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-4">
            90 Days. Every Class. Unlimited.
          </h2>
          <p className="text-white/60 mb-2">One payment. Full access. No contract after.</p>
          <p className="text-white/50 text-sm mb-8">This offer is only available online and expires {deadline}.</p>

          <CTAButton onClick={() => setModalOpen(true)} />

          <p className="text-white/30 text-xs mt-6">FightCraft {loc.name} &middot; {loc.address}, {loc.city}, {loc.state} {loc.zip}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white py-8 px-4 text-center">
        <div className="w-[50px] h-[50px] bg-black rounded-full flex items-center justify-center mx-auto mb-3">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-6 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-black/40">Copyright {new Date().getFullYear()}, FightCraft Martial Arts</p>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); sessionStorage.setItem('lead_modal_dismissed', '1') }} />
          <div className="relative w-full max-w-md">
            <button
              onClick={(e) => { e.stopPropagation(); setModalOpen(false); sessionStorage.setItem('lead_modal_dismissed', '1') }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-red-500 text-white text-center py-3">
                <p className="font-heading text-sm uppercase tracking-widest font-bold">Only 3 of 10 Fast Passes Remaining</p>
              </div>
              <div className="p-8">
                <h2 className="text-xl font-bold mb-2">Lock in your spot</h2>
                <p className="text-sm text-black/50 mb-6">Complete your info to proceed to checkout.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
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
                    {submitting ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </form>
                <p className="text-center text-sm text-black/40 mt-4">Secure checkout powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
