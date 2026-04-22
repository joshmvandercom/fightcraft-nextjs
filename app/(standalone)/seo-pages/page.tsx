import { getLocations, getPrograms, getNeighborhoods } from '@/lib/content'

export default function SEOPagesIndex() {
  const locations = getLocations()
  const programs = getPrograms()

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-4xl uppercase font-bold tracking-tight mb-2">SEO Pages</h1>
        <p className="text-black/50 text-sm mb-8">Internal index. Neighborhood program pages for search.</p>

        {locations.map(loc => {
          const neighborhoods = getNeighborhoods(loc.slug)
          if (neighborhoods.length === 0) return null
          const locationPrograms = programs.filter(p => p.location === loc.slug)
          const inCount = neighborhoods.filter(n => n.preposition === 'in').length
          const nearCount = neighborhoods.filter(n => n.preposition === 'near').length

          return (
            <div key={loc.slug} className="mb-12">
              <h2 className="font-heading text-2xl uppercase font-bold tracking-tight mb-4 pb-2 border-b border-black/10">
                {loc.name}
              </h2>

              <p className="text-sm text-black/50 mb-6">
                {neighborhoods.length} neighborhoods ({inCount} local, {nearCount} nearby) &times; {locationPrograms.length} programs = {neighborhoods.length * locationPrograms.length} pages
              </p>

              <div className="space-y-8">
                {locationPrograms.map(prog => (
                  <div key={prog.slug}>
                    <h3 className="font-heading text-sm uppercase tracking-widest text-black/50 mb-3">{prog.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {neighborhoods.map(hood => {
                        const url = `/${loc.slug}/programs/${prog.slug}/${hood.slug}`
                        const label = hood.preposition === 'in'
                          ? `${prog.name} in ${hood.name}`
                          : `${prog.name} Near ${hood.name}`
                        return (
                          <a
                            key={hood.slug}
                            href={url}
                            className="block p-3 border border-black/10 hover:border-black/30 transition-colors"
                          >
                            <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">
                              {label}
                            </p>
                            <p className="text-[10px] text-black/40">{url}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${hood.preposition === 'in' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {hood.preposition === 'in' ? 'LOCAL' : 'NEAR'}
                              </span>
                              <span className="text-[10px] text-black/30">{hood.distance}</span>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
