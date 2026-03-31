import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageHero from '@/components/PageHero'
import LeadCapture from '@/components/LeadCapture'
import SetLocation from '../SetLocation'
import { getLocations } from '@/lib/content'

export function generateStaticParams() {
  return getLocations().map(loc => ({ slug: loc.slug }))
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const loc = getLocations().find(l => l.slug === slug)
    return {
      title: loc ? `Schedule | FightCraft ${loc.name}` : 'Schedule | FightCraft',
      description: loc ? `View the class schedule at FightCraft ${loc.name} in ${loc.city}, ${loc.state}.` : '',
    }
  })
}

export default async function SchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const location = getLocations().find(l => l.slug === slug)
  if (!location) notFound()

  return (
    <>
      <SetLocation slug={slug} />
      <PageHero title="Schedule" subtitle={`FightCraft ${location.name}`} />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {location.status === 'coming_soon' ? (
            <>
              <h2 className="font-heading text-3xl uppercase font-bold tracking-tight text-black mb-6">Coming Soon</h2>
              <p className="text-black/60 leading-relaxed mb-8">
                We&apos;re working on bringing FightCraft to {location.city}. Sign up below to be notified when we launch our schedule.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-heading text-3xl uppercase font-bold tracking-tight text-black mb-6">Class Schedule</h2>
              <p className="text-black/60 leading-relaxed mb-8">
                Contact us for the latest class times at FightCraft {location.name}. We offer classes throughout the week to fit your schedule.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {location.phone && (
                  <a href={`tel:${location.phone}`} className="inline-block px-8 py-3 bg-black text-white font-heading text-sm uppercase tracking-widest hover:bg-black/80 transition-colors">Call Us</a>
                )}
                <a href={`mailto:${location.email}`} className="inline-block px-8 py-3 border border-black text-black font-heading text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Email Us</a>
              </div>
            </>
          )}

          <div className="mt-12">
            <a href={`/${location.slug}`} className="inline-block font-heading text-xs uppercase tracking-widest text-black/40 hover:text-black transition-colors">
              &larr; Back to FightCraft {location.name}
            </a>
          </div>
        </div>
      </section>

      <LeadCapture selectedLocation={location.slug} />
    </>
  )
}
