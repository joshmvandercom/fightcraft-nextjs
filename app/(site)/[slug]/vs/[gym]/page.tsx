import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocations, getComparisons, getComparison } from '@/lib/content'
import LeadCapture from '@/components/LeadCapture'

export function generateStaticParams() {
  const locations = getLocations()
  const params: { slug: string; gym: string }[] = []
  for (const loc of locations) {
    const comps = getComparisons(loc.slug)
    for (const comp of comps) {
      params.push({ slug: loc.slug, gym: comp.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; gym: string }> }): Promise<Metadata> {
  const { slug, gym } = await params
  const loc = getLocations().find(l => l.slug === slug)
  const comp = getComparison(slug, gym)
  if (!loc || !comp) return { title: 'FightCraft' }

  const title = `FightCraft vs ${comp.short_name} | ${loc.city} Martial Arts Comparison`
  const description = `Comparing FightCraft ${loc.name} and ${comp.name}. Programs, coaching, facilities, and what matters when choosing a martial arts gym in ${loc.city}.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

function Check() {
  return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}

function X() {
  return <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string; gym: string }> }) {
  const { slug, gym } = await params
  const loc = getLocations().find(l => l.slug === slug)
  const comp = getComparison(slug, gym)
  if (!loc || !comp) notFound()

  const features = [
    { label: 'Kickboxing', fc: true, them: comp.programs.some(p => p.toLowerCase().includes('kickboxing')) },
    { label: 'Muay Thai', fc: true, them: comp.programs.some(p => p.toLowerCase().includes('muay thai')) },
    { label: 'Brazilian Jiu Jitsu', fc: true, them: comp.programs.some(p => p.toLowerCase().includes('bjj') || p.toLowerCase().includes('jiu jitsu') || p.toLowerCase().includes('jiu-jitsu')) },
    { label: 'No-Gi Jiu Jitsu', fc: true, them: comp.has_nogi },
    { label: 'MMA', fc: true, them: comp.has_mma },
    { label: 'Wrestling', fc: true, them: comp.has_wrestling },
    { label: 'Kids Programs', fc: true, them: comp.has_kids },
    { label: '4.9 Google Rating', fc: true, them: comp.google_rating >= 4.9 },
  ]

  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-heading text-xs uppercase tracking-widest text-white/40 mb-4">
            Martial Arts Gym Comparison
          </p>
          <h1 className="font-heading text-4xl md:text-6xl uppercase font-bold tracking-tight mb-6">
            FightCraft vs {comp.short_name}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Choosing a martial arts gym is a big decision. Here&apos;s an honest look at how FightCraft {loc.name} compares to {comp.name} so you can make the right call.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-white/5">
              <div className="p-4" />
              <div className="p-4 text-center">
                <p className="font-heading text-sm uppercase tracking-widest font-bold">FightCraft</p>
              </div>
              <div className="p-4 text-center">
                <p className="font-heading text-sm uppercase tracking-widest font-bold text-white/50">{comp.short_name}</p>
              </div>
            </div>

            {/* Rows */}
            {features.map((f, i) => (
              <div key={f.label} className={`grid grid-cols-3 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} border-t border-white/10`}>
                <div className="p-4 flex items-center">
                  <p className="text-sm text-white/70">{f.label}</p>
                </div>
                <div className="p-4 flex justify-center items-center">
                  {f.fc ? <Check /> : <X />}
                </div>
                <div className="p-4 flex justify-center items-center">
                  {f.them ? <Check /> : <X />}
                </div>
              </div>
            ))}

            {/* Ratings row */}
            <div className="grid grid-cols-3 border-t border-white/10">
              <div className="p-4 flex items-center">
                <p className="text-sm text-white/70">Google Reviews</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm font-bold">139+ reviews</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-white/50">{comp.google_reviews}+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What they do well */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl uppercase font-bold tracking-tight mb-8">
            What {comp.short_name} Does Well
          </h2>
          <div className="space-y-4">
            {comp.differentiators.map(d => (
              <div key={d} className="flex items-start gap-3">
                <Check />
                <p className="text-white/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where FightCraft stands out */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl uppercase font-bold tracking-tight mb-8">
            Where FightCraft Stands Out
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-lg uppercase font-bold mb-2">Complete Program Offering</h3>
              <p className="text-white/60">Kickboxing, Muay Thai, BJJ, No-Gi, MMA, Wrestling, and Kids programs — all under one roof. Most gyms specialize in one or two. We give you access to everything.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase font-bold mb-2">Modern, Purpose-Built Facility</h3>
              <p className="text-white/60">Clean mats, new equipment, and a space designed for training — not converted from something else. Our members consistently call it the nicest gym they&apos;ve trained at.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase font-bold mb-2">Coaching That Scales to You</h3>
              <p className="text-white/60">Whether you&apos;re day one or year five, our coaches meet you where you are. Small enough for personal attention, structured enough to push you forward.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase font-bold mb-2">Schedule Built for Working Professionals</h3>
              <p className="text-white/60">Early morning to late evening, seven days a week. We know you have a job, a family, and a life. Training should fit around it, not the other way around.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The honest take */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl uppercase font-bold tracking-tight mb-6">
            The Honest Take
          </h2>
          <p className="text-white/60 mb-4">
            {comp.name} is a legitimate gym with good people. If their specific focus is what you&apos;re looking for, they may be the right fit for you.
          </p>
          <p className="text-white/60 mb-4">
            But if you want access to every major martial art, a modern facility, and coaching that&apos;s built around your schedule and experience level — FightCraft was designed for exactly that.
          </p>
          <p className="text-white/60">
            The best way to know is to come try a class. No commitment, no pressure.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-4">
            See for yourself
          </h2>
          <p className="text-white/60 mb-8">
            Try a class at FightCraft {loc.name}. Your first one is on us.
          </p>
          <a
            href={`/${slug}/quiz`}
            className="inline-block px-10 py-4 bg-white text-black font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
          >
            Try a Free Class
          </a>
        </div>
      </section>

      <LeadCapture selectedLocation={slug} />
    </div>
  )
}
