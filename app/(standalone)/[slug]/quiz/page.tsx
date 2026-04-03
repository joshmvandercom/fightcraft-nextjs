'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import RequireLead from '@/components/RequireLead'
import { getLead } from '@/lib/lead'
import { track } from '@/lib/analytics'
import { resolveAnswer } from '@/lib/quiz-keys'

interface Option {
  letter: string
  title: string
  description: string
  affirmation: string
  value?: string
}

interface Step {
  question: string
  subtitle: string
  options: Option[]
}

// Program affirmations keyed by program name (lowercased)
const PROGRAM_AFFIRMATIONS: Record<string, string> = {
  kickboxing: "Kickboxing is where most of our members start. Whether you're here for fitness, stress relief, or learning to strike, this is the fastest path to feeling like a different person.",
  'muay thai': "The Art of 8 Limbs. Muay Thai builds the most well-rounded strikers on the planet. You're going to love what this does for your confidence and conditioning.",
  'brazilian jiu jitsu': "The gentle art. BJJ is chess with your body. If you want something that challenges your mind as much as your body, you found it.",
  'no gi jiu jitsu': "No Gi is fast, dynamic, and the most modern form of grappling. If you want to develop real scrambling ability and submission skills, this is it.",
  'kids martial arts': "Building the next generation. Our kids program develops confidence, discipline, and real skills in a safe, supportive environment.",
  'kids & teens': "Building the next generation. Our kids and teens program develops confidence, discipline, and real skills in a safe, supportive environment.",
  'teens kickboxing': "Teens training is one of the best investments you can make for your child. Confidence, discipline, and a positive community.",
  'mixed martial arts': "MMA is the complete package. Wall work, striking, grappling, and everything in between. If you want to be a well-rounded martial artist, this is the path.",
  wrestling: "Wrestling is the foundation of all combat sports. Takedowns, control, and the kind of grit that carries over into everything you do.",
}

const STATIC_STEPS: Step[] = [
  {
    question: "Where are you starting from right now?",
    subtitle: "Every elite practitioner was a beginner once. Knowing your starting point lets us design your fastest path forward.",
    options: [
      { letter: 'A', title: 'Complete beginner', description: "I've never trained before", affirmation: "Perfect. You're exactly who we built this for. Our coaches specialize in taking people from zero to confident, and you'll be amazed how quickly things click when you have the right instruction." },
      { letter: 'B', title: 'Tried it once or twice', description: "I've dabbled but never committed", affirmation: "That first taste clearly left an impression. The difference between dabbling and transforming is having the right environment and coaches. That's what we're here for." },
      { letter: 'C', title: 'Some experience', description: "I've trained consistently at some point", affirmation: "You know what training feels like and you know it works. Coming back with intention and better coaching is going to unlock a level you haven't hit yet." },
      { letter: 'D', title: 'Active practitioner', description: 'I train now but I want better instruction', affirmation: "Respect. Recognizing that your environment matters as much as your effort is a sign of a serious practitioner. Our coaches and training partners will push you to the next level." },
    ],
  },
  {
    question: "Can you commit to 2-3 sessions per week?",
    subtitle: "This is where the real results happen. Consistency beats intensity every time.",
    options: [
      { letter: 'A', title: "Absolutely", description: "I can make 2-3 sessions work", affirmation: "That's the sweet spot. Two to three sessions per week is where technique starts to stick, fitness compounds, and you'll feel the difference in every part of your life within weeks." },
      { letter: 'B', title: "With some adjustments", description: "I'll need to rearrange a few things", affirmation: "That willingness is everything. Our schedule runs from 6am to 9pm most days, so there's almost always a class that fits." },
      { letter: 'C', title: "1-2 times to start", description: "I want to ease in and build from there", affirmation: "Starting with once or twice a week is completely fine. Many of our most dedicated members started exactly that way. The important thing is showing up." },
      { letter: 'D', title: "I'm not sure yet", description: "My schedule changes a lot", affirmation: "We get it. That's why we don't do rigid class packages. Our membership gives you unlimited access so you can train whenever your schedule allows." },
    ],
  },
  {
    question: "What's the real thing standing in your way?",
    subtitle: "Every person who's ever trained has faced one of these. Which one is yours?",
    options: [
      { letter: 'A', title: 'Time', description: 'I want to train but fitting it in feels impossible', affirmation: "We hear this more than anything. That's exactly why we offer classes from early morning to late evening, every day of the week. We'll find a slot that works." },
      { letter: 'B', title: "Intimidation", description: "It feels like a world I'm not sure I belong in yet", affirmation: "That feeling is completely normal and it disappears faster than you'd think. Every single person on our mat felt it on day one. Within a week, you'll wonder why you waited." },
      { letter: 'C', title: "Physical readiness", description: "I want to get fit first before I start", affirmation: "Here's the truth: you don't get in shape to start training. You start training to get in shape. Our classes meet you where you are." },
      { letter: 'D', title: "Cost", description: "I'm concerned about the investment", affirmation: "We get it. We offer flexible options and there's no long-term contract. Most members tell us it's the best money they spend each month." },
      { letter: 'E', title: "Nothing", description: "I'm ready to go", affirmation: "That's the energy. Let's not waste another day." },
    ],
  },
  {
    question: "A year from now, what does success look like?",
    subtitle: "This one matters. Visualizing your outcome is the first act of achieving it.",
    options: [
      { letter: 'A', title: 'I move through the world with confidence', description: 'People can tell something has changed', affirmation: "That quiet confidence is the most common transformation our members describe. It doesn't come from learning to fight. It comes from knowing you can." },
      { letter: 'B', title: "I've found my people", description: 'Training is the best part of my week', affirmation: "The community is what keeps people training for years. The workout gets you in the door. The people keep you coming back." },
      { letter: 'C', title: "I've leveled up and competed", description: "Tangible proof that I've grown", affirmation: "There's nothing like testing yourself. Whether it's your first tournament or your tenth, our coaches will have you prepared and our team will be in your corner." },
      { letter: 'D', title: "I'm the healthiest I've ever been", description: 'Body and mind both sharper', affirmation: "Martial arts delivers fitness that a regular gym can't touch because you're so focused on learning that you forget you're working out." },
    ],
  },
  {
    question: "How soon are you looking to start?",
    subtitle: "No pressure. Just helps us know how to follow up.",
    options: [
      { letter: 'A', title: "I'm ready now", description: "I want to get on the mat this week", affirmation: "Let's go. We'll connect you with your location so you can get started immediately." },
      { letter: 'B', title: 'Within the next couple weeks', description: "Just need to sort out my schedule", affirmation: "Smart. We'll send you everything you need to hit the ground running the moment you're ready." },
      { letter: 'C', title: "After upcoming travel", description: "I want to start when I'm back", affirmation: "No problem at all. We'll get everything set up now so that the day you're back, you can walk straight onto the mat." },
      { letter: 'D', title: "I'm still exploring", description: "I want to learn more before I commit", affirmation: "Totally fair. We'll send you what you need to decide on your own time. No pressure." },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showAffirmation, setShowAffirmation] = useState(false)
  const [autoProgress, setAutoProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const answersRef = useRef<Record<number, string>>({})
  const programValuesRef = useRef<Record<string, string>>({})

  // Fetch location programs and build Q1 (or skip if program is pre-set)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const presetProgram = urlParams.get('p')

    fetch(`/api/programs?location=${slug}`)
      .then(r => r.json())
      .then(data => {
        const programs: string[] = data.programs || []
        const letters = 'ABCDEFGHIJKLMNOP'

        // Programs that map to the same quiz_program value
        const PROGRAM_VALUE_OVERRIDES: Record<string, string> = {
          'muay_thai': 'kickboxing',
        }

        const programOptions: Option[] = programs.map((name: string, i: number) => {
          const rawValue = name.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and')
          return {
            letter: letters[i],
            title: name,
            description: '',
            affirmation: PROGRAM_AFFIRMATIONS[name.toLowerCase()] || `Great choice. ${name} is one of our most popular programs. Let's find the right path for you.`,
            value: PROGRAM_VALUE_OVERRIDES[rawValue] || rawValue,
          }
        })

        programOptions.push({
          letter: letters[programs.length],
          title: "I'm not sure yet",
          description: "I want to explore my options",
          affirmation: "That's totally fine. That's what we're here for. Let's figure out the right fit together.",
          value: 'explore',
        })

        const valueMap: Record<string, string> = {}
        programOptions.forEach(opt => {
          valueMap[opt.letter] = opt.value || opt.letter
        })
        programValuesRef.current = valueMap

        // If program is pre-set via URL, skip Q1
        if (presetProgram) {
          // Find the matching option and pre-set the answer
          const matchingOpt = programOptions.find(opt => opt.value === presetProgram)
          if (matchingOpt) {
            answersRef.current = { 0: matchingOpt.letter }
            setAnswers({ 0: matchingOpt.letter })
          }
          // Still include Q1 in steps (for param indexing) but start at step 1
          const q1: Step = {
            question: "What brought you here?",
            subtitle: "Pick the one that interests you most.",
            options: programOptions,
          }
          setSteps([q1, ...STATIC_STEPS])
          setCurrentStep(1)
          track('quiz_started', { location: slug, program: presetProgram })
        } else {
          const q1: Step = {
            question: "What brought you here?",
            subtitle: "Pick the one that interests you most. You can always try others later.",
            options: programOptions,
          }
          setSteps([q1, ...STATIC_STEPS])
          track('quiz_started', { location: slug })
        }
      })
  }, [slug])

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
      // Q1 is program (use the value, not the letter)
      const programValue = programValuesRef.current[a[0]] || a[0]
      const qp = new URLSearchParams({
        p: programValue, e: a[1] || '', c: a[2] || '',
        o: a[3] || '', v: a[4] || '', r: a[5] || '',
      })

      track('quiz_completed', { location: slug, program: programValue })

      // Send quiz data to GHL + Slack
      const lead = getLead()
      fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: slug,
          email: lead?.email || '',
          name: lead?.name || '',
          phone: lead?.phone || '',
          p: programValue, e: a[1] || '', c: a[2] || '',
          o: a[3] || '', v: a[4] || '', r: a[5] || '',
        }),
      }).catch(() => {})

      router.push(`/${slug}/quiz/complete?${qp.toString()}`)
    }
  }, [currentStep, totalSteps, slug, router])

  function selectOption(letter: string) {
    const updatedAnswers = { ...answersRef.current, [currentStep]: letter }
    answersRef.current = updatedAnswers
    setAnswers(prev => ({ ...prev, [currentStep]: letter }))
    setShowAffirmation(true)
    setAutoProgress(0)

    // Track in Amplitude
    const stepNames = ['program', 'experience', 'commitment', 'objection', 'vision', 'readiness']
    const resolvedValue = currentStep === 0 ? (programValuesRef.current[letter] || letter) : resolveAnswer(currentStep, letter)
    track('quiz_step_answered', { location: slug, step: stepNames[currentStep], answer: resolvedValue })

    // Fire quiz progress webhook
    const lead = getLead()
    fetch('/api/quiz-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: slug,
        email: lead?.email || '',
        name: lead?.name || '',
        phone: lead?.phone || '',
        step: currentStep,
        answer: currentStep === 0 ? (programValuesRef.current[letter] || letter) : letter,
        answers: Object.fromEntries(
          Object.entries(updatedAnswers).map(([k, v]) =>
            [k, k === '0' ? (programValuesRef.current[v] || v) : v]
          )
        ),
      }),
    }).catch(() => {})

    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!step) {
    return <RequireLead><div className="min-h-screen bg-black" /></RequireLead>
  }

  return (
  <RequireLead>
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between mb-12">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <p className="font-heading text-xs uppercase tracking-widest text-white/40">Start Your Profile</p>
      </div>

      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-12">
          {steps.map((_, i) => (
            <div key={i} className={`w-8 h-1 ${i <= currentStep ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>

        {showAffirmation && selected ? (
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-lg text-white/80 leading-relaxed italic mb-12">
              {step.options.find(o => o.letter === selected)?.affirmation}
            </p>
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
        ) : (
          <>
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
                    {opt.description && <p className="text-sm text-white/50">{opt.description}</p>}
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
