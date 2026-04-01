'use client'

import { useEffect } from 'react'
import type { Location } from '@/lib/content'
import LocationCard from './LocationCard'

interface LocationsProps {
  locations: Location[]
}

export default function Locations({ locations }: LocationsProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const slug = localStorage.getItem('fightcraft_location')
      if (!slug) return
      const card = document.querySelector(`[data-slug="${slug}"]`)
      if (card) {
        card.classList.add('border-white', '!opacity-100')
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <section id="locations" className="relative text-white py-24 px-6">
      <div className="absolute inset-0">
        <img src="/images/home/carlos.jpeg" alt="" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/85" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight">Our Locations</h2>
          <div className="w-16 h-px bg-white mt-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map(loc => (
            <LocationCard key={loc.slug} location={loc} />
          ))}
        </div>
      </div>
    </section>
  )
}
