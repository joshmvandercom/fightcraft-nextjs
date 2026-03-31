import Hero from '@/components/Hero'
import Locations from '@/components/Locations'
import Programs from '@/components/Programs'
import Testimonials from '@/components/Testimonials'
import LeadCapture from '@/components/LeadCapture'
import { getLocations, getPrograms, getTestimonials } from '@/lib/content'

export default function Home() {
  const locations = getLocations()
  const programs = getPrograms()
  const testimonials = getTestimonials()

  return (
    <>
      <Hero />

      {/* All Levels Welcome */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img src="/images/home/vern.jpeg" alt="Training at FightCraft" className="w-full grayscale" />
          </div>
          <div>
            <h2 className="font-heading text-5xl md:text-6xl uppercase font-bold tracking-tight text-black mb-6">All Levels Welcome</h2>
            <p className="text-lg text-black/60 leading-relaxed">
              At FightCraft, we offer authentic combat training suitable for all levels — from seasoned athletes to complete beginners. Our mission is to equip you with the expert guidance, motivational mentors, and focused accountability you need to excel.
            </p>
          </div>
        </div>
      </section>

      {/* It's All About You */}
      <section className="bg-neutral-100 text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <h2 className="font-heading text-5xl md:text-6xl uppercase font-bold tracking-tight text-black mb-6">It&apos;s All About You</h2>
            <p className="text-lg text-black/60 leading-relaxed">
              FightCraft is about you. It&apos;s about accomplishing your goals and providing you with an incredibly supportive community where you can pursue fitness, train hard, and dream big. From Kickboxing to MMA, we are your home for all things martial arts. Begin your journey today.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <img src="/images/home/lian.jpeg" alt="FightCraft Community" className="w-full grayscale" />
          </div>
        </div>
      </section>

      <Locations locations={locations} linked />
      <Programs programs={programs} locations={locations} />
      <Testimonials testimonials={testimonials} />
      <LeadCapture />
    </>
  )
}
