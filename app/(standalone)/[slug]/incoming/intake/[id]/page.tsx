'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import AutoPlayVideo from '@/components/AutoPlayVideo'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: string
}

const LOCATION_DATA: Record<string, { coach: string; coachTitle: string }> = {
  'san-jose': { coach: 'Josh', coachTitle: 'Head Coach, FightCraft San Jose' },
  'merced': { coach: 'Patrick', coachTitle: 'Head Coach, FightCraft Merced' },
  'brevard': { coach: 'Ricky', coachTitle: 'Head Coach, FightCraft Brevard' },
}

const SOURCE_GREETINGS: Record<string, string> = {
  'meta': "You came from one of our offers. We're glad you took the leap.",
  'website': "You found us online. We're glad you walked through the door.",
  'gear': "You came in for gear. Let's get you set up.",
  'csv_import': "Welcome back to FightCraft.",
}

interface ScheduleClass {
  time: string
  name: string
  bookable?: boolean
}

interface ScheduleDay {
  day: string
  classes: ScheduleClass[]
}

const PROGRAMS = [
  'Kickboxing',
  'Muay Thai',
  'Brazilian Jiu-Jitsu',
  'No-Gi Jiu-Jitsu',
  'MMA',
  'Wrestling',
  'Not sure yet',
]

const EXPERIENCE = [
  'Complete beginner',
  'Tried it once or twice',
  'Some experience',
  'Active practitioner',
]

const HOW_HEARD = [
  'Google',
  'Instagram',
  'Facebook',
  'Friend / referral',
  'Drove by',
  'Email',
  'Other',
]

const GOALS = [
  'Get in shape',
  'Learn self-defense',
  'Stress relief',
  'Build confidence',
  'Make friends',
  'Compete',
  'Try something new',
]

const FITNESS_BACKGROUND = [
  'Nothing right now',
  'Regular gym',
  'HIIT / bootcamp',
  'Yoga / pilates',
  'Running / cardio',
  'Other martial arts',
  'Team sports',
  'Other',
]

const FITNESS_AFFIRMATIONS: Record<string, string> = {
  'Nothing right now': "Perfect starting point. Most of our members started here. Your body adapts faster than you think.",
  'Regular gym': "You're going to love this. The gym builds strength. Martial arts builds skill. Together they're unstoppable.",
  'HIIT / bootcamp': "You already know how to push. We'll point that engine at something that actually teaches you a skill.",
  'Yoga / pilates': "Your body awareness is going to be a huge advantage. Most members wish they had your flexibility on day one.",
  'Running / cardio': "Your gas tank is already built. Now we add the technique that makes every minute mean something.",
  'Other martial arts': "Welcome home. You'll feel the difference in our coaching within your first 10 minutes.",
  'Team sports': "You already know how to compete and how to be a teammate. Two of the hardest things to teach.",
  'Other': "Whatever you've been doing, it brought you here. That's the right move.",
}

const GOAL_AFFIRMATIONS: Record<string, string> = {
  'Get in shape': "Most members see real changes in 4-6 weeks. Show up, the rest takes care of itself.",
  'Learn self-defense': "You'll learn real techniques from day one. Not theory.",
  'Stress relief': "There's no thinking about your day when someone's holding pads. That's the magic.",
  'Build confidence': "Confidence isn't from learning to fight. It's from knowing you can.",
  'Make friends': "The community here is the #1 thing members talk about in their reviews.",
  'Compete': "We've trained competitors at every level. When you're ready, we'll have you prepared.",
  'Try something new': "Curiosity is the best reason to walk in. Welcome.",
}

function TouchButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-5 text-lg font-bold border-2 transition-all ${active ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20 hover:border-black/50'}`}
    >
      {children}
    </button>
  )
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function DateWheel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // value is YYYY-MM-DD or empty
  const today = new Date()
  const defaultYear = today.getFullYear() - 30
  const parsed = value ? value.split('-').map(Number) : [defaultYear, 1, 1]
  const [year, setYear] = useState(parsed[0] || defaultYear)
  const [month, setMonth] = useState((parsed[1] || 1) - 1)
  const [day, setDay] = useState(parsed[2] || 1)

  const currentYear = today.getFullYear()
  const minYear = currentYear - 100
  const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => currentYear - i)

  const dayCount = daysInMonth(month, year)
  const days = Array.from({ length: dayCount }, (_, i) => i + 1)

  function update(y: number, m: number, d: number) {
    const max = daysInMonth(m, y)
    const safeDay = Math.min(d, max)
    setYear(y)
    setMonth(m)
    setDay(safeDay)
    onChange(`${y}-${String(m + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`)
  }

  return (
    <div className="bg-white border-2 border-black/10 p-4">
      <div className="grid grid-cols-3 gap-2">
        {/* Month */}
        <div>
          <p className="font-heading text-[10px] uppercase tracking-widest text-black/40 mb-2 text-center">Month</p>
          <div className="h-72 overflow-y-auto snap-y snap-mandatory border border-black/10">
            {MONTHS.map((m, i) => (
              <button
                key={m}
                type="button"
                onClick={() => update(year, i, day)}
                className={`w-full py-4 text-lg snap-center ${month === i ? 'bg-black text-white font-bold' : 'text-black/70 hover:bg-black/5'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Day */}
        <div>
          <p className="font-heading text-[10px] uppercase tracking-widest text-black/40 mb-2 text-center">Day</p>
          <div className="h-72 overflow-y-auto snap-y snap-mandatory border border-black/10">
            {days.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => update(year, month, d)}
                className={`w-full py-4 text-lg snap-center ${day === d ? 'bg-black text-white font-bold' : 'text-black/70 hover:bg-black/5'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Year */}
        <div>
          <p className="font-heading text-[10px] uppercase tracking-widest text-black/40 mb-2 text-center">Year</p>
          <div className="h-72 overflow-y-auto snap-y snap-mandatory border border-black/10">
            {years.map(y => (
              <button
                key={y}
                type="button"
                onClick={() => update(y, month, day)}
                className={`w-full py-4 text-lg snap-center ${year === y ? 'bg-black text-white font-bold' : 'text-black/70 hover:bg-black/5'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type StepType = 'form' | 'tip'
interface Step {
  type: StepType
  label: string
}

const STEPS: Step[] = [
  { type: 'form', label: 'Birthday' },
  { type: 'form', label: 'Experience' },
  { type: 'tip', label: 'A quick word' },
  { type: 'form', label: 'Your goal' },
  { type: 'tip', label: 'We hear you' },
  { type: 'form', label: 'Background' },
  { type: 'tip', label: 'Solid foundation' },
  { type: 'form', label: 'Programs' },
  { type: 'tip', label: 'On the mat' },
  { type: 'form', label: 'Schedule' },
  { type: 'form', label: 'Health' },
  { type: 'tip', label: 'Today' },
  { type: 'form', label: 'How you found us' },
  { type: 'form', label: 'Waiver' },
]

function IntakeContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const leadId = params.id as string
  const coachName = searchParams.get('coach') || 'Josh'

  const [lead, setLead] = useState<Lead | null>(null)
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [step, setStep] = useState(-1) // -1 = welcome screen
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Form state
  const [dob, setDob] = useState('')
  const [timeWindows, setTimeWindows] = useState<string[]>([])
  const [primaryGoal, setPrimaryGoal] = useState('')
  const [fitness, setFitness] = useState('')
  const [experience, setExperience] = useState('')
  const [injuries, setInjuries] = useState('')
  const [howHeard, setHowHeard] = useState('')
  const [programInterest, setProgramInterest] = useState<string[]>([])
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [waiverAccepted, setWaiverAccepted] = useState(false)

  useEffect(() => {
    fetch(`/api/incoming/intake?leadId=${leadId}`)
      .then(r => {
        if (r.status === 401) {
          router.push(`/${slug}/incoming`)
          return null
        }
        return r.json()
      })
      .then(data => {
        if (data?.lead) setLead(data.lead)
      })

    fetch(`/api/schedule?location=${slug}`)
      .then(r => r.json())
      .then(data => setSchedule(data.schedule || []))
  }, [leadId, slug, router])

  useEffect(() => {
    if (!done) return
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#ffffff']
    const fire = (originX: number) => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: originX, y: 0.6 },
        colors,
        startVelocity: 45,
      })
    }
    fire(0.2)
    fire(0.5)
    fire(0.8)
    setTimeout(() => { fire(0.3); fire(0.7) }, 400)
    setTimeout(() => { fire(0.5) }, 800)
  }, [done])

  function toggleArray(arr: string[], setArr: (v: string[]) => void, value: string) {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  function canAdvance(): boolean {
    if (step === 0) return !!dob
    if (step === 1) return !!experience
    if (step === 2) return true // tip
    if (step === 3) return !!primaryGoal
    if (step === 4) return true // tip (goal affirmation)
    if (step === 5) return !!fitness
    if (step === 6) return true // tip (fitness affirmation)
    if (step === 7) return programInterest.length > 0
    if (step === 8) return true // tip
    if (step === 9) return timeWindows.length > 0 && availableClasses.length > 0
    if (step === 10) return !!injuries
    if (step === 11) return true // tip
    if (step === 12) return !!howHeard
    if (step === 13) return waiverAccepted
    return true
  }

  function timeBucket(time: string): string {
    // "6:00am" → "morning", "12:00pm" → "midday", "6:15pm" → "evening"
    const match = time.match(/(\d+):\d+(am|pm)/i)
    if (!match) return 'morning'
    let hour = parseInt(match[1])
    const ampm = match[2].toLowerCase()
    if (ampm === 'pm' && hour !== 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    if (hour < 11) return 'morning'
    if (hour < 16) return 'midday'
    return 'evening'
  }

  const isBeginner = experience === 'Complete beginner' || experience === 'Tried it once or twice'
  const isStriking = programInterest.some(p => p === 'Kickboxing' || p === 'Muay Thai')
  const isGrappling = programInterest.some(p => p === 'Brazilian Jiu-Jitsu' || p === 'No-Gi Jiu-Jitsu' || p === 'Wrestling' || p === 'MMA')

  async function handleSubmit() {
    setSubmitting(true)
    const res = await fetch('/api/incoming/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        coach: coachName,
        dob,
        goals: [primaryGoal, fitness ? `Background: ${fitness}` : ''].filter(Boolean).join(' · '),
        experience,
        injuries,
        howHeard,
        programInterest: programInterest.join(', '),
        availableClasses: availableClasses.join(', '),
        waiverAccepted,
      }),
    })
    if (res.ok) {
      setDone(true)
    } else {
      setSubmitting(false)
      alert('Something went wrong. Please try again.')
    }
  }

  if (!lead) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><p className="text-white/40">Loading...</p></div>
  }

  const firstName = lead.name.split(' ')[0]

  // ============ COMPLETION SCREEN ============
  if (done) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <AutoPlayVideo
          src="/images/home/hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <p className="font-heading text-sm uppercase tracking-[0.4em] text-white/60 mb-4">Welcome to the family</p>
          <h1 className="font-heading text-5xl md:text-8xl uppercase font-bold tracking-tight mb-8 leading-[0.9]">
            <span className="shimmer-once bg-[linear-gradient(90deg,#ef4444_0%,#f97316_40%,#fff_50%,#f97316_60%,#ef4444_100%)] bg-clip-text text-transparent">{firstName}</span>
          </h1>

          <p className="text-2xl text-white/80 mb-10 max-w-2xl">
            Coach {coachName} will be with you in just a moment.
          </p>

          {/* Surprise gift */}
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 px-8 py-5 mb-10 max-w-md">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-amber-400 mb-2">A small welcome gift</p>
            <p className="text-base text-white/90">We&apos;ve added a <strong>free guest pass</strong> to your account. Bring a friend to your second class.</p>
          </div>

          <p className="text-sm text-white/50">
            Please hand the iPad back to the staff.
          </p>
        </div>

        {/* Hidden staff exit — bottom right corner */}
        <button
          aria-label="Staff exit"
          onClick={async () => {
            await fetch('/api/incoming/auth', { method: 'DELETE' })
            router.push(`/${slug}/incoming`)
          }}
          className="fixed bottom-0 right-0 w-20 h-20 z-20 opacity-0"
        />
      </div>
    )
  }

  // ============ WELCOME SCREEN (step -1) ============
  if (step === -1) {
    const locInfo = LOCATION_DATA[slug] || LOCATION_DATA['san-jose']
    const sourceGreeting = SOURCE_GREETINGS[lead.source] || SOURCE_GREETINGS['website']
    const locationName = locInfo.coachTitle.split(', FightCraft ')[1] || 'San Jose'

    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <AutoPlayVideo
          src="/images/home/hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 py-16">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-12 brightness-0 invert mb-10" />

          <p className="font-heading text-sm uppercase tracking-[0.4em] text-white/60 mb-6 animate-pulse">We&apos;ve been expecting you</p>

          <h1 className="font-heading text-6xl md:text-9xl uppercase font-bold tracking-tight mb-8 leading-[0.9]">
            <span className="shimmer-once bg-[linear-gradient(90deg,#ef4444_0%,#f97316_40%,#fff_50%,#f97316_60%,#ef4444_100%)] bg-clip-text text-transparent">{firstName}</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl">
            {sourceGreeting}
          </p>

          {/* Coach intro card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-8 py-6 mb-12 max-w-md w-full">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <span className="font-heading text-2xl font-bold text-white">{coachName[0]}</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-heading text-xs uppercase tracking-widest text-white/40 mb-0.5">You&apos;ll be meeting</p>
                <p className="font-heading text-xl uppercase font-bold tracking-tight">Coach {coachName}</p>
                <p className="text-xs text-white/50">FightCraft {locationName}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(0)}
            className="px-14 py-6 bg-white text-black font-heading text-xl uppercase tracking-widest font-bold hover:bg-white/90 transition-colors"
          >
            Let&apos;s Get You Started
          </button>

          <p className="text-sm text-white/40 mt-8">Takes about 2 minutes</p>
        </div>
      </div>
    )
  }

  // ============ FORM STEPS ============
  const totalSteps = STEPS.length
  const currentStepName = STEPS[step]?.label || ''
  const progress = ((step + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-neutral-50 text-black flex flex-col">
      {/* Progress header */}
      <header className="bg-white border-b border-black/10 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="font-heading text-xs uppercase tracking-widest text-black/40">Step {step + 1} of {totalSteps}</p>
            <p className="font-heading text-sm uppercase tracking-widest font-bold">{currentStepName}</p>
          </div>
          <div className="w-full h-1 bg-black/10">
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {/* Step content */}
      <div className="flex-1 px-6 py-12 pb-32">
        <div className="max-w-4xl mx-auto">

          {step === 0 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">When&apos;s your birthday, {firstName}?</h2>
              <p className="text-lg text-black/60 mb-12">Tap to scroll.</p>
              <DateWheel value={dob} onChange={setDob} />
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">Your experience</h2>
              <p className="text-lg text-black/60 mb-12">Where are you starting from?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPERIENCE.map(opt => (
                  <TouchButton key={opt} active={experience === opt} onClick={() => setExperience(opt)}>{opt}</TouchButton>
                ))}
              </div>
            </section>
          )}

          {/* TIP — after experience, before goals */}
          {step === 2 && (
            <section>
              <p className="font-heading text-xs uppercase tracking-[0.4em] text-black/40 mb-4">A quick word, {firstName}</p>
              {isBeginner ? (
                <>
                  <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">Nervous? That&apos;s normal.</h2>
                  <div className="space-y-5 text-lg text-black/70 max-w-2xl">
                    <p>Every single person on our mat felt exactly what you&apos;re feeling on their first day.</p>
                    <p>The coach who&apos;s about to teach you was a beginner once. The person you&apos;ll partner with started where you are.</p>
                    <p className="font-bold text-black">Within 20 minutes, you&apos;ll wonder why you waited.</p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">A new room, a new crew.</h2>
                  <div className="space-y-5 text-lg text-black/70 max-w-2xl">
                    <p>You already know how to train. The only thing new here is the people.</p>
                    <p>Try to meet one or two new training partners today. Introduce yourself. Ask them what they like to drill.</p>
                    <p className="font-bold text-black">This is how the best gyms get built.</p>
                  </div>
                </>
              )}
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">What&apos;s your #1 reason for being here?</h2>
              <p className="text-lg text-black/60 mb-12">Pick the one that matters most.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {GOALS.map(opt => (
                  <TouchButton key={opt} active={primaryGoal === opt} onClick={() => setPrimaryGoal(opt)}>{opt}</TouchButton>
                ))}
              </div>
            </section>
          )}

          {/* TIP — affirm their goal */}
          {step === 4 && (
            <section>
              <p className="font-heading text-xs uppercase tracking-[0.4em] text-black/40 mb-4">We hear you</p>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">
                {primaryGoal && `You're here for ${primaryGoal.toLowerCase()}.`}
              </h2>
              <p className="text-xl text-black/70 max-w-2xl">
                {primaryGoal && GOAL_AFFIRMATIONS[primaryGoal]}
              </p>
              <p className="text-lg text-black/50 mt-8 max-w-2xl">
                Your coach knows. Every drill we set up today is going to point at this.
              </p>
            </section>
          )}

          {step === 5 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">What are you doing now for fitness?</h2>
              <p className="text-lg text-black/60 mb-12">Helps us know how to start you off.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FITNESS_BACKGROUND.map(opt => (
                  <TouchButton key={opt} active={fitness === opt} onClick={() => setFitness(opt)}>{opt}</TouchButton>
                ))}
              </div>
            </section>
          )}

          {/* TIP — fitness affirmation */}
          {step === 6 && (
            <section>
              <p className="font-heading text-xs uppercase tracking-[0.4em] text-black/40 mb-4">Solid foundation</p>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">
                {fitness && (
                  fitness === 'Nothing right now' ? "Perfect place to start." :
                  fitness === 'Other martial arts' ? "Welcome home." :
                  `${fitness} is a great base.`
                )}
              </h2>
              <p className="text-xl text-black/70 max-w-2xl">
                {fitness && FITNESS_AFFIRMATIONS[fitness]}
              </p>
            </section>
          )}

          {step === 7 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">What do you want to try?</h2>
              <p className="text-lg text-black/60 mb-12">Your membership covers all of these. Pick what excites you.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {PROGRAMS.filter(p => p !== 'Not sure yet').map(opt => (
                  <TouchButton key={opt} active={programInterest.includes(opt)} onClick={() => toggleArray(programInterest, setProgramInterest, opt)}>{opt}</TouchButton>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const all = PROGRAMS.filter(p => p !== 'Not sure yet')
                  setProgramInterest(programInterest.length === all.length ? [] : all)
                }}
                className="w-full px-6 py-5 text-lg font-bold border-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-transparent hover:opacity-90"
              >
                I want to try them all
              </button>
            </section>
          )}

          {/* TIP — after programs, before schedule */}
          {step === 8 && (
            <section>
              <p className="font-heading text-xs uppercase tracking-[0.4em] text-black/40 mb-4">On the mat</p>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">
                {isBeginner ? "Your partner won't be at your level." : "You're going to roll with all kinds of people."}
              </h2>
              <div className="space-y-5 text-lg text-black/70 max-w-2xl">
                {isBeginner ? (
                  <>
                    <p>This is the #1 thing new members worry about. Your partner doesn&apos;t mind. They&apos;ve been there.</p>
                    <p>Training with beginners is how experienced members sharpen their skills. You&apos;re actually helping them.</p>
                    <p className="font-bold text-black">You&apos;re not slowing anyone down. You&apos;re part of how they got good.</p>
                  </>
                ) : (
                  <>
                    <p>Some partners will be better than you. Some will be newer. Both are gifts.</p>
                    <p>The newer ones teach you patience and clarity. The better ones expose your gaps and push you forward.</p>
                    <p className="font-bold text-black">Show up curious. Leave better than you came.</p>
                  </>
                )}
                {isStriking && !isGrappling && (
                  <p className="text-base text-black/60 italic pt-2">Heads up: you&apos;ll be hitting pads with a partner. We&apos;ll show you everything before you do it.</p>
                )}
                {isGrappling && !isStriking && (
                  <p className="text-base text-black/60 italic pt-2">Heads up: grappling means close contact. Tap early when caught. Nobody&apos;s here to hurt you.</p>
                )}
              </div>
            </section>
          )}

          {step === 9 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">When can you train?</h2>
              <p className="text-lg text-black/60 mb-8">First, what times of day work for you?</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <TouchButton active={timeWindows.includes('morning')} onClick={() => toggleArray(timeWindows, setTimeWindows, 'morning')}>
                  Mornings <span className="font-normal opacity-60 text-sm block">Before 11am</span>
                </TouchButton>
                <TouchButton active={timeWindows.includes('midday')} onClick={() => toggleArray(timeWindows, setTimeWindows, 'midday')}>
                  Middays <span className="font-normal opacity-60 text-sm block">11am - 4pm</span>
                </TouchButton>
                <TouchButton active={timeWindows.includes('evening')} onClick={() => toggleArray(timeWindows, setTimeWindows, 'evening')}>
                  Evenings <span className="font-normal opacity-60 text-sm block">After 4pm</span>
                </TouchButton>
              </div>

              {timeWindows.length > 0 && (
                <>
                  <p className="text-lg text-black/60 mb-8">Now tap every class you could realistically make.</p>
                  <div className="space-y-8">
                    {schedule.map(day => {
                      const filtered = day.classes.filter(c => timeWindows.includes(timeBucket(c.time)))
                      if (filtered.length === 0) return null
                      return (
                        <div key={day.day}>
                          <p className="font-heading text-lg uppercase tracking-widest font-bold mb-3">{day.day}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {filtered.map((cls, i) => {
                              const value = `${day.day} ${cls.time} ${cls.name}`
                              const active = availableClasses.includes(value)
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => toggleArray(availableClasses, setAvailableClasses, value)}
                                  className={`p-4 border-2 text-left transition-all ${active ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20'}`}
                                >
                                  <p className={`text-xs uppercase tracking-widest font-bold mb-1 ${active ? 'text-white/60' : 'text-black/40'}`}>{cls.time}</p>
                                  <p className="text-base font-bold">{cls.name}</p>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </section>
          )}

          {step === 10 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">Anything we should know?</h2>
              <p className="text-lg text-black/60 mb-12">Injuries, conditions, anything that affects how you train. Type N/A if none.</p>
              <textarea
                value={injuries}
                onChange={e => setInjuries(e.target.value)}
                placeholder="Old shoulder injury, asthma, etc."
                className="w-full p-5 border-2 border-black/20 text-xl focus:border-black focus:outline-none resize-none"
                rows={5}
              />
            </section>
          )}

          {/* TIP — after health, before how heard */}
          {step === 11 && (
            <section>
              <p className="font-heading text-xs uppercase tracking-[0.4em] text-black/40 mb-4">For today</p>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">A few things that&apos;ll make today easy.</h2>
              <div className="space-y-6">
                <div className="bg-white border-2 border-black/10 p-6">
                  <p className="font-heading text-xs uppercase tracking-widest text-black/40 mb-1">During class</p>
                  <p className="text-base font-bold mb-1">Watch first, then try.</p>
                  <p className="text-sm text-black/70">If something is happening too fast, just watch. Nobody expects you to keep up. Pattern recognition comes before execution.</p>
                </div>
                <div className="bg-white border-2 border-black/10 p-6">
                  <p className="font-heading text-xs uppercase tracking-widest text-black/40 mb-1">If you get tired</p>
                  <p className="text-base font-bold mb-1">Take a knee. Drink water. Come back.</p>
                  <p className="text-sm text-black/70">Stepping back during a round isn&apos;t quitting. It&apos;s smart. Your gas tank expands fast if you don&apos;t blow it up on day one.</p>
                </div>
                <div className="bg-white border-2 border-black/10 p-6">
                  <p className="font-heading text-xs uppercase tracking-widest text-black/40 mb-1">After class</p>
                  <p className="text-base font-bold mb-1">Stay 2 minutes. Say hi to one person.</p>
                  <p className="text-sm text-black/70">The best gyms feel like home because of who&apos;s in the room. Make one connection today and the next class is twice as easy.</p>
                </div>
              </div>
            </section>
          )}

          {step === 12 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">How did you find us?</h2>
              <p className="text-lg text-black/60 mb-12">Just curious. Helps us know what&apos;s working.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {HOW_HEARD.map(opt => (
                  <TouchButton key={opt} active={howHeard === opt} onClick={() => setHowHeard(opt)}>{opt}</TouchButton>
                ))}
              </div>
            </section>
          )}

          {step === 13 && (
            <section>
              <h2 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-3">One last thing</h2>
              <p className="text-lg text-black/60 mb-12">Read this and tap to accept.</p>

              <div className="bg-white border-2 border-black/20 p-8 mb-6">
                <p className="text-base text-black/70 leading-relaxed">
                  I acknowledge that martial arts training carries inherent risks of physical injury. I voluntarily participate in classes at FightCraft and assume all risks. I release FightCraft, its owners, coaches, and staff from any liability for injuries sustained during training. I confirm that I am physically able to participate or have consulted a physician.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWaiverAccepted(!waiverAccepted)}
                className={`w-full p-6 border-2 text-left flex items-center gap-5 transition-all ${waiverAccepted ? 'bg-black text-white border-black' : 'bg-white border-black/20'}`}
              >
                <div className={`w-10 h-10 border-2 flex items-center justify-center shrink-0 ${waiverAccepted ? 'bg-white border-white' : 'border-black/30'}`}>
                  {waiverAccepted && (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="text-lg font-bold">I have read and accept the waiver</span>
              </button>
            </section>
          )}

        </div>
      </div>

      {/* Sticky footer with back/next */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={() => setStep(step - 1)}
            className="px-8 py-5 bg-white border-2 border-black/20 text-black font-heading text-lg uppercase tracking-widest font-bold hover:border-black"
          >
            Back
          </button>
          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="flex-1 py-5 bg-black text-white font-heading text-lg uppercase tracking-widest font-bold disabled:opacity-30"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canAdvance() || submitting}
              className="flex-1 py-5 bg-green-600 text-white font-heading text-lg uppercase tracking-widest font-bold disabled:opacity-30"
            >
              {submitting ? 'Saving...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <IntakeContent />
    </Suspense>
  )
}
