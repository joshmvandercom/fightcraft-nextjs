'use client'

import { useState, useRef, useEffect } from 'react'
import ScrollRevealImage from './ScrollRevealImage'

interface ProgramCardProps {
  slug: string
  name: string
  image: string
  shortDescription: string
  availableLocations: { slug: string; name: string }[]
  locationSlug?: string
}

export default function ProgramCard({ slug, name, image, shortDescription, availableLocations, locationSlug }: ProgramCardProps) {
  const [showPicker, setShowPicker] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // If we have an explicit location, link directly
  if (locationSlug) {
    return (
      <a
        href={`/${locationSlug}/programs/${slug}`}
        className="group relative overflow-hidden aspect-[4/3] block w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
      >
        <ScrollRevealImage src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <h3 className="font-heading text-3xl uppercase font-bold tracking-tight text-white mb-2">{name}</h3>
          <p className="text-sm text-white/70 max-w-xs">{shortDescription}</p>
        </div>
      </a>
    )
  }

  // Global view: try localStorage, show picker if multiple locations
  function handleClick() {
    if (availableLocations.length === 1) {
      window.location.href = `/${availableLocations[0].slug}/programs/${slug}`
      return
    }

    const saved = localStorage.getItem('fightcraft_location')
    if (saved && availableLocations.find(l => l.slug === saved)) {
      window.location.href = `/${saved}/programs/${slug}`
      return
    }

    setShowPicker(true)
  }

  return (
    <div ref={ref} className="relative w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
      <button
        onClick={handleClick}
        className="group relative overflow-hidden aspect-[4/3] block w-full text-left cursor-pointer"
      >
        <ScrollRevealImage src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <h3 className="font-heading text-3xl uppercase font-bold tracking-tight text-white mb-2">{name}</h3>
          <p className="text-sm text-white/70 mb-4 max-w-xs">{shortDescription}</p>
          <div className="flex gap-2">
            {availableLocations.map(loc => (
              <span key={loc.slug} className="text-[10px] text-white/50 uppercase tracking-widest">{loc.name}</span>
            ))}
          </div>
        </div>
      </button>

      {showPicker && (
        <div className="absolute bottom-4 left-4 right-4 bg-black border border-white/20 p-4 z-10">
          <p className="font-heading text-xs uppercase tracking-widest text-white/50 mb-3">Choose a location</p>
          <div className="flex flex-col gap-2">
            {availableLocations.map(loc => (
              <a
                key={loc.slug}
                href={`/${loc.slug}/programs/${slug}`}
                className="block py-2 px-3 bg-white/10 text-white font-heading text-sm uppercase tracking-widest hover:bg-white/20 transition-colors text-center"
              >
                {loc.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
