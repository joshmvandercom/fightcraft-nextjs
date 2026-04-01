import ScrollRevealImage from './ScrollRevealImage'
import type { Program, Location } from '@/lib/content'

interface ProgramsProps {
  programs: Program[]
  locations: Location[]
  locationSlug?: string
}

export default function Programs({ programs, locations, locationSlug }: ProgramsProps) {
  const locationNames: Record<string, string> = {}
  locations.forEach(loc => { locationNames[loc.slug] = loc.name })

  let displayPrograms: Program[]

  if (locationSlug) {
    displayPrograms = programs.filter(p => p.location === locationSlug)
  } else {
    // Deduplicate by slug for the global view — show one card per program type
    const seen = new Set<string>()
    displayPrograms = programs.filter(p => {
      if (seen.has(p.slug)) return false
      seen.add(p.slug)
      return true
    })
  }

  // For global view, collect which locations offer each program
  const programLocations: Record<string, string[]> = {}
  if (!locationSlug) {
    programs.forEach(p => {
      if (!programLocations[p.slug]) programLocations[p.slug] = []
      programLocations[p.slug].push(p.location)
    })
  }

  return (
    <section id="programs" className="bg-white text-black py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight text-black">
            {locationSlug ? 'Our Programs' : 'What We Teach'}
          </h2>
          <div className="w-16 h-px bg-black mt-6" />
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {displayPrograms.map((program) => (
            <a
              key={`${program.location}-${program.slug}`}
              href={locationSlug ? `/${locationSlug}/programs/${program.slug}` : '#'}
              className="group relative overflow-hidden aspect-[4/3] block w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <ScrollRevealImage src={program.image} alt={program.name} className="w-full h-full object-cover group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="font-heading text-3xl uppercase font-bold tracking-tight text-white mb-2">{program.name}</h3>
                <p className="text-sm text-white/70 mb-4 max-w-xs">{program.short_description}</p>
                {!locationSlug && programLocations[program.slug] && (
                  <div className="flex gap-2">
                    {programLocations[program.slug].map(locSlug => (
                      <span key={locSlug} className="text-[10px] text-white/50 uppercase tracking-widest">{locationNames[locSlug] || locSlug}</span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
