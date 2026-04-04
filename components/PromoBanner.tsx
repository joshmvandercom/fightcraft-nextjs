'use client'

import { useState, useEffect } from 'react'

export default function PromoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('fightcraft_location')
    setShow((saved || 'san-jose') === 'san-jose')
  }, [])

  if (!show || dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-3 px-4">
      <a href="/san-jose/web-special" className="hover:underline">
        <span className="font-heading text-xs md:text-sm uppercase tracking-widest font-bold">
          Limited Time Offer: Your first month for $97
        </span>
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
