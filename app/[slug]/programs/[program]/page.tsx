import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageHero from '@/components/PageHero'
import Testimonials from '@/components/Testimonials'
import LeadCapture from '@/components/LeadCapture'
import SetLocation from '../../SetLocation'
import CTAButton from '@/components/CTAButton'
import { getLocations, getPrograms, getTestimonials } from '@/lib/content'

export function generateStaticParams() {
  const locations = getLocations()
  const programs = getPrograms()
  const paths: { slug: string; program: string }[] = []

  locations.forEach(loc => {
    programs
      .filter(p => p.location === loc.slug)
      .forEach(p => {
        paths.push({ slug: loc.slug, program: p.slug })
      })
  })

  return paths
}

export function generateMetadata({ params }: { params: Promise<{ slug: string; program: string }> }): Promise<Metadata> {
  return params.then(({ slug, program: programSlug }) => {
    const loc = getLocations().find(l => l.slug === slug)
    const prog = getPrograms().find(p => p.slug === programSlug && p.location === slug)
    const title = prog && loc ? `${prog.name} in ${loc.city} | FightCraft` : 'FightCraft'
    const description = prog ? `${prog.header_subtitle}. ${prog.short_description}` : ''
    return {
      title,
      description,
      openGraph: prog ? {
        title,
        description,
        images: [{ url: prog.image, width: 1200, height: 630 }],
        type: 'website',
      } : undefined,
      twitter: prog ? {
        card: 'summary_large_image',
        title,
        description,
        images: [prog.image],
      } : undefined,
    }
  })
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string; program: string }> }) {
  const { slug, program: programSlug } = await params
  const location = getLocations().find(l => l.slug === slug)
  const program = getPrograms().find(p => p.slug === programSlug && p.location === slug)
  if (!location || !program) notFound()

  const testimonials = getTestimonials()

  return (
    <>
      <SetLocation slug={slug} />
      <PageHero title={program.header_title} subtitle={program.header_subtitle} image={program.image} tall />

      {/* Primary content — title + two-column body + CTA */}
      <section className="bg-neutral-100 text-black py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl uppercase font-bold tracking-tight text-black mb-12 text-center max-w-5xl mx-auto">
            {program.primary_title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <p className="text-lg text-black/60 leading-relaxed">
              {program.primary_text_1}
            </p>
            <p className="text-lg text-black/60 leading-relaxed">
              {program.primary_text_2}
            </p>
          </div>

          <div className="flex justify-center">
            <CTAButton className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white font-heading text-base font-bold uppercase tracking-widest hover:bg-black/80 transition-colors cursor-pointer">
              <span>&rarr;</span>
              Request More Information
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Callout — image with overlapping card */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-6xl mx-auto relative">
          {/* Image — takes up ~60% width */}
          <div className="w-full lg:w-[60%]">
            <div className="aspect-[4/3]">
              <img
                src={program.image}
                alt={program.name}
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>

          {/* Overlapping card */}
          <div className="relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-[50%] mt-[-3rem] lg:mt-0 mx-6 lg:mx-0">
            <div className="bg-black text-white p-10 md:p-14">
              <h2 className="font-heading text-2xl md:text-4xl uppercase font-bold tracking-tight mb-6">{program.callout_title}</h2>
              <p className="text-base text-white/60 leading-relaxed">{program.callout_text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO content — 3 column: text | bullets | closing */}
      <section className="bg-neutral-100 text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left — SEO body text */}
          <div>
            {program.seo_text && (
              <p className="text-base text-black/60 leading-relaxed">{program.seo_text}</p>
            )}
          </div>

          {/* Center — bullets */}
          <div>
            <h3 className="font-heading text-lg uppercase font-bold tracking-tight text-black mb-6">
              Why {program.name} at FightCraft?
            </h3>
            <div className="space-y-3">
              {program.bullets.map(bullet => (
                <div key={bullet} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-black shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-black/70 font-medium">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — closing text */}
          <div>
            {program.seo_closing && (
              <p className="text-base text-black/60 leading-relaxed">{program.seo_closing}</p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12">
          <a href={`/${location.slug}`} className="inline-block font-heading text-xs uppercase tracking-widest text-black/50 hover:text-black transition-colors">
            &larr; Back to FightCraft {location.name}
          </a>
        </div>
      </section>

      <LeadCapture selectedLocation={location.slug} />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
