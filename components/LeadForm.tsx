'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setLead } from '@/lib/lead'
import { identify, track } from '@/lib/analytics'

interface LeadFormProps {
  selectedLocation?: string
  variant?: 'dark' | 'light'
  onSuccess?: () => void
}

export default function LeadForm({ selectedLocation, variant = 'dark', onSuccess }: LeadFormProps) {
  const router = useRouter()
  const [location, setLocation] = useState(selectedLocation || '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
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
        setLead({ name: data.name, email: data.email, phone: data.phone, location: data.location })
        identify(data.email, { name: data.name, location: data.location })
        track('lead_created', { location: data.location, lead_source: 'website' })
        onSuccess?.()
        router.push('/next-steps')
        return
      } else {
        let msg = 'Something went wrong.'
        try {
          const json = await res.json()
          msg = json.error || msg
        } catch { /* response wasn't JSON */ }
        setError(msg)
      }
    } catch (err) {
      console.error('Lead form error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <h3 className={`font-heading text-2xl uppercase font-bold tracking-tight mb-3 ${variant === 'dark' ? 'text-white' : 'text-black'}`}>
          Thank You!
        </h3>
        <p className={variant === 'dark' ? 'text-white/60' : 'text-black/60'}>
          We&apos;ll be in touch shortly.
        </p>
      </div>
    )
  }

  const inputClass = variant === 'dark'
    ? 'w-full px-4 py-3 bg-transparent border border-white/30 text-white placeholder-white/30 font-heading text-sm uppercase tracking-wider focus:border-white focus:outline-none transition-colors'
    : 'w-full px-4 py-3 bg-transparent border border-black/30 text-black placeholder-black/30 font-heading text-sm uppercase tracking-wider focus:border-black focus:outline-none transition-colors'

  const buttonClass = variant === 'dark'
    ? 'w-full py-4 bg-white text-black font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50'
    : 'w-full py-4 bg-black text-white font-heading text-base font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" name="name" placeholder="Full Name" required className={inputClass} />
        <input type="email" name="email" placeholder="Your Best Email" required className={inputClass} />
      </div>
      <input type="tel" name="phone" placeholder="Your Mobile Phone" className={inputClass} />
      <input type="hidden" name="location" value={location} />

      <div className="asdf">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button type="submit" disabled={submitting} className={buttonClass}>
        {submitting ? 'Sending...' : 'Request Info'}
      </button>
    </form>
  )
}
