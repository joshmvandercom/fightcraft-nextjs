import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageHero from '@/components/PageHero'
import Testimonials from '@/components/Testimonials'
import LeadCapture from '@/components/LeadCapture'
import SetLocation from './SetLocation'
import CTAButton from '@/components/CTAButton'
import ScrollRevealImage from '@/components/ScrollRevealImage'
import { getLocations, getPrograms, getTestimonials } from '@/lib/content'

export function generateStaticParams() {
  return getLocations().map(loc => ({ slug: loc.slug }))
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const loc = getLocations().find(l => l.slug === slug)
    const title = loc ? `FightCraft ${loc.name} | Martial Arts in ${loc.city}, ${loc.state}` : 'FightCraft'
    const description = loc ? `FightCraft ${loc.name} offers Kickboxing, Muay Thai, and more in ${loc.city}, ${loc.state}. All levels welcome.` : ''
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: '/images/home/kickboxing.jpg', width: 1200, height: 630 }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/images/home/kickboxing.jpg'],
      },
    }
  })
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locations = getLocations()
  const location = locations.find(l => l.slug === slug)
  if (!location) notFound()

  const testimonials = getTestimonials()
  const allPrograms = getPrograms()
  const locationPrograms = allPrograms.filter(p => p.location === slug)

  return (
    <>
      <SetLocation slug={slug} />
      <PageHero
        title={`FightCraft ${location.name}`}
        subtitle={location.status === 'coming_soon' ? 'Coming Soon' : `${location.city}, ${location.state}`}
        youtubeId={slug === 'san-jose' ? 'iimq3DGVEJE' : undefined}
        image="/images/home/kickboxing.jpg"
        tall
      />

      {/* Programs — Sticky left / scrolling right */}
      <section className="bg-white text-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          {/* Left — sticky on desktop */}
          <div className="lg:sticky lg:top-0 lg:h-screen flex items-start px-6 py-24 lg:pt-32">
            <div className="max-w-lg">
              <p className="font-heading text-xs uppercase tracking-[0.3em] text-black/50 mb-4">
                FIGHTCRAFT // {location.city.replace(/\s+/g, '_').toUpperCase()}_{location.state}
              </p>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight text-black mb-6">
                A Boutique MMA Academy for All Skill Levels
              </h2>
              <p className="text-lg text-black/60 leading-relaxed mb-4">
                At FightCraft, we teach actual combat techniques to everyone. Whether you&apos;re a seasoned fighter or just curious about a new hobby, we&apos;ve got you covered. Our expert coaches tailor your training to fit your goals, whether it&apos;s competitive fighting or personal fitness.
              </p>
              <p className="text-lg text-black/60 leading-relaxed mb-8">
                FightCraft stands apart because of our personalized approach and commitment to your growth. We offer a supportive community that elevates your training across a variety of martial arts disciplines.
              </p>
              <CTAButton className="inline-block px-10 py-4 bg-black text-white font-heading text-sm uppercase tracking-widest hover:bg-black/80 transition-colors cursor-pointer">
                Request More Information
              </CTAButton>
            </div>
          </div>

          {/* Right — scrolling program cards */}
          <div className="px-6 py-12 lg:py-24 space-y-6">
            {locationPrograms.map(program => (
              <a
                key={program.slug}
                href={`/${location.slug}/programs/${program.slug}`}
                className="group block relative overflow-hidden aspect-[16/10]"
              >
                <ScrollRevealImage
                  src={program.image}
                  alt={program.name}
                  className="w-full h-full object-cover group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-500" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-white mb-2">
                    {program.name}
                  </h3>
                  <p className="text-sm text-white/70 max-w-md leading-relaxed">
                    {program.short_description}
                  </p>
                  <span className="font-heading text-xs uppercase tracking-widest text-white/60 group-hover:text-white transition-colors mt-4">
                    Learn More &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Location Info */}
      {location.status !== 'coming_soon' && (
        <section className="bg-neutral-100 text-black py-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <p className="font-heading text-xs uppercase tracking-widest text-black/50 mb-3">Address</p>
              <p className="text-black/70">{location.address}<br />{location.city}, {location.state} {location.zip}</p>
            </div>
            {location.phone && (
              <div>
                <p className="font-heading text-xs uppercase tracking-widest text-black/50 mb-3">Phone</p>
                <a href={`tel:${location.phone}`} className="text-black/70 hover:text-black transition-colors">{location.phone}</a>
              </div>
            )}
            <div>
              <p className="font-heading text-xs uppercase tracking-widest text-black/50 mb-3">Email</p>
              <a href={`mailto:${location.email}`} className="text-black/70 hover:text-black transition-colors">{location.email}</a>
            </div>
            {location.instagram && (
              <div>
                <p className="font-heading text-xs uppercase tracking-widest text-black/50 mb-3">Instagram</p>
                <p className="text-black/70">{location.instagram}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {location.status === 'coming_soon' && (
        <section className="bg-neutral-100 text-black py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-4xl uppercase font-bold tracking-tight text-black mb-6">Coming Soon</h2>
            <p className="text-lg text-black/60 leading-relaxed">
              We&apos;re bringing FightCraft to {location.city}. Sign up below to be the first to know when we open our doors.
            </p>
          </div>
        </section>
      )}

      <LeadCapture selectedLocation={location.slug} />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
