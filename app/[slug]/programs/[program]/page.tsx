import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageHero from '@/components/PageHero'
import Testimonials from '@/components/Testimonials'
import LeadCapture from '@/components/LeadCapture'
import SetLocation from '../../SetLocation'
import { getLocations, getPrograms, getTestimonials } from '@/lib/content'

export function generateStaticParams() {
  const locations = getLocations()
  const programs = getPrograms()
  const paths: { slug: string; program: string }[] = []

  locations.forEach(loc => {
    programs
      .filter(p => p.locations.includes(loc.slug))
      .forEach(p => {
        paths.push({ slug: loc.slug, program: p.slug })
      })
  })

  return paths
}

export function generateMetadata({ params }: { params: Promise<{ slug: string; program: string }> }): Promise<Metadata> {
  return params.then(({ slug, program: programSlug }) => {
    const loc = getLocations().find(l => l.slug === slug)
    const prog = getPrograms().find(p => p.slug === programSlug)
    return {
      title: prog && loc ? `${prog.name} in ${loc.city} | FightCraft` : 'FightCraft',
      description: prog ? `${prog.header_subtitle}. ${prog.short_description}` : '',
    }
  })
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string; program: string }> }) {
  const { slug, program: programSlug } = await params
  const location = getLocations().find(l => l.slug === slug)
  const program = getPrograms().find(p => p.slug === programSlug)
  if (!location || !program) notFound()

  const testimonials = getTestimonials()

  return (
    <>
      <SetLocation slug={slug} />
      <PageHero title={program.header_title} subtitle={program.header_subtitle} image={program.image} tall />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-black mb-8">{program.primary_title}</h2>
          <p className="text-black/60 leading-relaxed mb-6">{program.primary_text_1}</p>
          <p className="text-black/60 leading-relaxed">{program.primary_text_2}</p>
        </div>
      </section>

      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-8">{program.callout_title}</h2>
          <p className="text-white/60 leading-relaxed">{program.callout_text}</p>
        </div>
      </section>

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-8">What You&apos;ll Get</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.bullets.map(bullet => (
              <div key={bullet} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-black shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-black/70">{bullet}</span>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`/${location.slug}`} className="inline-block font-heading text-xs uppercase tracking-widest text-black/40 hover:text-black transition-colors">
              &larr; Back to FightCraft {location.name}
            </a>
          </div>
        </div>
      </section>

      <Testimonials testimonials={testimonials} />
      <LeadCapture selectedLocation={location.slug} />
    </>
  )
}
