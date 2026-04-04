'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'
import AutoPlayVideo from '@/components/AutoPlayVideo'

function Check() {
  return (
    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function AcceleratorContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const sessionId = searchParams.get('session_id') || ''
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  const [processing, setProcessing] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    const lead = getLead()
    if (lead?.name) setFirstName(lead.name.split(' ')[0])
    track('upsell_viewed', { location: slug, offer: 'accelerator' })
  }, [slug])

  async function acceptUpsell(optionId: string) {
    setProcessing(optionId)
    try {
      const res = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, location: slug, upsellId: optionId }),
      })
      if (res.ok) {
        track('upsell_accepted', { location: slug, offer: optionId })
        router.push(`/${slug}/checkout/success?session_id=${sessionId}&accelerator=${optionId}`)
        return
      }
    } catch {}
    setProcessing(null)
  }

  function declineUpsell() {
    track('upsell_declined', { location: slug, offer: 'accelerator' })
    router.push(`/${slug}/checkout/success?session_id=${sessionId}`)
  }

  function scrollToOptions() {
    document.getElementById('accelerator-options')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col bg-black min-h-screen">
      {/* Confirmation bar */}
      <div className="bg-green-600 text-white text-center py-3 px-4">
        <p className="font-heading text-sm uppercase tracking-widest font-bold">
          You&apos;re In! One more way to accelerate your results.
        </p>
      </div>

      {/* Hero */}
      <div className="relative min-h-[50vh] flex items-center overflow-hidden">
        <AutoPlayVideo
          src="/images/home/mma-reel.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 px-6 py-16 max-w-4xl mx-auto w-full">
          <h1 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {firstName ? `${firstName}, training is only half the equation.` : 'Training is only half the equation.'}
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mb-8">
            What you eat and how consistent you stay determines how fast you see results. Most people figure this out 3 months in. You can start now.
          </p>
          <button onClick={scrollToOptions} className="px-8 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest font-bold hover:bg-white/90 transition-colors">
            See Options
          </button>
        </div>
      </div>

      {/* The problem */}
      <div className="bg-white text-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-12">
            The Pattern We See Every Month
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="font-heading text-6xl font-bold text-black/10">1</span>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3 -mt-2">Week 1-2</h3>
              <p className="text-sm text-black/60 leading-relaxed">
                You&apos;re fired up. Training 3-4x a week. Feeling great. Eating whatever because the workouts are intense enough to offset it. Right?
              </p>
            </div>

            <div>
              <span className="font-heading text-6xl font-bold text-black/10">2</span>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3 -mt-2">Week 3-4</h3>
              <p className="text-sm text-black/60 leading-relaxed">
                Energy dips. Recovery takes longer. You skip a class because you&apos;re sore or tired. The scale hasn&apos;t moved. Doubt creeps in.
              </p>
            </div>

            <div>
              <span className="font-heading text-6xl font-bold text-black/10">3</span>
              <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-3 -mt-2">Month 2</h3>
              <p className="text-sm text-black/60 leading-relaxed">
                Training drops to 1-2x a week. You&apos;re not sure what to eat. No one&apos;s checking in. The initial momentum is gone. This is where most people stall.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The fix */}
      <div className="relative py-20 px-6">
        <div className="absolute inset-0 bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url(/images/home/muay-thai-callout.jpg)' }} />
        <div className="absolute inset-0 bg-black/85" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-white mb-12">
            The Fix Is Simple
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Eat for your training</p>
                <p className="text-sm text-white/50">A structured meal plan built for martial artists. The right fuel on training days. The right recovery on rest days.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Recover faster</p>
                <p className="text-sm text-white/50">Proper nutrition means less soreness, more energy, and the ability to train harder more often.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">Stay accountable</p>
                <p className="text-sm text-white/50">A real person checking in on you weekly. When someone&apos;s watching, you don&apos;t skip. Simple as that.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Check />
              <div>
                <p className="font-bold text-white mb-1">See results faster</p>
                <p className="text-sm text-white/50">Members with a plan and a coach see visible changes in 4-6 weeks instead of 3-4 months.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's inside the meal plan */}
      <div className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-6">
                Built for Fighters. Not Dieters.
              </h2>
              <p className="text-white/50 mb-8">This isn&apos;t a generic calorie tracker. It&apos;s a meal plan designed around how martial artists actually train.</p>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <Check />
                  <div>
                    <p className="font-bold mb-1">Training day vs rest day macros</p>
                    <p className="text-sm text-white/50">Different days need different fuel. We plan for both.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Check />
                  <div>
                    <p className="font-bold mb-1">Weekly grocery lists</p>
                    <p className="text-sm text-white/50">Walk into the store, buy the list, cook the meals. No decisions to make.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Check />
                  <div>
                    <p className="font-bold mb-1">Recipes under 20 minutes</p>
                    <p className="text-sm text-white/50">You&apos;re already spending time training. We&apos;re not adding an hour in the kitchen.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Check />
                  <div>
                    <p className="font-bold mb-1">Pre/post training nutrition</p>
                    <p className="text-sm text-white/50">What to eat before class. What to eat after. Timing matters more than most people realize.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <AutoPlayVideo
                src="/images/home/reel.mp4"
                className="w-full aspect-[9/16] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div id="accelerator-options" className="bg-white text-black py-20 px-6 scroll-mt-8">
        <div className="max-w-4xl w-full mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-2">
            {firstName ? `${firstName}, Pick Your Level` : 'Pick Your Level'}
          </h2>
          <p className="text-center text-black/50 mb-12">One-time add-on. Starts immediately.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Meal Plan */}
            <div className="border border-black/10 p-8 flex flex-col">
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2">Fighter Meal Plan</h3>
              <p className="font-heading text-4xl font-bold mb-2">$49</p>
              <p className="text-sm text-black/50 mb-6">Eat like a fighter. Perform like one.</p>

              <div className="space-y-3 flex-1 mb-8">
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Custom meal plan built for fighters</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Weekly grocery lists</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Macro targets for training + rest days</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Recipes under 20 minutes</span></div>
              </div>

              <button
                onClick={() => acceptUpsell('meal-plan')}
                disabled={processing !== null}
                className="w-full py-4 bg-black text-white font-heading text-sm uppercase tracking-widest font-bold hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {processing === 'meal-plan' ? 'Processing...' : 'Add Meal Plan for $49'}
              </button>
            </div>

            {/* Meal Plan + Coach */}
            <div className="border-2 border-black p-8 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-green-600 text-white font-heading text-xs uppercase tracking-widest font-bold px-5 py-1.5 rounded-full whitespace-nowrap">
                  Recommended
                </span>
              </div>

              <h3 className="font-heading text-xl uppercase font-bold tracking-tight mb-2 mt-2">Meal Plan + Accountability Coach</h3>
              <p className="font-heading text-4xl font-bold text-green-700 mb-2">$99</p>
              <p className="text-sm text-black/50 mb-6">The meal plan plus someone who keeps you on track.</p>

              <div className="space-y-3 flex-1 mb-8">
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Everything in the Fighter Meal Plan</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Weekly check-ins with your coach</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Personalized adjustments based on progress</span></div>
                <div className="flex gap-3 items-center"><Check /><span className="text-sm">Direct messaging between check-ins</span></div>
              </div>

              <button
                onClick={() => acceptUpsell('meal-plan-coach')}
                disabled={processing !== null}
                className="w-full py-4 bg-black text-white font-heading text-sm uppercase tracking-widest font-bold hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {processing === 'meal-plan-coach' ? 'Processing...' : 'Add Plan + Coach for $99'}
              </button>
            </div>
          </div>

          {/* Decline */}
          <div className="text-center">
            <button
              onClick={declineUpsell}
              className="text-sm text-black/40 hover:text-black/60 transition-colors cursor-pointer underline"
            >
              No thanks, just the training for now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-white/10 py-6 text-center">
        <div className="w-[40px] h-[40px] bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-5 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-white/30">FightCraft {locationName}</p>
      </div>
    </div>
  )
}

export default function AcceleratorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AcceleratorContent />
    </Suspense>
  )
}
