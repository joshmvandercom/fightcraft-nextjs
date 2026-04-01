import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import Values from '@/components/Values'
import LeadCapture from '@/components/LeadCapture'
import Testimonials from '@/components/Testimonials'
import { getCoreValues, getTestimonials } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Core Values | FightCraft',
  description: 'The five core values that drive everything we do at FightCraft: Integrity, Stewardship, Trust, Kaizen, and Give Back.',
}

export default function CoreValuesPage() {
  const values = getCoreValues()
  const testimonials = getTestimonials()

  return (
    <>
      <PageHero title="Our Values" subtitle="What We Stand For" image="/images/home/bjj.webp" />
      <Values values={values} layout="full" />
      <LeadCapture />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
