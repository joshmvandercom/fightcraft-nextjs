'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLead } from '@/lib/lead'
import AutoPlayVideo from '@/components/AutoPlayVideo'

const LOCATION_DATA: Record<string, { name: string; address: string; city: string; state: string; zip: string; owner: string }> = {
  'san-jose': { name: 'San Jose', address: '1825 W. San Carlos St.', city: 'San Jose', state: 'CA', zip: '95128', owner: 'Josh' },
  'merced': { name: 'Merced', address: '2844 G St', city: 'Merced', state: 'CA', zip: '95430', owner: 'Patrick' },
  'brevard': { name: 'Brevard', address: '69 West French Broad', city: 'Brevard', state: 'NC', zip: '28712', owner: 'Ricky' },
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-20">{children}</section>
}

export default function FieldGuidePage() {
  const params = useParams()
  const slug = params.slug as string
  const loc = LOCATION_DATA[slug] || LOCATION_DATA['san-jose']

  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    const lead = getLead()
    if (lead?.name) setFirstName(lead.name.split(' ')[0])
  }, [])

  useEffect(() => {
    import('@/lib/lead').then(({ getLeadWithSid, hasSidParam }) => {
      if (!hasSidParam() && firstName) return
      getLeadWithSid().then(lead => {
        if (lead?.name) setFirstName(lead.name.split(' ')[0])
      })
    })
  }, [])

  const NAV_ITEMS = [
    { id: 'arriving', label: 'Arriving' },
    { id: 'what-to-bring', label: 'What to Bring' },
    { id: 'programs', label: 'Programs' },
    { id: 'normal', label: "What's Normal" },
    { id: 'etiquette', label: 'Etiquette' },
    { id: 'how-to-wrap', label: 'Hand Wraps' },
    { id: 'holding-pads', label: 'Pad Holding' },
    { id: 'how-to-tie', label: 'Belt' },
    { id: 'faq', label: 'FAQ' },
  ]

  return (
    <div className="flex flex-col bg-black min-h-screen">

      {/* Hero */}
      <div className="relative min-h-[60vh] flex items-center overflow-hidden">
        <AutoPlayVideo
          src="/images/home/hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 px-6 py-16 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
            <p className="font-heading text-xs uppercase tracking-widest text-white/80">FightCraft {loc.name}</p>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl uppercase font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {firstName ? <>Welcome to FightCraft, <span className="shimmer-once bg-[linear-gradient(90deg,#ef4444_0%,#f97316_40%,#fff_50%,#f97316_60%,#ef4444_100%)] bg-clip-text text-transparent">{firstName}</span>.</> : 'Welcome to FightCraft.'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Here&apos;s your field guide to help you get the most out of your experience here. Bookmark it and come back whenever you need to.
          </p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="bg-white/5 border-b border-white/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex gap-4 overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map(item => (
            <a key={item.id} href={`#${item.id}`} className="font-heading text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors whitespace-nowrap">
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Arriving */}
      <Section id="arriving">
        <div className="bg-black text-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-6">
              When You Arrive
            </h2>

            <div className="space-y-10 mb-16">
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                <span className="font-heading text-4xl font-bold text-white/40">1</span>
                <div>
                  <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Check in</h3>
                  <p className="text-white/80">Say hi at the front desk when you walk in. Let them know which class you&apos;re taking.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                <span className="font-heading text-4xl font-bold text-white/40">2</span>
                <div>
                  <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Stow your stuff</h3>
                  <p className="text-white/80">Bags go in the cubbies. Shoes go in the shoe cubby. Keep your gear with you for class.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                <span className="font-heading text-4xl font-bold text-white/40">3</span>
                <div>
                  <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Get ready</h3>
                  <p className="text-white/80">Wrap your hands (striking) or put on your gi (grappling). Be on the mat and ready before class starts.</p>
                </div>
              </div>
            </div>

            <p className="text-white/70 mb-16 max-w-2xl">Once class starts, here&apos;s the rhythm.</p>

            {/* Striking class flow */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-2 py-0.5">Striking</span>
                <h3 className="font-heading text-2xl uppercase font-bold tracking-tight">Rhythm of the Class</h3>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                  <span className="font-heading text-4xl font-bold text-white/40">10min</span>
                  <div>
                    <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Warm-up</h3>
                    <p className="text-white/80">The coach leads the class through a warm-up and technical warm-up together. Jumping jacks, stretches, movement drills, basic combinations. Just follow along.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                  <span className="font-heading text-4xl font-bold text-white/40">25min</span>
                  <div>
                    <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Technique</h3>
                    <p className="text-white/80">The coach demonstrates a technique or combination. You drill it with a partner on pads. They break it down step by step. If you&apos;re lost, raise your hand. That&apos;s literally what the coach is there for.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                  <span className="font-heading text-4xl font-bold text-white/40">20min</span>
                  <div>
                    <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Rounds</h3>
                    <p className="text-white/80">Timed rounds of pad work with your partner. You take turns striking and holding pads. The coach calls out combinations or lets you work what you&apos;ve learned. This is where it all comes together.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                  <span className="font-heading text-4xl font-bold text-white/40">5min</span>
                  <div>
                    <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Cool down</h3>
                    <p className="text-white/80">Stretch. Touch gloves with your partner. Talk to the coach about what you thought. Drink water. You survived. You&apos;ll be back.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grappling class flow */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-2 py-0.5">Grappling</span>
                <h3 className="font-heading text-2xl uppercase font-bold tracking-tight">Rhythm of the Class</h3>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                  <span className="font-heading text-4xl font-bold text-white/40">10min</span>
                  <div>
                    <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Warm-up</h3>
                    <p className="text-white/80">Movement drills on the mat. Shrimping, bridging, rolls. These feel strange at first and become second nature. The warm-up is also teaching you fundamental movements you&apos;ll use in every technique.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                  <span className="font-heading text-4xl font-bold text-white/40">25min</span>
                  <div>
                    <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Technique</h3>
                    <p className="text-white/80">The coach demonstrates a position, sweep, or submission. You drill it with a partner, taking turns. They break it down step by step. You&apos;ll be partnered with someone appropriate for your level.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                  <span className="font-heading text-4xl font-bold text-white/40">20min</span>
                  <div>
                    <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Live rolls</h3>
                    <p className="text-white/80">Timed rounds of live grappling with a partner. On your first day, the coach will pair you with an experienced partner who knows to go easy. You can also sit out and watch. Zero pressure.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
                  <span className="font-heading text-4xl font-bold text-white/40">5min</span>
                  <div>
                    <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Cool down</h3>
                    <p className="text-white/80">Stretch. Shake hands with your partners. Ask questions. The culture after class is just as important as the class itself.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* What to Bring */}
      <Section id="what-to-bring">
        <div className="relative py-20 px-6">
          <div className="absolute inset-0 bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url(/images/home/kickboxing.jpg)' }} />
          <div className="absolute inset-0 bg-black/85" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-6">
              What to Bring
            </h2>
            <p className="text-white/70 mb-12">Keep it simple.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight text-white mb-4">You bring</h3>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-sm text-white/70">Athletic shorts or leggings (no zippers or pockets)</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-sm text-white/70">T-shirt or rash guard</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-sm text-white/70">Water bottle</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-sm text-white/70">Flip flops for walking to/from the mat</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight text-white mb-4">We provide</h3>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-sm text-white/70"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-1.5 py-0.5 mr-1.5">Striking</span>Loaner gloves, shin guards, hand wraps</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-sm text-white/70"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-1.5 py-0.5 mr-1.5">Grappling</span>Loaner gi tops available (bring your own if you have one)</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-sm text-white/70">Mouthguards available for purchase</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-sm text-white/70">Clean, matted training space</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <div className="border border-white/10 p-5">
                <p className="text-sm text-white/80"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-1.5 py-0.5 mr-2">Striking</span>Ranked color shirt and athletic shorts. If you&apos;re new, your rank color is white. We have everything else you need.</p>
              </div>
              <div className="border border-white/10 p-5">
                <p className="text-sm text-white/80"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-1.5 py-0.5 mr-2">Grappling</span>Shorts with no pockets and a rash guard or t-shirt. Gi classes: wear a gi if you have one, otherwise a t-shirt and shorts work.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Programs Overview */}
      <Section id="programs">
        <div className="bg-white text-black py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-4">
              Two Worlds. Try Both.
            </h2>
            <p className="text-black/50 mb-12">Everything at FightCraft falls into two categories. Your membership covers all of it.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Striking */}
              <div className="border border-black/10 overflow-hidden">
                <img src="/images/home/kickboxing.jpg" alt="Striking at FightCraft" className="w-full aspect-[16/9] object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                <div className="p-6">
                  <span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-2 py-0.5 mb-3">Striking</span>
                  <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-3">Kickboxing &amp; Muay Thai</h3>
                  <p className="text-sm text-black/70 mb-4">Punches, kicks, knees, elbows. You learn on pads and bags with a partner. Great cardio, real technique, and most beginners start here. Muay Thai adds clinch work and is more traditional. Both are stand-up fighting.</p>
                  <p className="text-xs text-black/70"><strong>Good for:</strong> Fitness, stress relief, learning to strike, confidence</p>
                </div>
              </div>

              {/* Grappling */}
              <div className="border border-black/10 overflow-hidden">
                <img src="/images/home/bjj.webp" alt="Grappling at FightCraft" className="w-full aspect-[16/9] object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                <div className="p-6">
                  <span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-2 py-0.5 mb-3">Grappling</span>
                  <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-3">BJJ, No-Gi, Wrestling &amp; MMA</h3>
                  <p className="text-sm text-black/70 mb-4">Ground-based control, submissions, takedowns. No punching or kicking. You use leverage and technique to control your partner. BJJ uses a gi (uniform), No-Gi is shorts and rash guard. Wrestling and MMA add takedowns and cage work.</p>
                  <p className="text-xs text-black/70"><strong>Good for:</strong> Problem-solving, self-defense, toughness, athleticism</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-black/50 mb-4">Most members train both. The skills complement each other and cross-training makes you better at everything.</p>

            <a href={`/${slug}/schedule`} className="font-heading text-sm uppercase tracking-widest text-black/50 hover:text-black transition-colors">
              View Full Schedule &rarr;
            </a>
          </div>
        </div>
      </Section>

      {/* What's Normal — the anti-churn section */}
      <Section id="normal">
        <div className="bg-black text-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-4">
              What&apos;s Normal (And What Isn&apos;t)
            </h2>
            <p className="text-white/70 mb-12 max-w-2xl">Every new member goes through the same things. Here's what to expect so you don't mistake progress for failure.</p>

            <div className="space-y-10">
              <div className="border-l-2 border-green-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2">Normal: Feeling like you&apos;re slowing your partner down</h3>
                <p className="text-white/80 text-sm">This is the #1 thing new members worry about. Your partner doesn&apos;t mind. They were you 6 months ago. Training with beginners is how experienced members sharpen their teaching skills. You&apos;re helping them too.</p>
              </div>

              <div className="border-l-2 border-green-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2">Normal: Forgetting everything between classes</h3>
                <p className="text-white/80 text-sm">You&apos;ll learn a technique on Monday and have zero memory of it by Wednesday. This happens to everyone for the first few months. Your body is learning even when your brain thinks it isn&apos;t. One day it just clicks.</p>
              </div>

              <div className="border-l-2 border-green-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2">Normal: Being exhausted after 20 minutes</h3>
                <p className="text-white/80 text-sm">Martial arts uses muscles and movement patterns your body has never experienced. The person next to you who looks effortless has been training for years. Your gas tank expands fast. Give it 2-3 weeks.</p>
              </div>

              <div className="border-l-2 border-green-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2">Normal: Feeling awkward and uncoordinated</h3>
                <p className="text-white/80 text-sm">You&apos;re learning a completely new way to move your body. Of course it feels weird. Nobody expects you to look smooth on day one. Or day ten. The awkward phase is the phase where you&apos;re growing the fastest.</p>
              </div>

              <div className="border-l-2 border-green-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-1.5 py-0.5 mr-2 align-middle">Striking</span>Sore knuckles and shins</h3>
                <p className="text-white/80 text-sm">Your hands and shins aren&apos;t used to impact yet. This toughens up within a few weeks. Wrapping your hands properly and using good gloves makes a big difference.</p>
              </div>

              <div className="border-l-2 border-green-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-1.5 py-0.5 mr-2 align-middle">Grappling</span>Getting submitted constantly</h3>
                <p className="text-white/80 text-sm">You will get tapped. A lot. By everyone. For months. This is how grappling works. Every tap is a lesson. The people tapping you out today were getting tapped out the same way a year ago. Embrace it.</p>
              </div>

              <div className="border-l-2 border-green-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-1.5 py-0.5 mr-2 align-middle">Grappling</span>Feeling claustrophobic or overwhelmed</h3>
                <p className="text-white/80 text-sm">Having someone on top of you is a new sensation. It can feel intense at first. Breathe. Tap if you need a reset. This feeling goes away as you learn to stay calm under pressure. That calmness carries into the rest of your life.</p>
              </div>

              <div className="border-l-2 border-green-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2">Normal: Soreness in strange places</h3>
                <p className="text-white/80 text-sm">Your forearms from gripping. Your hips from kicks. Muscles in your back you didn&apos;t know existed. This goes away within 2-3 weeks as your body adapts. Don&apos;t skip class because you&apos;re sore. Show up, move, and you&apos;ll actually feel better.</p>
              </div>

              <div className="border-l-2 border-amber-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2">Tell a coach: A training partner going too hard</h3>
                <p className="text-white/80 text-sm">If someone is being rough or not respecting your level, tell them. If it continues, tell a coach immediately. This is the one thing we take seriously above everything else. Everyone deserves to feel safe on the mat.</p>
              </div>

              <div className="border-l-2 border-amber-500 pl-6">
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-2">Tell a coach: Sharp pain</h3>
                <p className="text-white/80 text-sm">Soreness is expected. Sharp pain is not. If something hurts beyond normal muscle fatigue, stop and talk to your coach. Better to take a day off than to push through an injury and miss a month.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Gym Etiquette */}
      <Section id="etiquette">
        <div className="bg-white text-black py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-4">
              Gym Etiquette
            </h2>
            <p className="text-black/50 mb-12">Unwritten rules, written down. This stuff matters and nobody expects you to know it on day one.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1">Trim your nails</h3>
                <p className="text-sm text-black/70">Fingers and toes. Before every class. Especially important for grappling. Long nails scratch and cut your partners.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1">Shower before you come</h3>
                <p className="text-sm text-black/70">You&apos;re going to be in close contact with other humans. Basic hygiene is a sign of respect for your training partners.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1">Wear clean gear every class</h3>
                <p className="text-sm text-black/70">Wash your gi, rash guard, and shorts after every session. Dirty gear breeds bacteria and smells terrible.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1">Bow on and off the mat</h3>
                <p className="text-sm text-black/70">A small bow when you step onto the mat and when you step off. It&apos;s a sign of respect for the training space and everyone in it.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-1.5 py-0.5 mr-2">Grappling</span>Tap early and often</h3>
                <p className="text-sm text-black/70">When you&apos;re caught in a submission, tap your partner or the mat. Don&apos;t be a hero. Tapping is how you stay healthy and keep training.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-1.5 py-0.5 mr-2">Striking</span>Control your power</h3>
                <p className="text-sm text-black/70">When holding pads for a partner or doing partner drills, match their intensity. If they&apos;re new, go light. The coach will tell you when to turn it up.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-1.5 py-0.5 mr-2">Striking</span>Touch gloves</h3>
                <p className="text-sm text-black/70">Before and after partner drills or rounds, touch gloves with your partner. It&apos;s a handshake. It says &quot;thank you for training with me.&quot; Small gesture, big culture.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1"><span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-1.5 py-0.5 mr-2">Grappling</span>Slap and bump</h3>
                <p className="text-sm text-black/70">Before each roll, shake hands or fist bump your partner. Same idea as touching gloves. It&apos;s respect. You&apos;ll pick it up naturally.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1">Be on time</h3>
                <p className="text-sm text-black/70">Class starts together. Showing up 10 minutes late means the whole group has to pause. If you&apos;re running late, wait for the coach to wave you in.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1">Ask questions</h3>
                <p className="text-sm text-black/70">There are no stupid questions. If you don&apos;t understand something, ask. Your coach would rather explain it twice than watch you do it wrong.</p>
              </div>
              <div className="border border-black/10 p-5">
                <h3 className="font-bold mb-1">Respect the space</h3>
                <p className="text-sm text-black/70">This gym is our home. If you wouldn&apos;t do it at your family&apos;s house, don&apos;t do it here. Don&apos;t sit on fabric furniture while you&apos;re sweaty. Don&apos;t put your gear on tables. Clean up after yourself and treat the space like it belongs to you. Because it does.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* How to Wrap Your Hands */}
      <Section id="how-to-wrap">
        <div className="bg-black text-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-2 py-0.5">Striking</span>
              <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight">
                How to Wrap Your Hands
              </h2>
            </div>
            <p className="text-white/70 mb-12 max-w-2xl">Your coach will show you on day one. But if you want to practice at home, here&apos;s the method we teach.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="space-y-6">
                  {[
                    'Start with the loop around your thumb. Wrap across the back of your hand to your wrist.',
                    'Wrap around your wrist 2-3 times. Snug, not tight. You should be able to make a fist comfortably.',
                    'Come up and wrap across your knuckles 3 times. This is your padding layer.',
                    'Weave between each finger, starting between pinky and ring finger. Go over the top, around the back, and between the next gap.',
                    'Wrap across the knuckles once more, then back to the wrist.',
                    'Use the remaining wrap to go back and forth between wrist and knuckles until you run out. Finish at the wrist and secure with the velcro.',
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="font-heading text-2xl font-bold text-white/40 w-8 shrink-0">{i + 1}</span>
                      <p className="text-white/80 text-sm">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border border-white/10 p-5">
                  <p className="text-sm text-white/80"><strong className="text-white/80">Pro tip:</strong> Your wraps should feel supportive, like a firm handshake around your wrist and knuckles. If your fingers turn purple, they're too tight. If they feel loose after a few punches, rewrap tighter.</p>
                </div>
              </div>

              {/* Video placeholder */}
              <div className="bg-white/5 border border-white/10 aspect-[9/16] flex items-center justify-center rounded-2xl">
                <div className="text-center px-6">
                  <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                  <p className="font-heading text-sm uppercase tracking-widest text-white/30">Video coming soon</p>
                  <p className="text-xs text-white/40 mt-1">Hand wrap tutorial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* How to Hold Pads */}
      <Section id="holding-pads">
        <div className="bg-neutral-100 text-black py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-2 py-0.5">Striking</span>
              <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight">
                How to Hold Pads
              </h2>
            </div>
            <p className="text-black/70 mb-12 max-w-2xl">This is the fastest way to level up and attract the best training partners. Good pad holders are in high demand. Be one and you&apos;ll never struggle to find a partner.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="space-y-6">
                  {[
                    { title: 'Meet the strike', desc: 'Push the pad slightly toward the punch or kick as it lands. This gives your partner solid feedback and protects your shoulders from absorbing all the force.' },
                    { title: 'Stay firm, stay tight', desc: 'Lock your elbows and keep the pads at the right height. If the pads are flopping around, your partner can\'t develop accuracy or timing.' },
                    { title: 'Call the shots', desc: 'Good pad holders direct the round. Call out combinations. Mix it up. Keep your partner thinking. This is a skill in itself.' },
                    { title: 'Mirror your partner\'s level', desc: 'If they\'re a beginner, go slow and keep it simple. If they\'re experienced, push the pace. Reading your partner is what separates good holders from great ones.' },
                    { title: 'Angle the pads correctly', desc: 'Jab pad faces straight at your partner. Cross pad angles slightly inward. Hook pads face the side. Kick pads angle down. Your coach will show you each one.' },
                    { title: 'Communicate', desc: 'If something hurts, say so. If the pad position isn\'t working, adjust. Good pad work is a conversation between two people.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="font-heading text-2xl font-bold text-black/40 w-8 shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-bold text-sm mb-1">{item.title}</p>
                        <p className="text-black/70 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border border-black/10 p-5">
                  <p className="text-sm text-black/70"><strong>Why this matters:</strong> The best strikers in the gym are almost always the best pad holders too. Holding pads teaches you timing, distance, and how to read combinations from the other side. It makes you better even when you&apos;re not the one throwing.</p>
                </div>
              </div>

              {/* Video placeholder */}
              <div className="bg-neutral-100 border border-black/10 aspect-[9/16] flex items-center justify-center rounded-2xl">
                <div className="text-center px-6">
                  <svg className="w-16 h-16 text-black/10 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                  <p className="font-heading text-sm uppercase tracking-widest text-black/30">Video coming soon</p>
                  <p className="text-xs text-black/40 mt-1">Pad holding tutorial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* How to Tie Your Belt */}
      <Section id="how-to-tie">
        <div className="bg-black text-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block font-heading text-[10px] uppercase tracking-widest font-bold bg-blue-600 text-white px-2 py-0.5">Grappling</span>
              <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight">
                How to Tie Your Belt
              </h2>
            </div>
            <p className="text-white/70 mb-12 max-w-2xl">If you&apos;re training in the gi, you&apos;ll need to tie your belt. It comes undone constantly at first. That&apos;s normal. Here&apos;s the standard method.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="space-y-6">
                  {[
                    'Find the center of the belt. Place it across your belly button.',
                    'Wrap both ends around your back and bring them to the front. The belt should be snug with two layers across your stomach.',
                    'Cross the right side over the left.',
                    'Tuck the top end underneath both layers of the belt (from bottom to top) at your belly button.',
                    'Pull both ends tight. They should be roughly even length.',
                    'Cross the end that came from underneath over the other end, loop it through, and pull tight. A flat, clean knot.',
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="font-heading text-2xl font-bold text-white/40 w-8 shrink-0">{i + 1}</span>
                      <p className="text-white/80 text-sm">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border border-white/10 p-5">
                  <p className="text-sm text-white/80"><strong className="text-white/80">Pro tip:</strong> Your belt will come undone mid-roll. Step to the side of the mat, retie it, and jump back in. After a few weeks it becomes automatic.</p>
                </div>
              </div>

              {/* Video placeholder */}
              <div className="bg-white/5 border border-white/10 aspect-[9/16] flex items-center justify-center rounded-2xl">
                <div className="text-center px-6">
                  <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                  <p className="font-heading text-sm uppercase tracking-widest text-white/30">Video coming soon</p>
                  <p className="text-xs text-white/40 mt-1">Belt tying tutorial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <div className="bg-white text-black py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              {[
                { q: 'How often should I train as a beginner?', a: '2-3 times per week is the sweet spot. Enough to build the habit and see progress. Not so much that you burn out. You can always add more later.' },
                { q: 'Should I do striking or grappling first?', a: 'Whichever one sounds more fun. Seriously. The best program is the one you\'ll actually show up to. Most people try kickboxing first because it feels accessible. But if the idea of BJJ excites you, go for it.' },
                { q: 'What if I\'m completely out of shape?', a: 'Good. That\'s exactly what training is for. Every class is scalable. If you need to take a knee and catch your breath, take a knee. Nobody is judging you. They\'re too busy trying to survive their own round.' },
                { q: 'Will I get hit?', a: 'No. You will hit pads, bags, and do partner drills where you take turns practicing techniques at a controlled pace. Nobody is hitting you. Sparring is a separate activity that you have to earn. You need to reach orange or green belt rank before you\'re cleared to spar, and even then it\'s always optional and supervised.' },
                { q: 'I don\'t know anyone. Will I feel out of place?', a: 'For about 15 minutes. Then someone will introduce themselves, help you with a technique, and ask if you want to partner up. This community is genuinely welcoming. It\'s the thing our members mention most in reviews.' },
                { q: 'How long until I\'m "good"?', a: 'Define good. You\'ll feel more confident after 2 weeks. You\'ll start remembering techniques after a month. You\'ll feel like you know what you\'re doing after 3 months. You\'ll still be learning new things after 3 years. That\'s the beauty of it.' },
                { q: 'Can I train multiple programs?', a: 'Yes. Your membership covers everything. Many members do kickboxing and BJJ, or Muay Thai and wrestling. Cross-training makes you better at everything.' },
                { q: 'What if I have an injury or limitation?', a: 'Tell your coach before class. Every drill can be modified. We train people with bad knees, bad backs, bad shoulders. We work around it. Just communicate.' },
              ].map(item => (
                <div key={item.q} className="border-b border-black/10 pb-6">
                  <p className="font-bold text-lg mb-2">{item.q}</p>
                  <p className="text-sm text-black/70">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Closing */}
      <div className="relative py-20 px-6 overflow-hidden">
        <img src="/images/home/lian.jpeg" alt="FightCraft community" className="absolute inset-0 w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-white text-center">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-6">
            {firstName ? `${firstName}, We'll See You on the Mat.` : "We'll See You on the Mat."}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            You don't have to have it all figured out. You just have to show up. Everything else, we handle together.
          </p>
          <a href={`/${slug}/schedule`} className="inline-block px-8 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest font-bold hover:bg-white/90 transition-colors">
            View Schedule
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-white/10 py-8 px-6 text-center">
        <div className="w-[50px] h-[50px] bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-6 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-white/30">Copyright {new Date().getFullYear()}, FightCraft Martial Arts</p>
        <p className="text-[10px] text-white/30">{loc.address}, {loc.city}, {loc.state} {loc.zip}</p>
      </div>
    </div>
  )
}
