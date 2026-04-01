'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Location, Program } from '@/lib/content'

interface NavProps {
  locations: Location[]
  programs: Program[]
}

export default function Nav({ locations, programs }: NavProps) {
  const [mobileOpen, setMobileOpenState] = useState(false)
  const setMobileOpen = (open: boolean) => {
    setMobileOpenState(open)
    document.body.style.overflow = open ? 'hidden' : ''
  }
  const [aboutOpen, setAboutOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [locationSwitcherOpen, setLocationSwitcherOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [locationPrograms, setLocationPrograms] = useState<Program[]>([])

  const aboutRef = useRef<HTMLDivElement>(null)
  const contextRef = useRef<HTMLDivElement>(null)
  const locationSwitcherRef = useRef<HTMLDivElement>(null)

  const updateContext = useCallback((slug: string) => {
    const loc = locations.find(l => l.slug === slug)
    if (!loc) return
    setCurrentLocation(loc)
    setLocationPrograms(programs.filter(p => p.location === slug))
    localStorage.setItem('fightcraft_location', slug)
  }, [locations, programs])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll)

    const onClickOutside = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setAboutOpen(false)
      }
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextOpen(false)
      }
      if (locationSwitcherRef.current && !locationSwitcherRef.current.contains(e.target as Node)) {
        setLocationSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)

    const locationSlugs = locations.map(l => l.slug)
    const firstSegment = window.location.pathname.split('/')[1]
    if (firstSegment && locationSlugs.includes(firstSegment)) {
      updateContext(firstSegment)
    } else {
      const saved = localStorage.getItem('fightcraft_location')
      if (saved) {
        updateContext(saved)
      } else if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const { latitude, longitude } = pos.coords
            let minDist = Infinity
            let nearest = 'san-jose'
            locations.forEach(loc => {
              const R = 3959
              const dLat = ((loc.lat - latitude) * Math.PI) / 180
              const dLng = ((loc.lng - longitude) * Math.PI) / 180
              const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((latitude * Math.PI) / 180) *
                  Math.cos((loc.lat * Math.PI) / 180) *
                  Math.sin(dLng / 2) ** 2
              const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
              if (dist < minDist) { minDist = dist; nearest = loc.slug }
            })
            updateContext(nearest)
          },
          () => updateContext('san-jose'),
          { timeout: 5000 }
        )
      } else {
        updateContext('san-jose')
      }
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [locations, updateContext])

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img src="/images/fc-horizontal.svg" alt="FightCraft" className="h-8 hidden md:block brightness-0 invert" />
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 md:hidden brightness-0 invert" />
        </a>

        {/* Desktop Links — centered */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="font-heading text-base uppercase tracking-widest text-white/90 hover:text-white transition-colors">Home</a>

          {/* About Dropdown */}
          <div className="relative" ref={aboutRef}>
            <button
              onClick={() => { setAboutOpen(!aboutOpen); setContextOpen(false) }}
              className="font-heading text-base uppercase tracking-widest text-white/90 hover:text-white transition-colors flex items-center gap-2"
            >
              About
              <svg className={`w-3 h-3 transition-transform ${aboutOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {aboutOpen && (
              <div className="absolute top-full left-0 mt-3 py-2 bg-black border border-white/20 min-w-[180px]">
                <a href="/about" className="block px-4 py-2 font-heading text-sm uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/5 transition-colors">About Us</a>
                <a href="/about/faq" className="block px-4 py-2 font-heading text-sm uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/5 transition-colors">FAQ</a>
                <a href="/about/reviews" className="block px-4 py-2 font-heading text-sm uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/5 transition-colors">Reviews</a>
                <a href="/about/core-values" className="block px-4 py-2 font-heading text-sm uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/5 transition-colors">Core Values</a>
              </div>
            )}
          </div>

          <a href="/locations" className="font-heading text-base uppercase tracking-widest text-white/90 hover:text-white transition-colors">Locations</a>

          {/* Context Nav — Programs & Schedule inline when location is set */}
          {currentLocation && (
            <>
              <div className="w-px h-4 bg-white/20" />

              {/* Programs Dropdown */}
              <div className="relative" ref={contextRef}>
                <button
                  onClick={() => { setContextOpen(!contextOpen); setAboutOpen(false) }}
                  className="font-heading text-base uppercase tracking-widest text-white/90 hover:text-white transition-colors flex items-center gap-2"
                >
                  Programs
                  <svg className={`w-3 h-3 transition-transform ${contextOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {contextOpen && (
                  <div className="absolute top-full left-0 mt-3 py-2 bg-black border border-white/20 min-w-[200px]">
                    {locationPrograms.map(p => (
                      <a key={p.slug} href={`/${currentLocation.slug}/programs/${p.slug}`} className="block px-4 py-2 font-heading text-sm uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                        {p.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a href={`/${currentLocation.slug}/schedule`} className="font-heading text-base uppercase tracking-widest text-white/90 hover:text-white transition-colors">
                Schedule
              </a>
            </>
          )}
        </div>

        {/* Location Switcher — right side */}
        <div className="hidden md:flex items-center">
          {currentLocation && (
            <div className="relative" ref={locationSwitcherRef}>
              <button
                onClick={() => { setLocationSwitcherOpen(!locationSwitcherOpen); setAboutOpen(false); setContextOpen(false) }}
                className="font-heading text-base uppercase tracking-widest text-white hover:text-white/80 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-bold">{currentLocation.name}</span>
                <svg className={`w-3 h-3 transition-transform ${locationSwitcherOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {locationSwitcherOpen && (
                <div className="absolute top-full right-0 mt-3 py-2 bg-black border border-white/20 min-w-[180px]">
                  {locations.map(loc => (
                    <a
                      key={loc.slug}
                      href={`/${loc.slug}`}
                      className={`block w-full text-left px-4 py-2 font-heading text-xs uppercase tracking-widest transition-colors hover:bg-white/5 ${loc.slug === currentLocation.slug ? 'text-white' : 'text-white/50 hover:text-white'}`}
                    >
                      {loc.name}
                      {loc.slug === currentLocation.slug && <span className="ml-2 text-white/50">&bull;</span>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile: location + hamburger */}
        <div className="md:hidden flex items-center gap-4">
          {currentLocation && (
            <a href={`/${currentLocation.slug}`} className="font-heading text-xs uppercase tracking-widest text-white/60">
              {currentLocation.name}
            </a>
          )}
          <button onClick={() => setMobileOpen(true)} className="flex flex-col gap-1.5 p-2" aria-label="Toggle menu">
            <span className="block w-6 h-px bg-white" />
            <span className="block w-6 h-px bg-white" />
            <span className="block w-6 h-px bg-white" />
          </button>
        </div>
      </div>

    </nav>

    {/* Mobile Menu — outside nav to avoid stacking context issues */}
    {mobileOpen && (
      <div className="fixed inset-0 w-screen h-screen bg-black z-[999] flex flex-col items-start px-10 pt-24 pb-10 gap-6 overflow-y-auto md:hidden">
        <a href="/" className="absolute top-5 left-6">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 p-2" aria-label="Close menu">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <a href="/" onClick={() => setMobileOpen(false)} className="font-heading text-xl uppercase tracking-widest text-white hover:text-white/60 transition-colors">Home</a>
        <a href="/about" onClick={() => setMobileOpen(false)} className="font-heading text-xl uppercase tracking-widest text-white hover:text-white/60 transition-colors">About</a>
        <div className="pl-6 flex flex-col gap-3">
          <a href="/about/faq" onClick={() => setMobileOpen(false)} className="font-heading text-lg uppercase tracking-widest text-white/50 hover:text-white transition-colors">FAQ</a>
          <a href="/about/reviews" onClick={() => setMobileOpen(false)} className="font-heading text-lg uppercase tracking-widest text-white/50 hover:text-white transition-colors">Reviews</a>
          <a href="/about/core-values" onClick={() => setMobileOpen(false)} className="font-heading text-lg uppercase tracking-widest text-white/50 hover:text-white transition-colors">Core Values</a>
        </div>
        <a href="/locations" onClick={() => setMobileOpen(false)} className="font-heading text-xl uppercase tracking-widest text-white hover:text-white/60 transition-colors">Locations</a>

        {/* Location switcher */}
        {currentLocation && (
          <div className="mt-4 pt-6 border-t border-white/20 w-full">
            <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Your Location</p>
            <select
              value={currentLocation.slug}
              onChange={e => updateContext(e.target.value)}
              className="w-full px-4 pr-10 py-3 mb-6 bg-white/10 text-white font-heading text-sm uppercase tracking-widest border-0 focus:outline-none focus:ring-1 focus:ring-white/30 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
            >
              {locations.map(loc => (
                <option key={loc.slug} value={loc.slug} className="bg-black">{loc.name}</option>
              ))}
            </select>

            <div className="flex flex-col gap-3">
              {locationPrograms.map(p => (
                <a key={p.slug} href={`/${currentLocation.slug}/programs/${p.slug}`} onClick={() => setMobileOpen(false)} className="font-heading text-lg uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                  {p.name}
                </a>
              ))}
              <a href={`/${currentLocation.slug}/schedule`} onClick={() => setMobileOpen(false)} className="font-heading text-lg uppercase tracking-widest text-white/50 hover:text-white transition-colors">Schedule</a>
            </div>
          </div>
        )}
      </div>
    )}
    </>
  )
}
