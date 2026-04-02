'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import RequireLead from '@/components/RequireLead'
import { getLead } from '@/lib/lead'

interface Option {
  letter: string
  title: string
  description: string
  affirmation: string
}

interface Step {
  question: string
  subtitle: string
  options: Option[]
}

const steps: Step[] = [
  {
    question: "What's driving you toward the mat?",
    subtitle: "There's no wrong answer. Be honest \u2014 your results depend on it.",
    options: [
      {
        letter: 'A',
        title: 'Self-defense & personal protection',
        description: 'I want the real ability to handle myself in any situation',
        affirmation: "Most people who walk through our doors for that reason become our most dedicated members. Self-protection is one of the most human instincts there is, and martial arts is the most effective system ever built for exactly that.",
      },
      {
        letter: 'B',
        title: 'Personal growth & discipline',
        description: 'I want to become more focused, resilient, and mentally sharp',
        affirmation: "That mindset is rare and we respect it. The mat has a way of revealing who you really are, and our members consistently say training has changed how they show up in every area of their life.",
      },
      {
        letter: 'C',
        title: 'Fitness with a real purpose',
        description: 'I want a workout that actually challenges and interests me',
        affirmation: "You're not alone. Most of our members came in looking for something better than a treadmill and found a community that makes them actually look forward to training. The fitness is a byproduct of learning something real.",
      },
      {
        letter: 'D',
        title: 'Competition & sport',
        description: 'I want to see how far I can go',
        affirmation: "We love that. FightCraft has produced competitive fighters across multiple disciplines and our coaches know how to build a game plan that gets you on the podium. Let's find out what you're made of.",
      },
    ],
  },
  {
    question: "Where are you starting from right now?",
    subtitle: "Every elite practitioner was a beginner once. Knowing your starting point lets us design your fastest path forward.",
    options: [
      {
        letter: 'A',
        title: 'Complete beginner',
        description: "I've never trained before \u2014 zero mat time",
        affirmation: "Perfect. You're exactly who we built this for. Our coaches specialize in taking people from zero to confident, and you'll be amazed how quickly things click when you have the right instruction.",
      },
      {
        letter: 'B',
        title: 'Tried it once or twice',
        description: "I've dabbled but never committed to consistent training",
        affirmation: "That first taste clearly left an impression. The difference between dabbling and transforming is having the right environment and coaches. That's what we're here for.",
      },
      {
        letter: 'C',
        title: 'Some experience',
        description: "I've trained consistently at some point but I'm not where I want to be",
        affirmation: "You know what training feels like and you know it works. Coming back with intention and better coaching is going to unlock a level you haven't hit yet.",
      },
      {
        letter: 'D',
        title: 'Active practitioner',
        description: 'I train now but I want better instruction and a stronger team around me',
        affirmation: "Respect. Recognizing that your environment matters as much as your effort is a sign of a serious practitioner. Our coaches and training partners will push you to the next level.",
      },
    ],
  },
  {
    question: "Can you commit to 2-3 sessions per week?",
    subtitle: "This is where the real results happen. Consistency beats intensity every time.",
    options: [
      {
        letter: 'A',
        title: "Absolutely",
        description: "I can make 2-3 sessions work with my current schedule",
        affirmation: "That's the sweet spot. Two to three sessions per week is where technique starts to stick, fitness compounds, and you'll feel the difference in every part of your life within weeks.",
      },
      {
        letter: 'B',
        title: "I think so, with some adjustments",
        description: "I'll need to rearrange a few things but I'm willing",
        affirmation: "That willingness is everything. Our schedule runs from 6am to 9pm most days, so there's almost always a class that fits. Most of our members had to make the same adjustment and they'll tell you it was worth it.",
      },
      {
        letter: 'C',
        title: "Probably 1-2 times to start",
        description: "I want to ease in and build from there",
        affirmation: "Starting with once or twice a week is completely fine. Many of our most dedicated members started exactly that way. The important thing is showing up. Frequency will follow naturally.",
      },
      {
        letter: 'D',
        title: "I'm not sure yet",
        description: "My schedule changes a lot and I can't predict week to week",
        affirmation: "We get it. That's why we don't do rigid class packages. Our membership gives you unlimited access so you can train whenever your schedule allows. Some weeks it's four sessions, some weeks it's one. It all counts.",
      },
    ],
  },
  {
    question: "What's the real thing standing in your way?",
    subtitle: "Every person who's ever trained has faced one of these. Which one is yours?",
    options: [
      {
        letter: 'A',
        title: 'Time \u2014 my schedule is packed',
        description: 'I want to train but fitting it in feels impossible',
        affirmation: "We hear this more than anything. That's exactly why we offer classes from early morning to late evening, every day of the week. Most of our members are busy professionals and parents. We'll find a slot that works.",
      },
      {
        letter: 'B',
        title: "Intimidation \u2014 I don't know anyone",
        description: "It feels like a world I'm not sure I belong in yet",
        affirmation: "That feeling is completely normal and it disappears faster than you'd think. Every single person on our mat felt it on day one. Within a week, you'll wonder why you waited.",
      },
      {
        letter: 'C',
        title: "Physical readiness \u2014 I'm not in shape yet",
        description: 'I want to get fit first before I start training',
        affirmation: "Here's the truth: you don't get in shape to start training. You start training to get in shape. Our classes meet you where you are, and your fitness will come faster than any gym membership ever delivered.",
      },
      {
        letter: 'D',
        title: "Cost \u2014 I'm not sure it fits my budget",
        description: "I'm interested but concerned about the investment",
        affirmation: "We get it. We offer flexible options and there's no long-term contract. Most members tell us it's the best money they spend each month because it replaces the gym, the therapist, and the social club all at once.",
      },
      {
        letter: 'E',
        title: "Nothing \u2014 I'm ready to go",
        description: "I don't have any reservations, I just need to sign up",
        affirmation: "That's the energy. Let's not waste another day. We'll get you connected with your location and on the mat as soon as possible.",
      },
    ],
  },
  {
    question: "A year from now \u2014 what does success look like?",
    subtitle: "This one matters. Visualizing your outcome is the first act of achieving it.",
    options: [
      {
        letter: 'A',
        title: 'I move through the world with confidence',
        description: 'People can tell something has changed in how I carry myself',
        affirmation: "That quiet confidence is the most common transformation our members describe. It doesn't come from learning to fight. It comes from knowing you can.",
      },
      {
        letter: 'B',
        title: "I've found my people",
        description: 'Training is the best part of my week and my teammates are real friends',
        affirmation: "The community is what keeps people training for years. The workout gets you in the door. The people keep you coming back. You're going to love it here.",
      },
      {
        letter: 'C',
        title: "I've leveled up and competed",
        description: "I have tangible proof that I've grown as a practitioner",
        affirmation: "There's nothing like testing yourself. Whether it's your first tournament or your tenth, our coaches will have you prepared and our team will be in your corner. Literally.",
      },
      {
        letter: 'D',
        title: "I'm the healthiest I've ever been",
        description: 'My body and mind are both sharper and stronger',
        affirmation: "Martial arts delivers fitness that a regular gym can't touch because you're so focused on learning that you forget you're working out. A year from now, you won't recognize yourself.",
      },
    ],
  },
  {
    question: "How soon are you looking to start?",
    subtitle: "No pressure. Just helps us know how to follow up.",
    options: [
      {
        letter: 'A',
        title: "I'm ready now",
        description: "I want to get on the mat this week",
        affirmation: "Let's go. We'll connect you with your location so you can get started immediately. No waiting, no hoops to jump through.",
      },
      {
        letter: 'B',
        title: 'Within the next couple weeks',
        description: "I'm committed, just need to sort out my schedule",
        affirmation: "Smart. We'll send you everything you need to hit the ground running the moment you're ready. When you walk in, it'll feel like you already belong.",
      },
      {
        letter: 'C',
        title: "After upcoming travel",
        description: "I have a trip coming up but I want to start when I'm back",
        affirmation: "No problem at all. We'll get everything set up now so that the day you're back, you can walk straight onto the mat. No lag time, no re-motivation needed. Enjoy your trip knowing this is waiting for you.",
      },
      {
        letter: 'D',
        title: "I'm still exploring",
        description: "I want to learn more before I commit",
        affirmation: "Totally fair. We'll send you some info about our programs and what training actually looks like day to day. No pressure, just the facts so you can decide on your own time.",
      },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showAffirmation, setShowAffirmation] = useState(false)
  const [autoProgress, setAutoProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const answersRef = useRef<Record<number, string>>({})

  const step = steps[currentStep]
  const selected = answers[currentStep] || null
  const totalSteps = steps.length

  const advance = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setAutoProgress(0)
    setShowAffirmation(false)

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      const a = answersRef.current
      const qp = new URLSearchParams({
        m: a[0] || '', e: a[1] || '', c: a[2] || '',
        o: a[3] || '', v: a[4] || '', r: a[5] || '',
      })

      // Send quiz data to GHL + Slack
      const lead = getLead()
      fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: slug,
          email: lead?.email || '',
          name: lead?.name || '',
          m: a[0] || '', e: a[1] || '', c: a[2] || '',
          o: a[3] || '', v: a[4] || '', r: a[5] || '',
        }),
      }).catch(() => {})

      router.push(`/${slug}/quiz/complete?${qp.toString()}`)
    }
  }, [currentStep, totalSteps, slug, router])

  function selectOption(letter: string) {
    answersRef.current = { ...answersRef.current, [currentStep]: letter }
    setAnswers(prev => ({ ...prev, [currentStep]: letter }))
    setShowAffirmation(true)
    setAutoProgress(0)

    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)

    // Start auto-progress bar (5 seconds)
    const duration = 5000
    const tick = 50
    let elapsed = 0
    intervalRef.current = setInterval(() => {
      elapsed += tick
      setAutoProgress(Math.min((elapsed / duration) * 100, 100))
    }, tick)

    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      advance()
    }, duration)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
  <RequireLead>
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      {/* Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between mb-12">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <p className="font-heading text-xs uppercase tracking-widest text-white/40">Start Your Profile</p>
      </div>

      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-12">
          {steps.map((_, i) => (
            <div key={i} className={`w-8 h-1 ${i <= currentStep ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>

        {showAffirmation && selected ? (
          <>
            {/* Affirmation view */}
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-lg text-white/80 leading-relaxed italic mb-12">
                {step.options.find(o => o.letter === selected)?.affirmation}
              </p>

              {/* Auto-progress bar */}
              <div className="w-full h-1 bg-white/10 mb-6">
                <div className="h-full bg-white transition-all duration-75" style={{ width: `${autoProgress}%` }} />
              </div>

              <button
                onClick={advance}
                className="self-end px-10 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest hover:bg-white/90 transition-colors cursor-pointer"
              >
                {currentStep < totalSteps - 1 ? 'Continue' : 'See My Results'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Question view */}
            <h1 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-4">
              {step.question}
            </h1>
            <p className="text-white/50 mb-12">
              {step.subtitle}
            </p>

            <div className="space-y-4">
              {step.options.map(opt => (
                <button
                  key={opt.letter}
                  onClick={() => selectOption(opt.letter)}
                  className="w-full text-left p-6 border border-white/20 hover:border-white/40 transition-all duration-200 flex items-start gap-5 cursor-pointer"
                >
                  <span className="font-heading text-2xl font-bold shrink-0 text-white/30">
                    {opt.letter}
                  </span>
                  <div>
                    <p className="font-heading text-lg uppercase tracking-tight font-bold mb-1">{opt.title}</p>
                    <p className="text-sm text-white/50">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  </RequireLead>
  )
}
