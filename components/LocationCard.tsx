import type { Location } from '@/lib/content'

interface LocationCardProps {
  location: Location
}

export default function LocationCard({ location: loc }: LocationCardProps) {
  return (
    <div
      className="location-card border-[4px] border-white transition-all duration-300 h-full"
      data-lat={loc.lat}
      data-lng={loc.lng}
      data-slug={loc.slug}
    >
      <div className="p-8 flex flex-col h-full">
        <h3 className="font-display text-6xl uppercase tracking-tight mb-1">{loc.name}</h3>
        <p className="font-heading text-sm uppercase tracking-[0.2em] text-white/50 mb-4">{loc.city}, {loc.state}</p>

        <div className="w-10 h-px bg-white mb-6" />

        <p className="text-sm text-white/60 mb-6">{loc.address}</p>

        <div className="mb-8">
          <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-white/60 mb-3">Programs</p>
          <div className="flex flex-wrap gap-2">
            {loc.programs.map(program => (
              <span key={program} className="text-sm text-white/70 bg-white/10 px-3 py-1.5">{program}</span>
            ))}
          </div>
        </div>

        <a href={`/${loc.slug}`} className="mt-auto block w-full py-4 bg-white text-black text-center font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors">
          Explore Location &rarr;
        </a>
      </div>
    </div>
  )
}
