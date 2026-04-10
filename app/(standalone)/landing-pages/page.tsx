import { getLocations, getOfferSlugs, getProgramSlugs, getOffer, getProgramConfig, getComparisons } from '@/lib/content'

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

              {/* Booking pages (GHL calendar embeds) */}
              <div>
                <h3 className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">Booking Pages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {programSlugs.map(progSlug => {
                    const prog = getProgramConfig(progSlug)
                    if (!prog) return null
                    const url = `/${loc.slug}/quiz/book?p=${prog.slug_value}`
                    return (
                      <a key={progSlug} href={url} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                        <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Book {prog.display_name}</p>
                        <p className="text-[10px] text-black/40">{url}</p>
                      </a>
                    )
                  })}
                  <a href={`/${loc.slug}/quiz/call`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Orientation Call</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/quiz/call</p>
                  </a>
                </div>
              </div>

              {/* Paid funnels */}
              <div>
                <h3 className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">Paid Funnels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <a href={`/${loc.slug}/web-special`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Web Special ($97)</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/web-special</p>
                  </a>
                  <a href={`/${loc.slug}/fast-pass`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">90-Day Fast Pass ($499)</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/fast-pass</p>
                  </a>
                  <a href={`/${loc.slug}/early-riser`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Early Riser ($33)</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/early-riser</p>
                  </a>
                  <a href={`/${loc.slug}/start`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Start ($33 / 50% off 3mo)</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/start</p>
                  </a>
                  <a href={`/${loc.slug}/gear-kickboxing`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Gear / Beginner Program</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/gear-kickboxing</p>
                  </a>
                  <a href={`/${loc.slug}/checkout/gear?session_id=dry_run`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Gear Upsell</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/checkout/gear</p>
                  </a>
                  <a href={`/${loc.slug}/checkout/accelerator?session_id=dry_run`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Accelerator Upsell</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/checkout/accelerator</p>
                  </a>
                  <a href={`/${loc.slug}/checkout/success?session_id=dry_run`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Purchase Success</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/checkout/success</p>
                  </a>
                </div>
              </div>

              {/* Quiz funnel */}
              <div>
                <h3 className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">Quiz Funnel</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <a href={`/${loc.slug}/quiz`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Quiz</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/quiz</p>
                  </a>
                  <a href={`/${loc.slug}/quiz/complete?p=kickboxing&e=A&c=A&o=A&v=A&r=A`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Quiz Complete (Sample)</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/quiz/complete</p>
                  </a>
                  <a href={`/${loc.slug}/quiz/call`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Orientation Call</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/quiz/call</p>
                  </a>
                  <a href={`/${loc.slug}/quiz/call-confirmed`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Call Confirmed</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/quiz/call-confirmed</p>
                  </a>
                  <a href={`/${loc.slug}/quiz/class-confirmed`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Class Confirmed</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/quiz/class-confirmed</p>
                  </a>
                </div>
              </div>

              {/* VS Comparisons */}
              {(() => {
                const comps = getComparisons(loc.slug)
                if (comps.length === 0) return null
                return (
                  <div>
                    <h3 className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">VS Comparisons</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {comps.map(comp => {
                        const url = `/${loc.slug}/vs/${comp.slug}`
                        return (
                          <a key={comp.slug} href={url} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                            <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">FightCraft vs {comp.short_name}</p>
                            <p className="text-[10px] text-black/40">{url}</p>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Legacy / other */}
              <div>
                <h3 className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">Other</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <a href={`/${loc.slug}/beginner-kickboxing`} className="block p-3 border border-black/10 hover:border-black/30 transition-colors">
                    <p className="font-heading text-xs uppercase tracking-widest font-bold mb-1">Beginner Kickboxing (Legacy)</p>
                    <p className="text-[10px] text-black/40">/{loc.slug}/beginner-kickboxing</p>
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
