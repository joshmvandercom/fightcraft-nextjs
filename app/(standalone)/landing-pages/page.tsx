import { getLocations, getOfferSlugs, getProgramSlugs, getOffer, getProgramConfig } from '@/lib/content'

export default function LandingPagesIndex() {
  const locations = getLocations()
  const offerSlugs = getOfferSlugs()
  const programSlugs = getProgramSlugs()

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-4xl uppercase font-bold tracking-tight mb-2">Landing Pages</h1>
        <p className="text-black/50 text-sm mb-8">Internal index. Not crawlable.</p>

        {locations.map(loc => (
          <div key={loc.slug} className="mb-12">
            <h2 className="font-heading text-2xl uppercase font-bold tracking-tight mb-4 pb-2 border-b border-black/10">
              {loc.name}
            </h2>

            <div className="space-y-6">
              {offerSlugs.map(offerSlug => {
                const offer = getOffer(offerSlug)
                if (!offer) return null
                return (
                  <div key={offerSlug}>
                    <h3 className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">{offerSlug}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {programSlugs.map(progSlug => {
                        const prog = getProgramConfig(progSlug)
                        if (!prog) return null
                        const url = `/${loc.slug}/${progSlug}/${offerSlug}`
                        const headline = offer.headline_template.replace('{program}', prog.display_name)
                        return (
                          <a
                            key={progSlug}
                            href={url}
                            className="block p-3 border border-black/10 hover:border-black/30 transition-colors"
                          >
                            <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">{headline}</p>
                            <p className="text-[10px] text-black/40">{url}</p>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Standalone pages */}
              <div>
                <h3 className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">Other</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <a href={`/${loc.slug}/beginner-kickboxing`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Beginner Kickboxing (Legacy)</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/beginner-kickboxing</p>
                  </a>
                  <a href={`/${loc.slug}/quiz`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Quiz</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/quiz</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
