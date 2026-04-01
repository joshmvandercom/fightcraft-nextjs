import ProgramCard from './ProgramCard'
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
    const seen = new Set<string>()
    displayPrograms = programs.filter(p => {
      if (seen.has(p.slug)) return false
      seen.add(p.slug)
      return true
    })
  }

  // For global view, collect which locations offer each program
  const programLocations: Record<string, { slug: string; name: string }[]> = {}
  if (!locationSlug) {
    programs.forEach(p => {
      if (!programLocations[p.slug]) programLocations[p.slug] = []
      if (!programLocations[p.slug].find(l => l.slug === p.location)) {
        programLocations[p.slug].push({ slug: p.location, name: locationNames[p.location] || p.location })
      }
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
          {displayPrograms.map(program => (
            <ProgramCard
              key={`${program.location}-${program.slug}`}
              slug={program.slug}
              name={program.name}
              image={program.image}
              shortDescription={program.short_description}
              availableLocations={programLocations[program.slug] || [{ slug: program.location, name: locationNames[program.location] }]}
              locationSlug={locationSlug}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
