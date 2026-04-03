'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { setLead } from '@/lib/lead'

interface OfferData {
  offer: {
    headline_template: string
    subtitle: string
    coach_intro: string
    body_line_1: string
    body_line_2: string
    cta_title: string
    cta_subtitle: string
    button_text: string
    button_sub: string
    footer_note: string
    quiz_skip_program: boolean
  }
  program: {
    display_name: string
    image: string
    slug_value: string
  }
  location: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
}

const LOCATION_DATA: Record<string, { name: string; address: string; city: string; state: string; zip: string }> = {
  'san-jose': { name: 'San Jose', address: '1825 W. San Carlos St.', city: 'San Jose', state: 'CA', zip: '95128' },
  'merced': { name: 'Merced', address: '2844 G St', city: 'Merced', state: 'CA', zip: '95430' },
  'brevard': { name: 'Brevard', address: '69 West French Broad', city: 'Brevard', state: 'NC', zip: '28712' },
}

function getDeadline(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${days[tomorrow.getDay()]}, ${months[tomorrow.getMonth()]} ${tomorrow.getDate()}`
}

function OfferModal({ slug, programValue, offer, onClose }: { slug: string; programValue: string; offer: string; onClose: () => void }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !phone || !email) return
    setSubmitting(true)

    const data = { name, email, phone, location: slug, website: '' }
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setLead({ name, email, phone, location: slug })
        onClose()
        if (offer === 'beginner') {
          router.push(`/${slug}/quiz?p=${programValue}`)
        } else {
          router.push(`/${slug}/quiz?p=${programValue}`)
        }
        return
      }
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-2">Complete your profile</h2>
            <p className="text-sm text-black/50 mb-6">Takes 30 seconds.</p>
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
                {submitting ? 'Sending...' : 'Go to Step Two'}
              </button>
            </form>
            <p className="text-center text-sm text-black/40 mt-4">We&apos;ll never spam you.</p>
            <p className="text-center mt-2">
              <a href="/privacy-policy" className="text-sm text-black underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OfferPage() {
  const params = useParams()
  const slug = params.slug as string
  const programSlug = params.program as string
  const offerSlug = params.offer as string
  const [offerData, setOfferData] = useState<OfferData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [exitTriggered, setExitTriggered] = useState(false)

  const loc = LOCATION_DATA[slug] || LOCATION_DATA['san-jose']
  const deadline = getDeadline()

  useEffect(() => {
    fetch(`/api/offer-data?program=${programSlug}&offer=${offerSlug}&location=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.offer && data.program) {
          const offer = { ...data.offer, coach_intro: data.offer.coach_intro.replace('{coach}', data.owner || 'Josh') }
          setOfferData({ offer, program: data.program, location: loc })
        }
      })
      .catch(() => {})
  }, [programSlug, offerSlug, loc])

  // Exit intent
  useEffect(() => {
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
  }, [exitTriggered])

  if (!offerData) {
    return <div className="min-h-screen bg-white" />
  }

  const { offer, program } = offerData
  const headline = offer.headline_template.replace('{program}', program.display_name)

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Urgency banner */}
      <div className="bg-red-500 text-white text-center py-2 px-4">
        <p className="font-heading text-xs md:text-sm uppercase tracking-widest font-bold">
          Last day to register: {deadline}
        </p>
      </div>

      {/* Hero + split image */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-[60%] bg-black" />
        <div className="relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center pt-4 md:pt-6 pb-4">
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl uppercase font-bold tracking-tight text-white mb-1 leading-[1.1]">
              <span dangerouslySetInnerHTML={{ __html: headline }} />
            </h1>
            <p className="text-base md:text-xl text-white/80">
              {offer.subtitle}
            </p>
          </div>
          <div className="flex justify-center">
            <img src={program.image} alt={program.display_name} className="w-full max-w-xl shadow-xl" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="text-black pt-4 pb-6 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-base mb-3">{offer.coach_intro}</p>

          <p className="text-sm mb-1" dangerouslySetInnerHTML={{ __html: offer.body_line_1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]\(.*?\)/g, '<u>$1</u>') }} />
          <p className="text-sm mb-4" dangerouslySetInnerHTML={{ __html: offer.body_line_2.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') }} />

          <p className="text-sm font-bold mb-1">{offer.cta_title}</p>
          <p className="text-sm mb-5" dangerouslySetInnerHTML={{ __html: offer.cta_subtitle.replace(/\*(.*?)\*/g, '<em>$1</em>') }} />

          {/* CTA */}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full max-w-sm mx-auto py-3 px-6 bg-black text-white rounded-2xl hover:bg-black/80 transition-colors cursor-pointer block mb-3"
          >
            <span className="font-heading text-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
              {offer.button_text}
            </span>
            <span className="text-xs text-white/60 uppercase tracking-widest">{offer.button_sub}</span>
          </button>

          <p className="text-sm text-black/60 mb-6">{offer.footer_note}</p>

          <div className="w-[60px] h-[60px] bg-black rounded-full flex items-center justify-center mx-auto mb-3">
            <img src="/images/fc-white-initials.svg" alt="FC" className="h-8 brightness-0 invert" />
          </div>
          <p className="text-[10px] text-black/40">Copyright {new Date().getFullYear()}, FightCraft Martial Arts</p>
          <p className="text-[10px] text-black/40">{loc.address}, {loc.city}, {loc.state} {loc.zip}</p>
        </div>
      </div>

      {modalOpen && (
        <OfferModal
          slug={slug}
          programValue={program.slug_value}
          offer={offerSlug}
          onClose={() => { setModalOpen(false); sessionStorage.setItem('lead_modal_dismissed', '1') }}
        />
      )}
    </div>
  )
}
