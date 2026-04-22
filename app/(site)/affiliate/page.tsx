import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Become an Affiliate | FightCraft',
  description:
    'Partner with FightCraft. Curriculum, business coaching, marketing support, and more for martial arts gym owners.',
}

function Check() {
  return (
    <svg
      className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}

async function getLeadsPerWeek() {
  try {
    const where = { source: { not: 'csv_import' } }
    const oldest = await prisma.lead.findFirst({
      where,
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })
    if (!oldest) return 0
    const totalLeads = await prisma.lead.count({ where })
    const weeksElapsed = Math.max(
      (Date.now() - oldest.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
      1
    )
    return Math.round(totalLeads / weeksElapsed)
  } catch {
    return 0
  }
}

export default async function AffiliatePage() {
  const leadsPerWeek = await getLeadsPerWeek()
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen md:min-h-[70vh] flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/home/kickboxing.jpg"
            alt=""
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20 flex-1 flex flex-col items-center justify-center">
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-6">
            For Gym Owners
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl uppercase font-bold tracking-tight text-white">
            Partner with FightCraft
          </h1>
          <p className="font-heading text-lg md:text-xl uppercase tracking-[0.3em] text-white/50 mt-6">
            Your gym. Your brand. Our systems.
          </p>
        </div>
      </section>

      {/* What we're not */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">
              Your Gym. Our Systems.
            </h2>
            <p className="text-black/60 leading-relaxed mb-4">
              You keep your name, your brand, your culture, and your autonomy. We bring the systems, curriculum, and support that took us years to build.
            </p>
            <p className="text-black/60 leading-relaxed mb-4">
              Use what makes sense for your gym. Leave what doesn&apos;t. This is a partnership built around what actually helps you grow.
            </p>
            <p className="text-black/60 leading-relaxed">
              Think of it as having a team of people who&apos;ve already solved the problems you&apos;re dealing with, on speed dial.
            </p>
          </div>
          <div>
            <img
              src="/images/home/lian2.jpeg"
              alt="FightCraft coaching"
              className="w-full grayscale"
            />
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight">
              What You Get
            </h2>
            <div className="w-16 h-px bg-white/20 mt-6 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Curriculum & Programming',
                body: 'Structured class plans, progression systems, and curricula for kickboxing, Muay Thai, and MMA. Stop building from scratch every week.',
              },
              {
                num: '02',
                title: 'Business Coaching',
                body: 'Pricing strategy, retention systems, sales process, operations playbooks. The business side of running a gym is half the battle. We help you win it.',
              },
              {
                num: '03',
                title: 'Marketing Support',
                body: 'Ad templates, funnel systems, landing pages, email sequences, and the strategy behind them. We run ads that work and we share what we learn.',
              },
              {
                num: '04',
                title: 'Hiring & Team Building',
                body: 'Coach recruitment frameworks, training standards, compensation structures, and culture-building systems. Your team is your gym.',
              },
              {
                num: '05',
                title: 'Program in a Box',
                body: 'Want to add kickboxing, Muay Thai, or MMA to your gym? We deliver a complete program. Curriculum, coach training, class structure, and marketing, all ready to plug in.',
              },
              {
                num: '06',
                title: 'Community & Network',
                body: 'Connect with other affiliate gym owners who are solving the same problems. Share what works. Learn from each other. Grow together.',
              },
            ].map((card) => (
              <div key={card.num} className="border border-white/10 p-8">
                <p className="font-heading text-xs uppercase tracking-widest text-white/50 mb-3">
                  {card.num}
                </p>
                <h3 className="font-heading text-2xl uppercase font-bold tracking-tight mb-4">
                  {card.title}
                </h3>
                <p
                  className="text-sm text-white/50 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: card.body }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program in a Box — deeper dive */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <img
              src="/images/home/vern2.jpeg"
              alt="FightCraft training"
              className="w-full grayscale"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-black/50 mb-4">
              Program in a Box
            </p>
            <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">
              Add a Program Without Starting from Zero.
            </h2>
            <p className="text-black/60 leading-relaxed mb-6">
              You already have the space and the students. We give you everything
              you need to launch a new program without years of trial and
              error.
            </p>
            <div className="space-y-3">
              {[
                'Complete class curriculum (beginner through advanced)',
                'Coach training and certification pathway',
                'Class structure and time breakdowns',
                'Equipment recommendations',
                'Marketing assets to announce the new program',
                'Ongoing support as you scale it',
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <Check />
                  <p className="text-sm text-black/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading text-6xl md:text-7xl font-bold tracking-tight">200+</p>
              <p className="font-heading text-sm uppercase tracking-widest text-white/50 mt-2">Fights</p>
            </div>
            <div>
              <p className="font-heading text-6xl md:text-7xl font-bold tracking-tight">80%</p>
              <p className="font-heading text-sm uppercase tracking-widest text-white/50 mt-2">Win Rate</p>
            </div>
            <div>
              <p className="font-heading text-6xl md:text-7xl font-bold tracking-tight">100%</p>
              <p className="font-heading text-sm uppercase tracking-widest text-white/50 mt-2">Homegrown from Beginners</p>
            </div>
            {leadsPerWeek > 0 && (
              <div>
                <p className="font-heading text-6xl md:text-7xl font-bold tracking-tight">{leadsPerWeek}</p>
                <p className="font-heading text-sm uppercase tracking-widest text-white/50 mt-2">Leads Per Week</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight text-center mb-12">
            This Is For You If
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "You own a martial arts gym and you're doing most of the work yourself",
              'You want proven systems instead of figuring everything out from scratch',
              "You want to add kickboxing, Muay Thai, or MMA to your gym without building it from scratch",
              "You're tired of guessing on marketing and want ads and funnels that actually convert",
              'You want to build a team of coaches but struggle with hiring and training',
              "You're looking for a community of gym owners who understand what you're going through",
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <Check />
                <p className="text-sm text-black/70">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight">
              How It Works
            </h2>
            <div className="w-16 h-px bg-black mt-6 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <span className="font-heading text-7xl font-bold text-black/10">
                1
              </span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-3 -mt-2">
                Apply
              </h3>
              <p className="text-sm text-black/60 leading-relaxed">
                Tell us about your gym, your programs, and where you want to
                grow. We&apos;ll set up a call to see if we&apos;re a good fit
                for each other.
              </p>
            </div>
            <div className="text-center">
              <span className="font-heading text-7xl font-bold text-black/10">
                2
              </span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-3 -mt-2">
                Onboard
              </h3>
              <p className="text-sm text-black/60 leading-relaxed">
                We audit your current operations, identify the biggest
                opportunities, and build a custom roadmap. You get immediate
                access to our curriculum and systems.
              </p>
            </div>
            <div className="text-center">
              <span className="font-heading text-7xl font-bold text-black/10">
                3
              </span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-3 -mt-2">
                Launch &amp; Grow
              </h3>
              <p className="text-sm text-black/60 leading-relaxed">
                Implement with ongoing coaching and support. Weekly check-ins,
                marketing reviews, and a direct line to the FightCraft team
                whenever you need it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA to quiz */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center grayscale"
          style={{ backgroundImage: 'url(/images/home/carlos.jpeg)' }}
        />
        <div className="absolute inset-0 bg-black/85" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-4">
            Ready to Learn More?
          </h2>
          <p className="text-white/60 mb-10">
            Answer a few quick questions about your gym and we&apos;ll reach out to talk through the details.
          </p>
          <a
            href="/affiliate/quiz"
            className="inline-block py-4 px-12 bg-white text-black font-heading text-lg font-bold uppercase tracking-widest rounded-lg hover:bg-white/90 transition-colors"
          >
            Get Started
          </a>
        </div>
      </section>
    </>
  )
}
