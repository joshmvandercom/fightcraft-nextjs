'use client'

import { useEffect, useState, useCallback } from 'react'
import LeadForm from './LeadForm'

export default function LeadModal() {
  const [open, setOpen] = useState(false)
  const [exitTriggered, setExitTriggered] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('')

  const openModal = useCallback(() => {
    setSelectedLocation(localStorage.getItem('fightcraft_location') || 'san-jose')
    setOpen(true)
  }, [])
  const closeModal = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handler = () => openModal()
    window.addEventListener('open-lead-modal', handler)

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
      window.removeEventListener('open-lead-modal', handler)
      document.removeEventListener('mouseout', exitHandler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [exitTriggered, openModal, closeModal])

  function handleClose() {
    closeModal()
    sessionStorage.setItem('lead_modal_dismissed', '1')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-black border-[4px] border-white w-full max-w-lg p-10">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-heading text-2xl md:text-3xl uppercase font-bold tracking-tight text-white mb-2">
          Get Started
        </h2>
        <p className="text-white/60 text-sm mb-8">
          Drop your info and we&apos;ll reach out with everything you need to get started.
        </p>

        <LeadForm selectedLocation={selectedLocation} variant="dark" onSuccess={handleClose} />
      </div>
    </div>
  )
}
