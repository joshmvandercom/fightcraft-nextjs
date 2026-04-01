import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Thank You | FightCraft',
  description: 'Thanks for reaching out. Here is what happens next.',
}

export default function NextStepsPage() {
  return (
    <>
      <PageHero title="Thank You" subtitle="We got your info" />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-black mb-6">
            Here&apos;s What Happens Next
          </h2>
          <div className="space-y-6 text-lg text-black/60 leading-relaxed">
            <p>
              One of our coaches will reach out within 24 hours to answer any questions and help you find the right program.
            </p>
            <p>
              In the meantime, feel free to explore our programs or check the schedule at your location.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a href="/locations" className="inline-block px-10 py-4 bg-black text-white font-heading text-sm uppercase tracking-widest hover:bg-black/80 transition-colors">
              Explore Locations
            </a>
            <a href="/" className="inline-block px-10 py-4 border border-black text-black font-heading text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
