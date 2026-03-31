'use client'

import { useEffect } from 'react'
import type { Location } from '@/lib/content'
import LocationCard from './LocationCard'

interface LocationsProps {
  locations: Location[]
  linked?: boolean
}

export default function Locations({ locations, linked = false }: LocationsProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const slug = localStorage.getItem('fightcraft_location')
      if (!slug) return
      const card = document.querySelector(`[data-slug="${slug}"]`)
      if (card) {
        card.classList.add('border-white', '!opacity-100')
        const badge = card.querySelector('.nearest-badge')
        badge?.classList.remove('hidden')
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <section id="locations" className="bg-black text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight">Find Your Gym</h2>
          <div className="w-16 h-px bg-white mt-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map(loc => (
            <LocationCard key={loc.slug} location={loc} linked={linked} />
          ))}
        </div>
      </div>
    </section>
  )
}
