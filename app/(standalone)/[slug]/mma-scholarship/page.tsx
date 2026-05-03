import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AutoPlayVideo from '@/components/AutoPlayVideo'
import CTAButton from '@/components/CTAButton'
import { getLocations } from '@/lib/content'
import Tracker from './Tracker'

const SCHOLARSHIP_SLUGS = ['san-jose']

export const dynamicParams = false

export function generateStaticParams() {
  return SCHOLARSHIP_SLUGS.map(slug => ({ slug }))
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const loc = getLocations().find(l => l.slug === slug)
    return {
      title: loc ? `MMA Scholarship | FightCraft ${loc.name}` : 'MMA Scholarship',
      description: loc
        ? `Train for free at FightCraft ${loc.name}. Full-access MMA training for fighters with experience who plan to compete in the next year.`
        : '',
    }
  })
}

function Check() {
  return (
    <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function Stars() {
  return (
    <div className="flex gap-0.5 justify-center">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function PrimaryCTA({ label = 'Apply For The Scholarship' }: { label?: string }) {
  return (
    <CTAButton className="w-full max-w-lg mx-auto py-4 px-8 bg-black text-white rounded-xl hover:bg-black/80 transition-colors cursor-pointer block">
      <span className="font-heading text-lg md:text-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
        {label}
      </span>
      <span className="text-xs text-white/60 uppercase tracking-widest">Limited spots &middot; By application</span>
    </CTAButton>
  )
}

const INCLUDED = [
  { title: 'Dedicated scholarship cohort', desc: 'Six days a week of fight-specific programming with the rest of the team. No initiation, no monthly dues, no contract.' },
  { title: 'MMA-specific programming', desc: 'Wall work, cage positioning, striking for MMA, takedowns, clinch fighting, ground-and-pound, range transitions.' },
  { title: 'Real fight prep & corner work', desc: 'Camp planning around your fight date. Sparring partners on your level. Coaches in your corner the night of.' },
  { title: 'Sparring partners who match up', desc: 'A room full of athletes training to compete. You get rounds with strikers, grapplers, and well-rounded fighters who push you.' },
  { title: 'Strength, recovery, and weight management', desc: 'Cut weight intelligently, peak on fight night, protect your body across a long career.' },
  { title: 'Direct coaching from competitive coaches', desc: 'Coaches who have cornered and trained competitive fighters. Real instruction, not a watered-down group class.' },
]

const ELIGIBILITY = [
  { title: 'You have some experience', desc: 'Striking, grappling, wrestling, or any combination. You don’t need to be a pro, but you should already know how to hold yourself in training. We are not a beginner program.' },
  { title: 'You plan to fight within the next year', desc: 'Amateur or pro. If you don’t have a target fight in mind, the scholarship isn’t the right fit — we’ll point you to one of our regular programs instead.' },
  { title: 'You can show up consistently', desc: 'Fight prep is built on volume. Scholarship athletes are expected to train multiple times per week. If your schedule won’t allow it, we’ll be honest about that up front.' },
]

const COMMITMENT = [
  'Train consistently and respect your teammates',
  'Take fight prep seriously — nutrition, recovery, weight management',
  'Represent FightCraft on fight night and in the gym',
  'Help newer fighters when you’re a few camps in',
]

const FAQ = [
  { q: 'Is this really free?', a: 'Yes. No monthly dues, no initiation, no contract. We invest in fighters we believe in.' },
  { q: 'What counts as "experience"?', a: 'Six-plus months of consistent training in striking, grappling, wrestling, or any combination. We’ll talk through your background on the call.' },
  { q: 'Do I need a fight booked already?', a: 'No, but you should have a target window. If you’re not planning to compete in the next year, this isn’t the right fit.' },
  { q: 'How does the application work?', a: 'Drop your info below. We’ll set up a short call to learn about your background, then bring you in for an in-person session before any decisions.' },
  { q: 'What if I’m newer than you’re looking for?', a: 'We’ll point you to our regular MMA program. Plenty of our scholarship athletes started exactly there.' },
  { q: 'How many spots are open?', a: 'It varies. We keep the room small enough that every fighter gets the attention and sparring partners they need.' },
]

const SCHOLARSHIP_SCHEDULE = [
  { day: 'Monday', classes: [
    { time: '7:00am', name: 'Kickboxing Fundamentals' },
    { time: '8:00am', name: 'MMA Striking' },
    { time: '9:00am', name: 'MMA Wall Work' },
  ]},
  { day: 'Tuesday', classes: [
    { time: '6:00am', name: 'Fight Fit' },
    { time: '7:00am', name: 'Intermediate Kickboxing' },
    { time: '8:00am', name: 'MMA Grappling' },
  ]},
  { day: 'Wednesday', classes: [
    { time: '7:00am', name: 'Kickboxing Fundamentals' },
    { time: '8:00am', name: 'MMA Striking' },
    { time: '9:00am', name: 'MMA Wrestling' },
  ]},
  { day: 'Thursday', classes: [
    { time: '6:00am', name: 'Fight Fit' },
    { time: '7:00am', name: 'Intermediate Kickboxing' },
    { time: '8:00am', name: 'MMA Ground & Pound' },
  ]},
  { day: 'Friday', classes: [
    { time: '7:00am', name: 'Kickboxing Fundamentals' },
    { time: '8:00am', name: 'Fight Simulation' },
  ]},
  { day: 'Saturday', classes: [
    { time: '7:00am – 9:00am', name: 'Fight Team Practice' },
  ]},
]

const TESTIMONIALS = [
  { name: 'Eric K.', quote: 'Josh and the FightCraft team have done a great job with group classes and 1:1 training. He is very kind and passionate about teaching MMA fundamentals for anyone and everyone.' },
  { name: 'Nicholas D.', quote: 'I went in as someone with no fighting experience and was intimidated of an MMA gym, but the coaches do a very good job of making it easy to hop on the mat and start learning.' },
  { name: 'Zach H.', quote: 'The coaches are extremely knowledgeable, very friendly, and passionate about wanting you to learn the craft correctly. Something special about this place.' },
]

export default async function MmaScholarshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!SCHOLARSHIP_SLUGS.includes(slug)) notFound()

  const location = getLocations().find(l => l.slug === slug)
  if (!location) notFound()

  const year = new Date().getFullYear()

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <Tracker slug={slug} />

      {/* Top banner */}
      <div className="bg-black text-white text-center py-2 px-4 border-b border-white/10">
        <p className="font-heading text-xs md:text-sm uppercase tracking-widest font-bold">
          Now accepting applications &middot; Limited spots
        </p>
      </div>

      {/* Hero */}
      <div className="relative bg-neutral-100">
        <div className="absolute top-0 left-0 right-0 h-[65%] bg-black" />
        <div className="relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center pt-6 md:pt-10 pb-4">
            <p className="font-heading text-xs md:text-sm uppercase tracking-[0.3em] text-white/50 mb-3">
              100% Free &middot; By Application
            </p>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl uppercase font-bold tracking-tight text-white mb-4 leading-[1.05]">
              Train For Free.<br />Fight On Our Team.
            </h1>
            <p className="text-lg md:text-xl text-white/70">
              The FightCraft {location.name} MMA Scholarship for fighters with experience who plan to compete in the next year.
            </p>
          </div>
          <div className="flex justify-center">
            <img src="/images/home/vern.jpeg" alt="FightCraft MMA training" className="w-full max-w-xl shadow-xl grayscale" />
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div className="bg-neutral-100 py-6 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <Stars />
          <p className="text-sm text-black/60">
            Rated <strong>4.9</strong> out of 5 from <strong>139+ reviews</strong> on Google
          </p>
        </div>
      </div>

      {/* Coach pitch */}
      <div className="bg-neutral-100 text-black pt-4 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-base mb-3">A note from Coach {location.owner}.</p>
          <div className="text-base text-black/70 leading-relaxed space-y-4 mb-8">
            <p>The talent in the South Bay is real, and money shouldn&apos;t decide who gets to compete.</p>
            <p>If you have the foundation, the work ethic, and a target fight in mind, we want you on the mats. Striking, grappling, wrestling, fight prep, corner work — the full program, at no cost.</p>
            <p className="text-black">We&apos;re looking for fighters, not hobbyists. If that&apos;s you, apply and let&apos;s talk.</p>
          </div>
          <PrimaryCTA />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading text-4xl md:text-6xl font-bold tracking-tight">200+</p>
              <p className="font-heading text-[10px] md:text-xs uppercase tracking-widest text-white/50 mt-2">Fights</p>
            </div>
            <div>
              <p className="font-heading text-4xl md:text-6xl font-bold tracking-tight">80%</p>
              <p className="font-heading text-[10px] md:text-xs uppercase tracking-widest text-white/50 mt-2">Win Rate</p>
            </div>
            <div>
              <p className="font-heading text-4xl md:text-6xl font-bold tracking-tight">100%</p>
              <p className="font-heading text-[10px] md:text-xs uppercase tracking-widest text-white/50 mt-2">Homegrown</p>
            </div>
            <div>
              <p className="font-heading text-4xl md:text-6xl font-bold tracking-tight">$0</p>
              <p className="font-heading text-[10px] md:text-xs uppercase tracking-widest text-white/50 mt-2">Cost To You</p>
            </div>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="bg-white text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            What&apos;s Included
          </h2>
          <div className="space-y-6 mb-12">
            {INCLUDED.map(item => (
              <div key={item.title} className="flex gap-4">
                <Check />
                <div>
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-black/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <PrimaryCTA />
        </div>
      </div>

      {/* Not a beginner program callout */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/40 mb-3">
              Be honest with yourself
            </p>
            <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-5">
              This Isn&apos;t A Beginner Program
            </h2>
            <p className="text-white/60 leading-relaxed mb-3">
              The scholarship is built around live training, hard sparring, and fight prep. Pace is fast, standards are high.
            </p>
            <p className="text-white/60 leading-relaxed">
              If you&apos;re newer to martial arts, start in our regular program and build the foundation. Plenty of our scholarship athletes did exactly that.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="w-[260px] md:w-[300px] rounded-2xl overflow-hidden shadow-2xl">
              <AutoPlayVideo
                src="/images/home/mma-reel.mp4"
                className="w-full aspect-[9/16] object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility */}
      <div className="bg-white text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            Who It&apos;s For
          </h2>
          <div className="space-y-8 mb-12">
            {ELIGIBILITY.map((item, i) => (
              <div key={item.title} className="flex gap-5">
                <span className="font-heading text-3xl font-bold text-black/15 leading-none shrink-0 w-8">
                  0{i + 1}
                </span>
                <div>
                  <p className="font-bold text-lg mb-2">{item.title}</p>
                  <p className="text-sm text-black/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <PrimaryCTA />
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-neutral-100 text-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-black/50 mb-3">
              {location.name} &middot; Scholarship Schedule
            </p>
            <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight">
              Train Like A Fighter
            </h2>
            <p className="text-sm text-black/60 mt-3 max-w-xl mx-auto">
              Six days a week of dedicated fight programming. Striking, wrestling, grappling, and live rounds.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {SCHOLARSHIP_SCHEDULE.map(day => (
              <div key={day.day}>
                <h3 className="font-heading text-base uppercase font-bold tracking-tight text-black mb-3 pb-2 border-b-2 border-black">
                  {day.day}
                </h3>
                <div className="space-y-2">
                  {day.classes.map((cls, i) => (
                    <div key={i} className="py-1">
                      <p className="font-heading text-[10px] uppercase tracking-wider text-black/50">{cls.time}</p>
                      <p className="text-xs text-black/80 mt-0.5">{cls.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What we ask */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-4">
            Show Up. Train Hard. Represent.
          </h2>
          <p className="text-center text-white/60 mb-10">
            We invest a lot in our fighters and we expect that investment back in effort.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-12">
            {COMMITMENT.map(item => (
              <div key={item} className="flex gap-3">
                <svg className="w-5 h-5 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <p className="text-sm text-white/80 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-neutral-100 text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            From The Mats
          </h2>
          <div className="space-y-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white p-6 border border-black/10">
                <Stars />
                <p className="text-sm text-black/60 leading-relaxed mt-3 mb-3">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-heading text-xs uppercase tracking-widest font-bold">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white text-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            Common Questions
          </h2>
          <div className="space-y-6 mb-12">
            {FAQ.map(item => (
              <div key={item.q}>
                <p className="font-bold mb-1">{item.q}</p>
                <p className="text-sm text-black/60">{item.a}</p>
              </div>
            ))}
          </div>
          <PrimaryCTA />
        </div>
      </div>

      {/* Final push */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-3">
            Ready To Compete?
          </h2>
          <p className="text-white/60 mb-2">
            Drop your info. We&apos;ll set up a call to learn about your background, then bring you in for a session.
          </p>
          <p className="text-white/40 text-sm mb-8">
            By application only. We respond within 48 hours.
          </p>
          <PrimaryCTA />
          <p className="text-white/30 text-xs mt-6">
            FightCraft {location.name} &middot; {location.address}, {location.city}, {location.state} {location.zip}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white py-8 px-4 text-center">
        <div className="w-[50px] h-[50px] bg-black rounded-full flex items-center justify-center mx-auto mb-3">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-6 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-black/40">Copyright {year}, FightCraft Martial Arts</p>
      </div>
    </div>
  )
}
