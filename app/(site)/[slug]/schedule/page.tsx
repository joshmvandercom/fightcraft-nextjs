import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageHero from '@/components/PageHero'
import LeadCapture from '@/components/LeadCapture'
import Testimonials from '@/components/Testimonials'
import SetLocation from '../SetLocation'
import { getLocations, getSchedule, getTestimonials } from '@/lib/content'

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

  const schedule = getSchedule(slug)
  const testimonials = getTestimonials()

  return (
    <>
      <SetLocation slug={slug} />
      <PageHero title="Schedule" subtitle={`FightCraft ${location.name}`} />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {schedule.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
              {schedule.map(day => (
                <div key={day.day}>
                  <h3 className="font-heading text-lg uppercase font-bold tracking-tight text-black mb-4 pb-3 border-b-2 border-black">
                    {day.day}
                  </h3>
                  <div className="space-y-3">
                    {day.classes.map((cls, i) => (
                      <div key={i} className="py-2">
                        <p className="font-heading text-xs uppercase tracking-wider text-black/50">{cls.time}</p>
                        <p className="text-sm text-black/80 mt-0.5">{cls.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="font-heading text-3xl uppercase font-bold tracking-tight text-black mb-6">Schedule Coming Soon</h2>
              <p className="text-lg text-black/60 leading-relaxed">
                Contact us for the latest class times at FightCraft {location.name}.
              </p>
            </div>
          )}

          <div className="mt-16 pt-12 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-black/50">Schedule subject to change. Contact us for the most up-to-date times.</p>
            <div className="flex gap-4">
              {location.phone && (
                <a href={`tel:${location.phone}`} className="inline-block px-6 py-3 bg-black text-white font-heading text-xs uppercase tracking-widest hover:bg-black/80 transition-colors">
                  Call Us
                </a>
              )}
              <a href={`mailto:${location.email}`} className="inline-block px-6 py-3 border border-black text-black font-heading text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <LeadCapture selectedLocation={location.slug} />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
