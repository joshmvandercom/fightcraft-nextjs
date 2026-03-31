import type { Program, Location } from '@/lib/content'

interface ProgramsProps {
  programs: Program[]
  locations: Location[]
  locationSlug?: string
}

export default function Programs({ programs, locations, locationSlug }: ProgramsProps) {
  const filtered = locationSlug
    ? programs.filter(p => p.locations.includes(locationSlug))
    : programs

  const locationNames: Record<string, string> = {}
  locations.forEach(loc => { locationNames[loc.slug] = loc.name })

  return (
    <section id="programs" className="bg-white text-black py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight text-black">
            {locationSlug ? 'Our Programs' : 'What We Teach'}
          </h2>
          <div className="w-16 h-px bg-black mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(program => (
            <a
              key={program.slug}
              href={locationSlug ? `/${locationSlug}/programs/${program.slug}` : '#'}
              className="group relative overflow-hidden aspect-[4/3] block"
            >
              <img src={program.image} alt={program.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="font-heading text-3xl uppercase font-bold tracking-tight text-white mb-2">{program.name}</h3>
                <p className="text-sm text-white/70 mb-4 max-w-xs">{program.short_description}</p>
                {!locationSlug && (
                  <div className="flex gap-2">
                    {program.locations.map(slug => (
                      <span key={slug} className="text-[10px] text-white/50 uppercase tracking-widest">{locationNames[slug] || slug}</span>
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
