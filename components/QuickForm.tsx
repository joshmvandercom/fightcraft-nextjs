'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setLead } from '@/lib/lead'

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function QuickForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('san-jose')

  useEffect(() => {
    const saved = localStorage.getItem('fightcraft_location')
    if (saved) setLocation(saved)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    setSubmitting(true)

    const data = { name: name, email, phone, location, website: '' }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setLead({ name: name, email, phone, location })
        router.push('/next-steps')
        return
      }
    } catch {}
    setSubmitting(false)
  }

  const inputDesktop = "flex-1 px-4 py-3 bg-white text-black placeholder-black/40 text-sm border border-black/10 focus:outline-none focus:border-black/30"
  const inputMobile = "px-3 py-2.5 bg-white text-black placeholder-black/40 text-sm border border-black/10 focus:outline-none focus:border-black/30"

  return (
    <div className="bg-neutral-100 py-4 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Desktop */}
        <form onSubmit={handleSubmit} className="hidden md:flex gap-3 items-center mb-3">
          <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} className={inputDesktop} />
          <input type="email" placeholder="Your Best Email" required value={email} onChange={e => setEmail(e.target.value)} className={inputDesktop} />
          <input type="tel" placeholder="Your Mobile Phone" value={phone} onChange={e => setPhone(e.target.value)} className={inputDesktop} />
          <input type="hidden" value={location} />
          <button type="submit" disabled={submitting} className="px-8 py-3 bg-black text-white font-heading text-sm uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 whitespace-nowrap">
            {submitting ? '...' : 'Get Started'}
          </button>
        </form>

        {/* Mobile */}
        <form onSubmit={handleSubmit} className="md:hidden grid grid-cols-2 gap-2 mb-3">
          <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} className={inputMobile} />
          <input type="email" placeholder="Your Best Email" required value={email} onChange={e => setEmail(e.target.value)} className={inputMobile} />
          <input type="tel" placeholder="Your Mobile Phone" value={phone} onChange={e => setPhone(e.target.value)} className={`${inputMobile} col-span-2`} />
          <input type="hidden" value={location} />
          <button type="submit" disabled={submitting} className="col-span-2 py-2.5 bg-black text-white font-heading text-sm uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50">
            {submitting ? '...' : 'Get Started'}
          </button>
        </form>

        {/* Social proof - desktop */}
        <div className="hidden md:flex items-center justify-center gap-3">
          <Stars />
          <p className="text-sm text-black/60">
            Rated <span className="font-bold text-black">4.9</span> out of 5 from <span className="font-bold text-black">139+ reviews</span> on Google
          </p>
          <img src="/images/google.webp" alt="Google" className="w-4 h-4" />
        </div>

        {/* Social proof - mobile */}
        <div className="md:hidden flex flex-col items-center gap-1.5">
          <p className="text-xs text-black/60">
            Rated <span className="font-bold text-black">4.9</span> out of 5 from <span className="font-bold text-black">139+ reviews</span> on Google <img src="/images/google.webp" alt="Google" className="w-3.5 h-3.5 inline" />
          </p>
          <Stars />
        </div>
      </div>
    </div>
  )
}
