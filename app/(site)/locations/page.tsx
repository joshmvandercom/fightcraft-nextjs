import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import { getLocations } from '@/lib/content'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Locations | FightCraft',
  description: 'Find a FightCraft gym near you. Locations in San Jose CA, Merced CA, and Brevard NC.',
}

async function getPendingApplications() {
  try {
    return await prisma.lead.count({ where: { source: 'affiliate' } })
  } catch {
    return 0
  }
}

export default async function LocationsPage() {
  const locations = getLocations()
  const pendingApps = await getPendingApplications()

  return (
    <>
      <PageHero title="Our Locations" subtitle="Find Your Gym" />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-heading text-xs uppercase tracking-widest text-black/50 mb-8">Official Locations</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {locations.map(loc => (
              <div key={loc.slug} className="border-[4px] border-black h-full">
                <div className="p-8 flex flex-col h-full">
                  <h3 className="font-display text-6xl uppercase tracking-tight text-black mb-1">{loc.name}</h3>
                  <p className="font-heading text-sm uppercase tracking-[0.2em] text-black/50 mb-4">{loc.city}, {loc.state}</p>

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
        </div>
      </section>

      {/* Affiliate callout */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full mb-6">
            <p className="font-heading text-xs uppercase tracking-widest text-white/70">Launching Soon</p>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-4">
            FightCraft Affiliates
          </h2>
          <p className="text-white/50 mb-6 max-w-2xl mx-auto">
            We&apos;re opening the playbook. Proven curriculum, marketing systems, and business coaching for gym owners who want to grow. More locations coming soon.
          </p>
          <p className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            {pendingApps > 0 ? pendingApps : 36}
          </p>
          <p className="font-heading text-sm uppercase tracking-widest text-white/50 mb-8">
            Applications Pending
          </p>
          <a
            href="/affiliate"
            className="inline-block py-4 px-12 bg-white text-black font-heading text-base font-bold uppercase tracking-widest rounded-lg hover:bg-white/90 transition-colors"
          >
            Apply Now
          </a>
        </div>
      </section>
    </>
  )
}
