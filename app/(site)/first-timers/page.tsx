import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import CTAButton from '@/components/CTAButton'
import Testimonials from '@/components/Testimonials'
import LeadCapture from '@/components/LeadCapture'
import { getTestimonials } from '@/lib/content'

export const metadata: Metadata = {
  title: 'First Timers | FightCraft',
  description: 'New to FightCraft? Here is what to expect and how to find out if our community is the right fit for you.',
}

const steps = [
  {
    num: '01',
    title: 'Reach Out',
    body: "Send us a message. We'll answer your questions about programs, schedule, and what training actually looks like. No pressure.",
    image: '/images/home/lian.jpeg',
  },
  {
    num: '02',
    title: 'Find Your Fit',
    body: "Everyone has different goals. Compete, get in shape, try something new. We'll help you find the right program for where you are.",
    image: '/images/home/carlos.jpeg',
  },
  {
    num: '03',
    title: 'Show Up',
    body: "Wear comfortable clothes and bring water. We provide gloves, wraps, and everything else. No experience necessary.",
    image: '/images/home/vern.jpeg',
  },
  {
    num: '04',
    title: 'Decide for Yourself',
    body: "After your first session, you'll know. If it's the right fit, we'll get you set up. If not, no hard feelings.",
    image: '/images/home/kickboxing.jpg',
  },
]

export default function FirstTimersPage() {
  const testimonials = getTestimonials()

  return (
    <>
      <PageHero
        title="New Here?"
        subtitle="Here's what to expect"
        image="/images/home/vern.jpeg"
        tall
      />

      {/* Intro */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-black mb-8">
            We Get It. Walking Into a Martial Arts Gym for the First Time Can Be Intimidating.
          </h2>
          <p className="text-lg text-black/60 leading-relaxed mb-6">
            Most of our members felt the same way before they started. No ego at the door. No deep end. Just a room full of regular people. Parents, professionals, students, who decided to do something different with their time.
          </p>
          <p className="text-lg text-black/60 leading-relaxed">
            Show up with an open mind and we&apos;ll take care of the rest.
          </p>
        </div>
      </section>

      {/* Steps with images */}
      <section className="bg-neutral-100 text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight text-black mb-16">
            How It Works
          </h2>
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={step.num} className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${i % 2 !== 0 ? 'md:direction-rtl' : ''}`}>
                <div className={i % 2 !== 0 ? 'md:order-2' : ''}>
                  <img src={step.image} alt={step.title} className="w-full aspect-[3/2] object-cover grayscale" />
                </div>
                <div className={i % 2 !== 0 ? 'md:order-1' : ''}>
                  <p className="font-heading text-6xl font-bold text-black/10 mb-2">{step.num}</p>
                  <h3 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-3">{step.title}</h3>
                  <p className="text-base text-black/60 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Good to know */}
      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-16">
            Good to Know
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3">No fitness required</h3>
              <p className="text-white/60 leading-relaxed">That&apos;s what the training is for. We meet you where you are. Within a few weeks you&apos;ll feel the difference.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3">Sparring is optional</h3>
              <p className="text-white/60 leading-relaxed">It happens on dedicated days. Most people eventually want to try it, but there&apos;s zero pressure.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3">No contracts</h3>
              <p className="text-white/60 leading-relaxed">Month-to-month with 30-day cancellation. We keep members because the training is worth it.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3">All ages welcome</h3>
              <p className="text-white/60 leading-relaxed">Kids, teens, and adults train at FightCraft. If you&apos;re above 7 years old, there&apos;s a class for you.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3">For striking classes</h3>
              <p className="text-white/60 leading-relaxed">Comfortable shorts and a t-shirt. We provide gloves, wraps, and any equipment you need. Free of charge.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3">For Jiu Jitsu</h3>
              <p className="text-white/60 leading-relaxed">Athletic shorts and any t-shirt. We&apos;ll help you find the right gi or no-gi gear if you stick with it.</p>
            </div>
          </div>
          <div className="mt-16">
            <CTAButton className="inline-block px-10 py-4 bg-white text-black font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors cursor-pointer">
              Let&apos;s Talk
            </CTAButton>
          </div>
        </div>
      </section>

      <LeadCapture />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
