'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLead, setLead } from '@/lib/lead'
import { setSidCookie } from '@/lib/sid'
import { identify, track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'
import { useRouter } from 'next/navigation'

const LOCATION_DATA: Record<string, { name: string; address: string; city: string; state: string; zip: string; owner: string }> = {
  'san-jose': { name: 'San Jose', address: '1825 W. San Carlos St.', city: 'San Jose', state: 'CA', zip: '95128', owner: 'Josh' },
  'merced': { name: 'Merced', address: '2844 G St', city: 'Merced', state: 'CA', zip: '95430', owner: 'Patrick' },
  'brevard': { name: 'Brevard', address: '69 West French Broad', city: 'Brevard', state: 'NC', zip: '28712', owner: 'Ricky' },
}

const MORNING_SCHEDULE = [
  { day: 'Monday', classes: ['6am Jiu-Jitsu (Gi)', '8am Kickboxing Fundamentals', '9am Wall Work for MMA', '10am Striking for MMA', '11am Kickboxing Fundamentals'] },
  { day: 'Tuesday', classes: ['6am Jiu-Jitsu (No Gi)', '7am Kickboxing All Levels'] },
  { day: 'Wednesday', classes: ['6am Jiu-Jitsu (Gi)', '8am Kickboxing Fundamentals', '9am Wrestling', '10am Striking for MMA', '11am Kickboxing Fundamentals'] },
  { day: 'Thursday', classes: ['6am Jiu-Jitsu (No Gi)', '7am Kickboxing All Levels'] },
  { day: 'Saturday', classes: ['9am Kickboxing All Levels', '10am Jiu-Jitsu (No Gi)'] },
  { day: 'Sunday', classes: ['9am Muay Thai Pads', '10am Open Mat'] },
]

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
        Start Today for $33
      </span>
      <span className="text-xs text-white/60 uppercase tracking-widest">Your first week at 50% off</span>
    </button>
  )
}

export default function EarlyRiserPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const loc = LOCATION_DATA[slug] || LOCATION_DATA['san-jose']

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
    track('page_view', { location: slug, page: 'early-riser', lead_source: 'meta' })

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
        track('lead_created', { location: slug, lead_source: 'meta', offer: 'early-riser-33' })
        metaPixelTrack('Lead')

        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, phone, location: slug, offer: 'early-riser-33', cancelPath: `/${slug}/early-riser` }),
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
      {/* Banner */}
      <div className="bg-amber-500 text-black text-center py-2 px-4">
        <p className="font-heading text-xs md:text-sm uppercase tracking-widest font-bold">
          Limited Morning Spots Available
        </p>
      </div>

      {/* Hero */}
      <div className="relative bg-neutral-100">
        <div className="absolute top-0 left-0 right-0 h-[65%] bg-black" />
        <div className="relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center pt-6 md:pt-8 pb-4">
            <p className="font-heading text-sm uppercase tracking-widest text-white/50 mb-3">Early Riser Program</p>
            <h1 className="font-heading text-4xl md:text-6xl uppercase font-bold tracking-tight text-white mb-3 leading-[1.1]">
              {firstName ? <><span className="shimmer-once bg-[linear-gradient(90deg,#f59e0b_0%,#f97316_40%,#fff_50%,#f97316_60%,#f59e0b_100%)] bg-clip-text text-transparent">{firstName}</span>, ready to own your mornings?</> : <>Own Your Mornings.<br />Transform Your Life.</>}
            </h1>
            <p className="text-lg text-white/70 mb-2">
              50% off your first 3 months of morning training.
            </p>
            <p className="text-xl text-white/70">
              Start today for just <span className="font-heading font-bold text-amber-400">$33</span>
            </p>
          </div>

          <div className="flex justify-center">
            <img src="/images/home/kickboxing.jpg" alt="FightCraft Morning Training" className="w-full max-w-xl shadow-xl" />
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

      {/* Why mornings */}
      <div className="bg-white text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            Why Train in the Morning?
          </h2>

          <div className="space-y-6 mb-12">
            {[
              { title: 'Win the Day Before It Starts', desc: 'By 9am you\'ve already done something harder than most people will do all week. That energy carries into everything else.' },
              { title: 'Smaller Classes, More Attention', desc: 'Morning sessions are intimate. You get more rounds, more coaching, and more mat time than the packed evening classes.' },
              { title: 'Consistency Is Easier', desc: 'Evenings get hijacked by work, family, and fatigue. Mornings are yours. Put it on the calendar and it happens.' },
              { title: 'Better Sleep, Better Recovery', desc: 'Morning training regulates your circadian rhythm. You\'ll sleep harder and recover faster than training late at night.' },
              { title: 'Join a Committed Crew', desc: 'The morning crew is a different breed. They show up every day, they push each other, and they don\'t make excuses.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Morning schedule */}
      <div className="bg-neutral-100 text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-2">
            Morning Schedule
          </h2>
          <p className="text-center text-black/50 mb-12">{MORNING_SCHEDULE.reduce((sum, day) => sum + day.classes.length, 0)} classes to choose from!</p>

          <div className="space-y-6 mb-12">
            {MORNING_SCHEDULE.map(day => (
              <div key={day.day}>
                <p className="font-heading text-sm uppercase tracking-widest font-bold mb-2">{day.day}</p>
                <div className="space-y-1">
                  {day.classes.map(cls => (
                    <p key={cls} className="text-sm text-black/70">{cls}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-black/50 mb-8">All morning classes included in your membership. Train one or train them all.</p>

          <CTAButton onClick={() => setModalOpen(true)} />
        </div>
      </div>

      {/* Coach section */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-6">{firstName ? `Hey ${firstName}, Coach ${loc.owner} here.` : `A note from Coach ${loc.owner}`}</p>

          <div className="text-left space-y-4 text-white/70 mb-8">
            <p>I built the morning program for people like me. People who figured out that the best version of themselves shows up before the rest of the world wakes up.</p>
            <p>There&apos;s something about walking into the gym at 6am. The energy is different. Focused. No one&apos;s checking their phone. Everyone&apos;s there because they chose to be.</p>
            <p>The morning crew is tight. They hold each other accountable. When you don&apos;t show up, people notice. And when you do, they&apos;re glad you&apos;re there.</p>
            <p>{firstName ? `${firstName}, 50%` : '50%'} off for 3 months is our way of saying: give mornings a real shot. Not one random 6am. Three months of building the habit. That&apos;s enough time to rewire how you start your day.</p>
            <p className="text-white font-medium">{firstName ? `${firstName}, set the alarm.` : 'Set the alarm.'} Everything else gets easier after that.</p>
          </div>

          <p className="text-white/40 text-sm">Coach {loc.owner}, FightCraft {loc.name}</p>
        </div>
      </div>

      {/* This is for you if */}
      <div className="bg-white text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            This Is For You If
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              "You keep saying you'll work out but evenings never happen",
              "You want to start the day with something that actually challenges you",
              "You're a morning person who hasn't found the right thing to do with that energy",
              "You want smaller classes with more personal attention from coaches",
              "You're tired of crowded gyms and want to train with people who take it seriously",
              "You know that discipline in the morning creates discipline everywhere else",
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              { q: 'What does 50% off for 3 months mean?', a: 'You pay half the normal weekly rate for your first 3 months of training. Start today for just $33 (your first week), then continue at the discounted rate.' },
              { q: 'Can I only train in the morning?', a: 'The discount is for morning members, but you\'re welcome to attend any class on the schedule. Morning classes run from 6am through 11am on weekdays, with weekend sessions too.' },
              { q: 'Do I need experience?', a: 'None. Most of our morning members started as complete beginners. Our coaches meet you where you are.' },
              { q: 'What if I\'m not a morning person?', a: 'Neither were most of our morning crew. Give it two weeks. Your body adjusts, and the feeling of having already trained by 8am is addictive.' },
              { q: 'What happens after 3 months?', a: 'You continue at the standard weekly rate. No contract. Cancel anytime with 30 days notice.' },
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
            {firstName ? `${firstName}, Your Morning Is Waiting.` : 'Your Morning Is Waiting.'}
          </h2>
          <p className="text-white/60 mb-2">50% off for 3 months. Start today for $33.</p>
          <p className="text-white/50 text-sm mb-8">Limited spots available for morning training.</p>

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
              <div className="bg-amber-500 text-black text-center py-3">
                <p className="font-heading text-sm uppercase tracking-widest font-bold">Start Your First Week for $33</p>
              </div>
              <div className="p-8">
                <h2 className="text-xl font-bold mb-2">{firstName ? `Let's go, ${firstName}.` : 'Almost there!'}</h2>
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
                    {submitting ? 'Sending...' : 'Start for $33'}
                  </button>
                </form>
                <p className="text-center text-sm text-black/40 mt-4">50% off for 3 months. No contract after.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
