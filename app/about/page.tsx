import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import Testimonials from '@/components/Testimonials'
import LeadCapture from '@/components/LeadCapture'
import { getTestimonials } from '@/lib/content'

export const metadata: Metadata = {
  title: 'About Us | FightCraft',
  description: "Learn about FightCraft's mission, culture, and what makes our martial arts community special.",
}

export default function AboutPage() {
  const testimonials = getTestimonials()

  return (
    <>
      <PageHero title="What is FightCraft?" subtitle="Break the Routine. Transform Yourself." image="/images/home/carlos.jpeg" tall />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img src="/images/home/vern.jpeg" alt="Training at FightCraft" className="w-full grayscale" />
          </div>
          <div>
            <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight text-black mb-6">All Levels Welcome</h2>
            <p className="text-black/60 leading-relaxed mb-4">Whether you&apos;re stepping onto the mat for the first time or you&apos;ve been training for years, FightCraft is built for you. Our culture is rooted in making complete beginners feel at home while challenging experienced fighters to reach new heights.</p>
            <p className="text-black/60 leading-relaxed">Every class is designed so you can train at your own pace, with coaches who pay attention to where you are in your journey and help you get to the next level.</p>
          </div>
        </div>
      </section>

      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">It&apos;s All About You</h2>
            <p className="text-white/60 leading-relaxed mb-4">At FightCraft, you&apos;re not just another member. You&apos;re part of a community that genuinely cares about your growth — inside and outside the gym. We show up for each other, push each other, and celebrate every win together.</p>
            <p className="text-white/60 leading-relaxed">Our coaches take the time to understand your goals, whether that&apos;s getting in shape, learning self-defense, competing, or just finding a healthy way to decompress after a long day.</p>
          </div>
          <div className="order-1 md:order-2">
            <img src="/images/home/lian.jpeg" alt="FightCraft Community" className="w-full grayscale" />
          </div>
        </div>
      </section>

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight text-black">Meet Your Alter Ego</h2>
            <div className="w-16 h-px bg-black mt-6 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Get Better', body: 'Every class is an opportunity to improve. Our structured curriculum ensures consistent progress regardless of where you start.' },
              { num: '02', title: 'Get Tired', body: 'Push your limits with workouts that challenge your body and mind. Leave every session knowing you gave it everything.' },
              { num: '03', title: 'Have Fun', body: 'Training should be something you look forward to. Our community makes every class an experience, not just a workout.' },
            ].map(card => (
              <div key={card.num} className="border border-black/10 p-8">
                <p className="font-heading text-xs uppercase tracking-widest text-black/50 mb-3">{card.num}</p>
                <h3 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">{card.title}</h3>
                <p className="text-sm text-black/60 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LeadCapture />
      <Testimonials testimonials={testimonials} />
    </>
  )
}
