'use client'

import { useParams } from 'next/navigation'
import { Suspense, useState, useEffect, useRef } from 'react'
import { getLead, setLead } from '@/lib/lead'
import { setSidCookie } from '@/lib/sid'
import { identify, track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'
import { fireFunnelEvent } from '@/lib/funnel'

const LOCATION_DATA: Record<
  string,
  {
    name: string
    address: string
    city: string
    state: string
    zip: string
    owner: string
  }
> = {
  'san-jose': {
    name: 'San Jose',
    address: '1825 W. San Carlos St.',
    city: 'San Jose',
    state: 'CA',
    zip: '95128',
    owner: 'Josh',
  },
  merced: {
    name: 'Merced',
    address: '2844 G St',
    city: 'Merced',
    state: 'CA',
    zip: '95430',
    owner: 'Patrick',
  },
  brevard: {
    name: 'Brevard',
    address: '69 West French Broad',
    city: 'Brevard',
    state: 'NC',
    zip: '28712',
    owner: 'Ricky',
  },
}

const BOOKING_IDS: Record<string, string> = {
  'san-jose': 'XbQDkmoCiq852ukwzNSR',
  merced: 'XbQDkmoCiq852ukwzNSR',
  brevard: 'XbQDkmoCiq852ukwzNSR',
}

function Check() {
  return (
    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function PrivateOnrampContent() {
  const params = useParams()
  const slug = params.slug as string
  const loc = LOCATION_DATA[slug] || LOCATION_DATA['san-jose']

  const [pageLoadTime] = useState(() => Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [iframeSrc, setIframeSrc] = useState('')
  const [stickyVisible, setStickyVisible] = useState(false)
  const [stickyFlashed, setStickyFlashed] = useState(false)
  const heroCTARef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
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
      getLeadWithSid().then((lead) => {
        if (lead) {
          setName(lead.name)
          setEmail(lead.email)
          setPhone(lead.phone)
        }
      })
    })
  }, [])

  useEffect(() => {
    track('page_view', { location: slug, page: 'private-onramp', lead_source: 'meta' })
    fireFunnelEvent('offer_viewed', 'private-onramp')
  }, [slug])

  useEffect(() => {
    if (!heroCTARef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(heroCTARef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (stickyVisible && !stickyFlashed) {
      const timer = setTimeout(() => setStickyFlashed(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [stickyVisible, stickyFlashed])

  function scrollToCalendar() {
    calendarRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !phone || !email) return
    setSubmitting(true)

    const data = {
      name,
      email,
      phone,
      location: slug,
      website: '',
      lead_source: 'private-onramp',
      _t: pageLoadTime,
    }
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
        track('lead_created', {
          location: slug,
          lead_source: 'private-onramp',
          offer: 'private-onramp',
        })
        metaPixelTrack('Lead')

        // Build calendar URL with lead info
        const nameParts = name.trim().split(' ')
        const fn = nameParts[0] || ''
        const ln = nameParts.slice(1).join(' ') || ''
        const calParams = new URLSearchParams()
        if (fn) calParams.set('first_name', fn)
        if (ln) calParams.set('last_name', ln)
        if (email) calParams.set('email', email)
        if (phone) calParams.set('phone', phone)

        const bookingId = BOOKING_IDS[slug] || BOOKING_IDS['san-jose']
        setIframeSrc(`https://api.leadconnectorhq.com/widget/booking/${bookingId}?${calParams.toString()}`)

        // Load GHL embed script
        const script = document.createElement('script')
        script.src = 'https://api.leadconnectorhq.com/js/form_embed.js'
        script.type = 'text/javascript'
        document.body.appendChild(script)

        setSubmitted(true)

        // Scroll to calendar after a tick
        setTimeout(() => {
          calendarRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col bg-black min-h-screen">
      {/* Hero */}
      <div className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/home/bjj-callout.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 px-6 max-w-4xl mx-auto w-full text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/images/fc-white-initials.svg"
              alt="FightCraft"
              className="h-12 brightness-0 invert"
            />
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl uppercase font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {firstName ? (
              <>{firstName}, Start with a Coach by Your Side.</>
            ) : (
              <>Start with a Coach<br />by Your Side.</>
            )}
          </h1>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            3 private sessions to learn the fundamentals before you ever step into a group class.
          </p>

          <div ref={heroCTARef}>
            <button
              onClick={scrollToCalendar}
              className="w-full max-w-lg mx-auto py-4 px-8 bg-white text-black rounded-xl hover:bg-white/90 transition-colors cursor-pointer block"
            >
              <span className="block font-heading text-xl font-bold uppercase tracking-widest">
                Book Your Assessment
              </span>
              <span className="text-xs text-black/60 uppercase tracking-widest">
                Free call with a coach
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* The problem */}
      <div className="bg-white text-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-4">
            Group Classes Can Be Intimidating.
          </h2>
          <p className="text-black/50 mb-12 max-w-2xl">
            You don&apos;t know the moves. You don&apos;t know the etiquette. Everyone else looks like they know what they&apos;re doing. We hear this all the time. And we built this program to solve it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="font-heading text-6xl font-bold text-black/10">1</span>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3 -mt-2">
                You Feel Behind
              </h3>
              <p className="text-sm text-black/60 leading-relaxed">
                Walking into a class where everyone knows the basics except you. That feeling alone keeps most people from starting.
              </p>
            </div>
            <div>
              <span className="font-heading text-6xl font-bold text-black/10">2</span>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3 -mt-2">
                You Don&apos;t Know What to Expect
              </h3>
              <p className="text-sm text-black/60 leading-relaxed">
                What do you wear? Where do you stand? What if you can&apos;t keep up? The unknowns stack up until it&apos;s easier to just not go.
              </p>
            </div>
            <div>
              <span className="font-heading text-6xl font-bold text-black/10">3</span>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3 -mt-2">
                You Want to Do It Right
              </h3>
              <p className="text-sm text-black/60 leading-relaxed">
                You&apos;re not looking to just survive a class. You want to actually learn, build good habits, and not pick up bad ones from day one.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What you get */}
      <div className="relative py-20 px-6">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/home/kickboxing.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/85" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-4">
            The Private Onramp
          </h2>
          <p className="text-white/50 mb-14 max-w-xl">
            3 one-on-one sessions with a coach. By the end, you&apos;ll walk into your first group class knowing exactly what to do.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Session 1: Assessment &amp; Foundations</p>
                <p className="text-sm text-white/50">Your coach evaluates your fitness level, mobility, and goals. You learn stance, movement, and the basic techniques for your chosen program.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Session 2: Build &amp; Drill</p>
                <p className="text-sm text-white/50">Add combinations, defensive fundamentals, and partner-work basics. Your coach corrects form in real time so you build clean habits.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Session 3: Class Prep &amp; Transition</p>
                <p className="text-sm text-white/50">Simulate a real class environment. Your coach walks you through class etiquette, warm-up drills, and what to expect. You&apos;ll be ready.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Your First Group Class</p>
                <p className="text-sm text-white/50">Your coach introduces you to the group class personally. You walk in knowing the moves, knowing the people, and knowing you belong.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who this is for */}
      <div className="bg-white text-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            This Is For You If
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              "You've wanted to try martial arts but the idea of a group class feels overwhelming",
              "You learn better one-on-one before jumping into a group setting",
              "You want to build a foundation of correct technique from day one",
              "You've tried a group class before and felt lost or out of place",
              "You're coming back after a long break and want to shake off the rust privately",
              "You just want to know what you're doing before anyone's watching",
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm text-black/70">{item}</p>
              </div>
            ))}
          </div>

          <button
            onClick={scrollToCalendar}
            className="w-full max-w-lg mx-auto py-4 px-8 bg-black text-white rounded-xl hover:bg-black/90 transition-colors cursor-pointer block"
          >
            <span className="block font-heading text-xl font-bold uppercase tracking-widest">
              Book Your Assessment
            </span>
            <span className="text-xs text-white/60 uppercase tracking-widest">
              Free call with a coach
            </span>
          </button>
        </div>
      </div>

      {/* Coach note */}
      <div className="relative py-20 px-6 overflow-hidden">
        <img
          src="/images/home/lian.jpeg"
          alt="FightCraft coaching"
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-white">
          <p className="font-heading text-sm uppercase tracking-widest text-white/40 mb-4">
            From Coach {loc.owner}
          </p>
          <div className="space-y-4 text-lg text-white/70">
            <p>
              {firstName ? `${firstName}, the` : 'The'} number one reason people don&apos;t start martial arts isn&apos;t money, time, or fitness. It&apos;s the fear of looking stupid in front of strangers.
            </p>
            <p>
              I get it. That&apos;s why we built this. Three sessions, just you and a coach. No audience. No pressure. By your third session, you&apos;ll know the fundamentals better than most people do after a month of group classes.
            </p>
            <p>
              And when you do walk into your first group class, you won&apos;t be the person in the back hoping nobody notices you. You&apos;ll be the person who already knows what they&apos;re doing.
            </p>
            <p className="text-white font-bold">
              Book the call.{firstName ? ` Let's build your plan, ${firstName}.` : " Let's build your plan."}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-12">
            Common Questions
          </h2>

          <div className="space-y-8 mb-12">
            {[
              {
                q: 'What happens on the assessment call?',
                a: "A quick 10-15 minute call with a coach. We'll talk about your goals, experience level, schedule, and which program is the best fit. No pressure, no commitment.",
              },
              {
                q: 'Do I need any experience?',
                a: "None. That's the whole point. This program is designed for people who have never trained before and want to learn properly from day one.",
              },
              {
                q: 'What program will I learn?',
                a: "You choose. Kickboxing, Muay Thai, Jiu-Jitsu, MMA — whatever interests you. Your coach tailors all 3 sessions to that program.",
              },
              {
                q: 'How long is each session?',
                a: 'Each private session is about 45-60 minutes. We schedule them around your availability.',
              },
              {
                q: 'What happens after the 3 sessions?',
                a: "Your coach transitions you into group classes. You'll already know the fundamentals, the coaches, and how things work. Most people are surprised how comfortable they feel.",
              },
              {
                q: 'Do I need to bring anything?',
                a: 'Athletic clothes and water. We provide everything else.',
              },
            ].map((item) => (
              <div key={item.q}>
                <p className="font-bold text-lg mb-2">{item.q}</p>
                <p className="text-white/50">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead form + Calendar */}
      <div ref={calendarRef} id="book" className="bg-white text-black py-20 px-6 scroll-mt-8">
        <div className="max-w-xl mx-auto">
          {!submitted ? (
            <>
              <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-2">
                Book Your Free Assessment
              </h2>
              <p className="text-center text-black/50 mb-8">
                Tell us a bit about yourself and pick a time that works.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Your Mobile Phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Your Best Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white font-heading text-lg font-bold uppercase tracking-widest rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Loading...' : 'Pick a Time'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-2">
                {firstName ? `${firstName}, Pick a Time` : 'Pick a Time'}
              </h2>
              <p className="text-center text-black/50 mb-8">
                Choose a time for your free assessment call with a coach.
              </p>

              {iframeSrc && (
                <div className="bg-white rounded-lg overflow-hidden">
                  <iframe
                    src={iframeSrc}
                    style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '600px' }}
                    scrolling="no"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-white/10 py-8 px-6 text-center">
        <div className="w-[50px] h-[50px] bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <img
            src="/images/fc-white-initials.svg"
            alt="FC"
            className="h-6 brightness-0 invert"
          />
        </div>
        <p className="text-[10px] text-white/30">
          Copyright {new Date().getFullYear()}, FightCraft Martial Arts
        </p>
        <p className="text-white/20 text-xs mt-2">
          FightCraft {loc.name} &middot; {loc.address}, {loc.city},{' '}
          {loc.state} {loc.zip}
        </p>
      </div>

      {/* Sticky CTA */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-white/10 px-4 py-4 transition-transform duration-300 ${stickyVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={scrollToCalendar}
            className={`w-full py-4 font-heading text-base uppercase tracking-widest font-bold rounded-lg transition-all duration-700 ${stickyVisible && !stickyFlashed ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}
          >
            Book Your Free Assessment
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PrivateOnrampPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <PrivateOnrampContent />
    </Suspense>
  )
}
