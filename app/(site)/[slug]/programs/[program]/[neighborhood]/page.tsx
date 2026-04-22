import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Testimonials from '@/components/Testimonials'
import LeadCapture from '@/components/LeadCapture'
import SetLocation from '../../../SetLocation'
import CTAButton from '@/components/CTAButton'
import AutoPlayVideo from '@/components/AutoPlayVideo'
import QuickForm from '@/components/QuickForm'
import { getLocations, getPrograms, getTestimonials, getNeighborhoods } from '@/lib/content'

type Params = { slug: string; program: string; neighborhood: string }

export function generateStaticParams() {
  const locations = getLocations()
  const programs = getPrograms()
  const paths: Params[] = []

  locations.forEach(loc => {
    const neighborhoods = getNeighborhoods(loc.slug)
    programs
      .filter(p => p.location === loc.slug)
      .forEach(p => {
        neighborhoods.forEach(n => {
          paths.push({ slug: loc.slug, program: p.slug, neighborhood: n.slug })
        })
      })
  })

  return paths
}

export function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return params.then(({ slug, program: programSlug, neighborhood: neighborhoodSlug }) => {
    const loc = getLocations().find(l => l.slug === slug)
    const prog = getPrograms().find(p => p.slug === programSlug && p.location === slug)
    const hood = getNeighborhoods(slug).find(n => n.slug === neighborhoodSlug)

    if (!prog || !loc || !hood) return { title: 'FightCraft' }

    const titlePrefix = hood.preposition === 'in'
      ? `${prog.name} in ${hood.name}`
      : `${prog.name} Near ${hood.name}`

    const title = `${titlePrefix} | FightCraft ${loc.name}`
    const description = hood.preposition === 'in'
      ? `${prog.name} classes in ${hood.name}, ${loc.city}. ${prog.short_description}`
      : `${prog.name} classes near ${hood.name}. ${hood.serving}. ${prog.short_description} Just ${hood.distance} from ${hood.name}.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: prog.image, width: 1200, height: 630 }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [prog.image],
      },
    }
  })
}

export default async function NeighborhoodProgramPage({ params }: { params: Promise<Params> }) {
  const { slug, program: programSlug, neighborhood: neighborhoodSlug } = await params
  const location = getLocations().find(l => l.slug === slug)
  const program = getPrograms().find(p => p.slug === programSlug && p.location === slug)
  const neighborhood = getNeighborhoods(slug).find(n => n.slug === neighborhoodSlug)
  if (!location || !program || !neighborhood) notFound()

  const testimonials = getTestimonials()
  const allNeighborhoods = getNeighborhoods(slug)
  const otherNeighborhoods = allNeighborhoods.filter(n => n.slug !== neighborhoodSlug)
  const isLocal = neighborhood.preposition === 'in'

  return (
    <>
      <SetLocation slug={slug} />

      {/* Hero */}
      <section className="relative min-h-screen md:min-h-[70vh] flex flex-col overflow-hidden">
        {program.hero_video ? (
          <div className="absolute inset-0">
            <AutoPlayVideo
              src={program.hero_video}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover grayscale"
            />
            <div className="absolute inset-0 bg-black/70" />
          </div>
        ) : (
          <div className="absolute inset-0">
            <img src={program.image} alt="" className="w-full h-full object-cover grayscale" />
            <div className="absolute inset-0 bg-black/80" />
          </div>
        )}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20 flex-1 flex flex-col items-center justify-center">
          <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl uppercase font-bold tracking-tight text-white">
            {isLocal
              ? <>{program.name} <span className="whitespace-nowrap">in {neighborhood.name}</span></>
              : <>{program.name} <span className="whitespace-nowrap">Near {neighborhood.name}</span></>}
          </h1>
          <p className="font-heading text-lg md:text-xl uppercase tracking-[0.3em] text-white/50 mt-6">
            {isLocal
              ? neighborhood.serving
              : <><span className="whitespace-nowrap">{neighborhood.distance}</span> from <span className="whitespace-nowrap">{neighborhood.name}</span></>}
          </p>
        </div>
        <div className="relative z-10">
          <QuickForm />
        </div>
      </section>

      {/* Primary content */}
      <section className="bg-neutral-100 text-black py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl uppercase font-bold tracking-tight text-black mb-12 text-center max-w-5xl mx-auto">
            {isLocal
              ? <><span className="whitespace-nowrap">{neighborhood.name}&apos;s</span> Home for <span className="whitespace-nowrap">{program.name}</span></>
              : <>{program.name} Training for <span className="whitespace-nowrap">{neighborhood.name} Residents</span></>}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <p className="text-lg text-black/60 leading-relaxed">
              {neighborhood.description}
            </p>
            <p className="text-lg text-black/60 leading-relaxed">
              {program.primary_text_2}
            </p>
          </div>

          {/* Location callout */}
          <div className="bg-white border border-black/10 p-8 mb-12 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-black/50 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-heading text-sm uppercase tracking-widest font-bold mb-1">
                  FightCraft {location.name}
                </p>
                <p className="text-sm text-black/60">
                  {location.address}, {location.city}, {location.state} {location.zip}
                </p>
                <p className="text-sm text-black/50 mt-1">
                  <span className="whitespace-nowrap">{neighborhood.distance}</span> from <span className="whitespace-nowrap">{neighborhood.name}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <CTAButton className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white font-heading text-base font-bold uppercase tracking-widest hover:bg-black/80 transition-colors cursor-pointer">
              <span>&rarr;</span>
              Request More Information
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Callout section */}
      {program.callout_video ? (
        <div className="bg-black lg:bg-transparent">
          <div className="relative max-w-5xl mx-auto overflow-visible">
            <div className="hidden lg:block absolute left-[-50vw] right-[-50vw] top-0 bottom-0 bg-black" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6">
              <div className="py-16 lg:py-24">
                <h2 className="font-heading text-2xl md:text-3xl uppercase font-bold tracking-tight text-white mb-6">{program.callout_title}</h2>
                <p className="text-base text-white/60 leading-relaxed">{program.callout_text}</p>
              </div>
              <div className="flex justify-center lg:justify-end pb-6 lg:pb-0 lg:my-[-24px]">
                <div className="group w-[300px] md:w-[360px] rounded-3xl overflow-hidden shadow-2xl cursor-pointer">
                  <AutoPlayVideo
                    src={program.callout_video}
                    className="w-full aspect-[9/16] object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section className="bg-white text-black py-24 px-6">
          <div className="max-w-6xl mx-auto relative">
            <div className="w-full lg:w-[60%]">
              <div className="aspect-[4/3]">
                <img
                  src={program.callout_image || program.image}
                  alt={`${program.name} training at FightCraft ${location.name}`}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            </div>
            <div className="relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-[50%] mt-[-3rem] lg:mt-0 mx-6 lg:mx-0">
              <div className="bg-black text-white p-10 md:p-14">
                <h2 className="font-heading text-2xl md:text-4xl uppercase font-bold tracking-tight mb-6">{program.callout_title}</h2>
                <p className="text-base text-white/60 leading-relaxed">{program.callout_text}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SEO content */}
      <section className="bg-neutral-100 text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="text-base text-black/60 leading-relaxed">
              {isLocal
                ? `FightCraft is located right in ${neighborhood.name} at ${location.address}, ${location.city}, ${location.state} ${location.zip}. We offer ${program.name.toLowerCase()} classes for all levels, from complete beginners to competitive fighters. Drop in before or after work, or train on weekends.`
                : `Looking for ${program.name.toLowerCase()} near ${neighborhood.name}? FightCraft ${location.name} is just ${neighborhood.distance} away at ${location.address}, ${location.city}, ${location.state} ${location.zip}. We offer classes for all levels, from complete beginners to competitive fighters.`}
            </p>
          </div>

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

          <div>
            <p className="text-base text-black/60 leading-relaxed">
              {isLocal
                ? `Whether you're a complete beginner or an experienced martial artist, FightCraft in ${neighborhood.name} has a place for you. Our coaches work with every skill level and our community welcomes everyone. Come see what makes FightCraft different.`
                : `${neighborhood.serving} looking for ${program.name.toLowerCase()} training. Whether you're a complete beginner or experienced martial artist, FightCraft ${location.name} has a place for you. The ${neighborhood.distance} from ${neighborhood.name} is worth it.`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12">
          <a href={`/${location.slug}/programs/${program.slug}`} className="inline-block font-heading text-xs uppercase tracking-widest text-black/50 hover:text-black transition-colors">
            &larr; Back to {program.name} at <span className="whitespace-nowrap">FightCraft {location.name}</span>
          </a>
        </div>
      </section>

      {/* Nearby neighborhoods */}
      {otherNeighborhoods.length > 0 && (
        <section className="bg-white text-black py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="font-heading text-lg uppercase font-bold tracking-tight text-black mb-6">
              {program.name} {isLocal ? 'Also Serving' : 'Near Other'} <span className="whitespace-nowrap">{location.name} Neighborhoods</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {otherNeighborhoods.map(n => (
                <a
                  key={n.slug}
                  href={`/${location.slug}/programs/${program.slug}/${n.slug}`}
                  className="text-sm text-black/60 bg-black/5 px-4 py-2 hover:bg-black/10 transition-colors"
                >
                  {program.name} {n.preposition === 'in' ? 'in' : 'near'} {n.name}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <LeadCapture selectedLocation={location.slug} />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
