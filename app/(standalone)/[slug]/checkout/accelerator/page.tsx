'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'

const ACCELERATOR_OPTIONS = [
  {
    id: 'meal-plan',
    name: 'Fighter Meal Plan',
    price: 49,
    description: 'Eat like a fighter. Perform like one.',
    pitch: "A structured meal plan designed for martial artists. Fuel your training, recover faster, and see results in the mirror that match what you feel on the mat.",
    items: [
      'Custom meal plan built for fighters',
      'Weekly grocery lists',
      'Macro targets for training days and rest days',
      'Recipes that take under 20 minutes',
    ],
  },
  {
    id: 'meal-plan-coach',
    name: 'Meal Plan + Accountability Coach',
    price: 99,
    description: 'The meal plan plus someone who keeps you on track.',
    pitch: "Same meal plan, but with a real person checking in on you weekly. Your accountability coach makes sure you're eating right, recovering well, and staying consistent. This is how our most successful members accelerate their results.",
    items: [
      'Everything in the Fighter Meal Plan',
      'Weekly check-ins with your accountability coach',
      'Personalized adjustments based on your progress',
      'Direct messaging for questions between check-ins',
    ],
    tag: 'Recommended',
    tagColor: 'bg-green-600',
  },
]

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

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <div className="bg-green-600 text-white text-center py-3 px-4">
        <p className="font-heading text-sm uppercase tracking-widest font-bold">
          You&apos;re in! One more way to accelerate your results.
        </p>
      </div>

      <div className="flex-1 px-4 py-12">
        <div className="max-w-3xl w-full mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-black/50 uppercase tracking-widest mb-3">Accelerator options</p>
            <h1 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-3">
              Get Results Faster{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-black/60 max-w-xl mx-auto">
              Training is only half the equation. What you eat and how consistent you stay determines how fast you transform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {ACCELERATOR_OPTIONS.map(opt => (
              <div key={opt.id} className="border border-black/10 p-6 flex flex-col relative">
                {'tag' in opt && opt.tag && (
                  <span className={`absolute -top-3 left-4 ${opt.tagColor} text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1`}>
                    {opt.tag}
                  </span>
                )}
                <h3 className="font-heading text-lg uppercase font-bold tracking-tight mb-1 mt-2">{opt.name}</h3>
                <p className="text-2xl font-bold mb-2">${opt.price}</p>
                <p className="text-sm text-black/50 mb-4">{opt.description}</p>
                <p className="text-xs text-black/60 leading-relaxed mb-4 italic">{opt.pitch}</p>

                <div className="space-y-2 mb-6 flex-1">
                  {opt.items.map(item => (
                    <div key={item} className="flex gap-2 items-center">
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => acceptUpsell(opt.id)}
                  disabled={processing !== null}
                  className="w-full py-3 bg-black text-white font-heading text-sm uppercase tracking-widest rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50"
                >
                  {processing === opt.id ? 'Processing...' : `Add for $${opt.price}`}
                </button>
              </div>
            ))}
          </div>

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

      <div className="py-6 text-center">
        <div className="w-[40px] h-[40px] bg-black rounded-full flex items-center justify-center mx-auto mb-2">
          <img src="/images/fc-white-initials.svg" alt="FC" className="h-5 brightness-0 invert" />
        </div>
        <p className="text-[10px] text-black/40">FightCraft {locationName}</p>
      </div>
    </div>
  )
}

export default function AcceleratorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AcceleratorContent />
    </Suspense>
  )
}
