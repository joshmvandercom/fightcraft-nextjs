import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import Accordion from '@/components/Accordion'
import LeadCapture from '@/components/LeadCapture'
import Testimonials from '@/components/Testimonials'
import { getFaqs, getTestimonials } from '@/lib/content'

export const metadata: Metadata = {
  title: 'FAQ | FightCraft',
  description: 'Frequently asked questions about training at FightCraft. Beginners welcome, no contracts, all ages.',
}

export default function FAQPage() {
  const faqs = getFaqs()
  const testimonials = getTestimonials()

  return (
    <>
      <PageHero title="FAQ" subtitle="Frequently Asked Questions" />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Accordion items={faqs} />
          <div className="mt-16 pt-12 border-t border-black/10 text-center">
            <p className="text-black/50 mb-4">Still have questions?</p>
            <a href="mailto:friends@fightcraft.com" className="inline-block px-8 py-3 bg-black text-white font-heading text-sm uppercase tracking-widest hover:bg-black/80 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <LeadCapture />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
