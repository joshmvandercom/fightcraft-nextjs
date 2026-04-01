import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import { getLocations } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Locations | FightCraft',
  description: 'Find a FightCraft gym near you. Locations in San Jose CA, Merced CA, and Brevard NC.',
}

export default function LocationsPage() {
  const locations = getLocations()

  return (
    <>
      <PageHero title="Our Locations" subtitle="Find Your Gym" />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map(loc => (
            <div key={loc.slug} className="border-[4px] border-black h-full">
              <div className="p-8 flex flex-col h-full">
                <h3 className="font-display text-6xl uppercase tracking-tight text-black mb-2">{loc.name}</h3>

                <div className="w-10 h-px bg-black mb-6" />

                <p className="text-sm text-black/60 mb-6">{loc.address}</p>

                <div className="mb-8">
                  <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-black/50 mb-3">Programs</p>
                  <div className="flex flex-wrap gap-2">
                    {loc.programs.map(program => (
                      <span key={program} className="text-sm text-black/70 bg-black/5 px-3 py-1.5">{program}</span>
                    ))}
                  </div>
                </div>

                <a href={`/${loc.slug}`} className="mt-auto block w-full py-4 bg-black text-white text-center font-heading text-base font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
                  Explore Location &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
