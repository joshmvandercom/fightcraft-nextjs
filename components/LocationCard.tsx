import type { Location } from '@/lib/content'

interface LocationCardProps {
  location: Location
  linked?: boolean
}

export default function LocationCard({ location: loc, linked = false }: LocationCardProps) {
  return (
    <div
      className={`location-card border border-white/20 p-8 transition-all duration-300 hover:border-white/60 ${loc.status === 'coming_soon' ? 'opacity-50' : ''}`}
      data-lat={loc.lat}
      data-lng={loc.lng}
      data-slug={loc.slug}
    >
      <div className="flex items-center gap-3 mb-6">
        {loc.label && (
          <span className={`font-heading text-xs uppercase tracking-widest px-3 py-1 border ${loc.status === 'coming_soon' ? 'border-white/30 text-white/50' : 'border-white text-white'}`}>
            {loc.label}
          </span>
        )}
        <span className="nearest-badge hidden font-heading text-xs uppercase tracking-widest px-3 py-1 bg-white text-black">
          Nearest to You
        </span>
      </div>

      <h3 className="font-heading text-4xl uppercase font-bold tracking-tight mb-4">{loc.name}</h3>

      {loc.status === 'coming_soon' ? (
        <p className="text-sm text-white/40 mb-6">Location coming soon</p>
      ) : (
        <p className="text-sm text-white/60 mb-6">{loc.address}<br />{loc.city}, {loc.state} {loc.zip}</p>
      )}

      <div className="mb-8">
        <p className="font-heading text-xs uppercase tracking-widest text-white/40 mb-3">Programs</p>
        <div className="flex flex-wrap gap-2">
          {loc.programs.map(program => (
            <span key={program} className="text-xs text-white/60 border border-white/20 px-2 py-1">{program}</span>
          ))}
        </div>
      </div>

      {loc.status !== 'coming_soon' && (
        linked ? (
          <a href={`/${loc.slug}`} className="inline-block px-6 py-3 border border-white text-white font-heading text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
            Explore Location
          </a>
        ) : (
          <a href="#contact" className="inline-block px-6 py-3 border border-white text-white font-heading text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
            Get Started
          </a>
        )
      )}
    </div>
  )
}
