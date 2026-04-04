'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLead, setLead } from '@/lib/lead'
import { setSidCookie } from '@/lib/sid'
import { identify, track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'
import { useRouter } from 'next/navigation'

const LOCATION_DATA: Record<string, { name: string; address: string; city: string; state: string; zip: string; owner: string; phone: string }> = {
  'san-jose': { name: 'San Jose', address: '1825 W. San Carlos St.', city: 'San Jose', state: 'CA', zip: '95128', owner: 'Josh', phone: '(408) 693-5522' },
  'merced': { name: 'Merced', address: '2844 G St', city: 'Merced', state: 'CA', zip: '95430', owner: 'Patrick', phone: '' },
  'brevard': { name: 'Brevard', address: '69 West French Broad', city: 'Brevard', state: 'NC', zip: '28712', owner: 'Ricky', phone: '' },
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
        Claim Your $97 Month
      </span>
      <span className="text-xs text-white/70 uppercase tracking-widest">Only a few spots left</span>
    </button>
  )
}

export default function WebSpecialPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const loc = LOCATION_DATA[slug] || LOCATION_DATA['san-jose']
  const deadline = getDeadline()

  const [pageLoadTime] = useState(() => Date.now())
  const [modalOpen, setModalOpen] = useState(false)
  const [exitTriggered, setExitTriggered] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
    track('page_view', { location: slug, page: 'web-special', lead_source: 'meta' })

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

    const data = { name, email, phone, location: slug, website: '', lead_source: 'meta', _t: pageLoadTime }
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
        track('lead_created', { location: slug, lead_source: 'meta', offer: 'web-special-97' })
        metaPixelTrack('Lead')

        // Create Stripe checkout
        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, phone, location: slug, offer: 'web-special-97' }),
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
          Web Exclusive Offer Expires: {deadline}
        </p>
      </div>

      {/* Hero */}
      <div className="relative bg-neutral-100">
        <div className="absolute top-0 left-0 right-0 h-[65%] bg-black" />
        <div className="relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center pt-6 md:pt-8 pb-4">
            <p className="font-heading text-sm uppercase tracking-widest text-white/50 mb-3">Web Exclusive</p>
            <h1 className="font-heading text-4xl md:text-6xl uppercase font-bold tracking-tight text-white mb-3 leading-[1.1]">
              {firstName ? <><span className="shimmer-once bg-[linear-gradient(90deg,#ef4444_0%,#f97316_40%,#fff_50%,#f97316_60%,#ef4444_100%)] bg-clip-text text-transparent">{firstName}</span>, ready for your first month of unlimited training?</> : <>Your First Month<br />of Unlimited Training</>}
            </h1>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-white/40 line-through text-2xl">$199</span>
              <span className="font-heading text-5xl md:text-6xl font-bold text-red-500">$97</span>
            </div>
            <p className="text-lg text-white/70">
              Every class. Every program. No restrictions.
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
      <div className="bg-white text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            Here&apos;s What $97 Gets You
          </h2>

          <div className="space-y-6 mb-12">
            {[
              { title: 'Unlimited Classes', desc: 'Kickboxing, Muay Thai, BJJ, MMA, Wrestling, Kids. Train as much as you want for 30 days.' },
              { title: 'All Programs Included', desc: "Not just one discipline. You get access to everything we teach. Try them all and find your fit." },
              { title: 'World-Class Coaching', desc: 'Every class is led by experienced coaches who have trained competitive fighters and complete beginners alike.' },
              { title: 'Loaner Gear Available', desc: "We have gloves and gear you can borrow while you get started. Just show up in athletic clothes with water." },
              { title: 'No Contract', desc: "If you love it, stay month-to-month. If not, no hard feelings. Zero pressure." },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p className="text-lg mb-6">{firstName ? `Hey ${firstName}, Coach ${loc.owner} here.` : `A note from Coach ${loc.owner}`}</p>

          <div className="text-left space-y-4 text-white/70 mb-8">
            <p>I started FightCraft because I believe everyone deserves access to real martial arts training.</p>
            <p>Not the watered-down cardio kickboxing at your local gym. Not the intimidating fight club where beginners get thrown to the wolves.</p>
            <p>Something in between. <span className="text-white">Structured. Supportive. Challenging.</span></p>
            <p>The kind of place where a complete beginner can walk in on Monday and feel like they belong by Wednesday.</p>
            <p>{firstName ? `${firstName}, this` : 'This'} $97 offer exists because I want to remove every barrier between you and that first month on the mat. If you give us 30 days, I promise you&apos;ll feel different.</p>
            <p>Not just physically. The way you carry yourself. The way you handle stress. The way you show up.</p>
            <p className="text-white font-medium">{firstName ? `${firstName}, come see for yourself.` : 'Come see for yourself.'}</p>
          </div>

          <p className="text-white/40 text-sm">Coach {loc.owner}, FightCraft {loc.name}</p>
        </div>
      </div>

      {/* Aspirational image */}
      <div className="bg-neutral-100 text-black pt-8 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <img src="/images/home/lian.jpeg" alt="FightCraft member" className="w-full max-w-2xl mx-auto grayscale hover:grayscale-0 transition-all duration-700 mb-6 shadow-xl md:mt-[-224px]" />
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
              "You've been thinking about trying martial arts but haven't pulled the trigger",
              "You're tired of workouts that bore you and want something that actually engages your brain",
              "You want to learn real self-defense, not theory",
              "You're looking for a community of people who push each other to be better",
              "You want to get in the best shape of your life without it feeling like a chore",
              "You've trained before and you're ready to get back into it with better coaching",
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              { q: 'Do I need experience?', a: 'None. Most of our members started as complete beginners. Our coaches meet you where you are.' },
              { q: 'What if I\'m not in shape?', a: 'The training IS how you get in shape. We\'ll modify anything that needs modifying on day one.' },
              { q: 'Do I have to spar?', a: 'Sparring is completely optional and happens on dedicated days. Most beginners don\'t spar for months.' },
              { q: 'What happens after the $97 month?', a: 'You continue month-to-month at the regular rate. No contract. Cancel anytime with 30 days notice.' },
              { q: 'What do I need to bring?', a: 'Athletic clothes and water. We have loaner gear available while you get started.' },
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
            {firstName ? `${firstName}, Your Spot Is Waiting.` : '30 Days. Every Class. $97.'}
          </h2>
          <p className="text-white/60 mb-2">{firstName ? '30 days. Every class. $97.' : 'No contract. No catch. No experience required.'}</p>
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
                <p className="font-heading text-sm uppercase tracking-widest font-bold">Claim Your $97 First Month</p>
              </div>
              <div className="p-8">
                <h2 className="text-xl font-bold mb-2">Almost there!</h2>
                <p className="text-sm text-black/50 mb-6">Complete your info and we&apos;ll get you started.</p>
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
                    {submitting ? 'Sending...' : 'Get Started for $97'}
                  </button>
                </form>
                <p className="text-center text-sm text-black/40 mt-4">No commitment. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
