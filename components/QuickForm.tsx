'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  const [location, setLocation] = useState('san-jose')

  useEffect(() => {
    const saved = localStorage.getItem('fightcraft_location')
    if (saved) setLocation(saved)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    const form = e.currentTarget
    const data = {
      first_name: (form.elements.namedItem('first_name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      location: (form.elements.namedItem('location') as HTMLSelectElement).value,
      website: (form.elements.namedItem('website') as HTMLInputElement).value,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push('/next-steps')
        return
      }
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="bg-neutral-100 py-4 px-6">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="mb-3">
          {/* Desktop: single row. Mobile: 2-col grid */}
          <div className="hidden md:flex gap-3 items-center">
            <input type="text" name="first_name" placeholder="Name" required className="flex-1 px-4 py-3 bg-white text-black placeholder-black/40 text-sm border border-black/10 focus:outline-none focus:border-black/30" />
            <input type="email" name="email" placeholder="Email" required className="flex-1 px-4 py-3 bg-white text-black placeholder-black/40 text-sm border border-black/10 focus:outline-none focus:border-black/30" />
            <input type="tel" name="phone" placeholder="Phone" className="flex-1 px-4 py-3 bg-white text-black placeholder-black/40 text-sm border border-black/10 focus:outline-none focus:border-black/30" />
            <select name="location" value={location} onChange={e => setLocation(e.target.value)} className="w-auto px-4 py-3 bg-white text-black text-sm border border-black/10 focus:outline-none focus:border-black/30 appearance-none pr-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(0,0,0,0.3)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px' }}>
              <option value="san-jose">San Jose</option>
              <option value="merced">Merced</option>
              <option value="brevard">Brevard</option>
            </select>
            <button type="submit" disabled={submitting} className="px-8 py-3 bg-black text-white font-heading text-sm uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 whitespace-nowrap">
              {submitting ? '...' : 'Get Started'}
            </button>
          </div>

          {/* Mobile: compact 2-col grid */}
          <div className="md:hidden grid grid-cols-2 gap-2">
            <input type="text" name="first_name" placeholder="Name" required className="px-3 py-2.5 bg-white text-black placeholder-black/40 text-sm border border-black/10 focus:outline-none focus:border-black/30" />
            <input type="email" name="email" placeholder="Email" required className="px-3 py-2.5 bg-white text-black placeholder-black/40 text-sm border border-black/10 focus:outline-none focus:border-black/30" />
            <input type="tel" name="phone" placeholder="Phone" className="px-3 py-2.5 bg-white text-black placeholder-black/40 text-sm border border-black/10 focus:outline-none focus:border-black/30" />
            <select name="location" value={location} onChange={e => setLocation(e.target.value)} className="px-3 py-2.5 bg-white text-black text-sm border border-black/10 focus:outline-none focus:border-black/30 appearance-none pr-8" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(0,0,0,0.3)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}>
              <option value="san-jose">San Jose</option>
              <option value="merced">Merced</option>
              <option value="brevard">Brevard</option>
            </select>
            <button type="submit" disabled={submitting} className="col-span-2 py-2.5 bg-black text-white font-heading text-sm uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50">
              {submitting ? '...' : 'Get Started'}
            </button>
          </div>

          <div className="asdf">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>
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
