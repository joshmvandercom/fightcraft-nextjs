import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import Testimonials from '@/components/Testimonials'
import LeadCapture from '@/components/LeadCapture'
import { getTestimonials } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Reviews | FightCraft',
  description: 'See what our members say about training at FightCraft. Real Google reviews from real people.',
}

export default function ReviewsPage() {
  const testimonials = getTestimonials()

  return (
    <>
      <PageHero title="Reviews" subtitle="What Our Members Say" />
      <Testimonials testimonials={testimonials} layout="grid" />
      <LeadCapture />
    </>
  )
}
