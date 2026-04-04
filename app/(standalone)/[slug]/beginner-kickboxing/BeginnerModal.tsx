'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { setLead } from '@/lib/lead'
import { setSidCookie } from '@/lib/sid'
import { identify, track } from '@/lib/analytics'
import { metaPixelTrack } from '@/components/MetaPixel'

export default function BeginnerModal() {
  const [open, setOpen] = useState(false)
  const [exitTriggered, setExitTriggered] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => {
    setOpen(false)
    sessionStorage.setItem('lead_modal_dismissed', '1')
  }, [])

  useEffect(() => {
    import('@/lib/lead').then(({ getLeadWithSid }) => {
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
    const handler = () => openModal()
    window.addEventListener('open-beginner-modal', handler)

    const exitHandler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitTriggered) {
        setExitTriggered(true)
        if (!sessionStorage.getItem('lead_modal_dismissed')) {
          openModal()
        }
      }
    }
    document.addEventListener('mouseout', exitHandler)

    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', escHandler)

    return () => {
      window.removeEventListener('open-beginner-modal', handler)
      document.removeEventListener('mouseout', exitHandler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [exitTriggered, openModal, closeModal])

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
        track('lead_created', { location: slug, lead_source: 'meta' })
        metaPixelTrack('Lead')
        closeModal()
        router.push(`/${slug}/quiz?p=kickboxing`)
        return
      }
    } catch {}
    setSubmitting(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

      <div className="relative w-full max-w-md">
        {/* Close button */}
        <button
          onClick={(e) => { e.stopPropagation(); closeModal() }}
          className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="relative h-10 bg-neutral-100">
          <div className="absolute inset-0 bg-red-400" style={{
            width: '85%',
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 20px)',
          }} />
          <p className="relative z-10 text-center text-sm text-white font-medium leading-10">Almost done...</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Complete your profile</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">Phone <span className="text-red-500">*</span></label>
              <input
                type="tel"
                placeholder="Your Mobile Phone"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                placeholder="Your Best Email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-black text-white font-heading text-lg font-bold uppercase tracking-widest rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50"
            >
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
