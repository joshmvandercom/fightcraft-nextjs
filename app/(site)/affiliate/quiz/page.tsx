'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

interface Option {
  letter: string
  label: string
  description?: string
}

interface Step {
  question: string
  subtitle: string
  key: string
  options: Option[]
}

const STEPS: Step[] = [
  {
    question: 'Do you currently offer a striking program?',
    subtitle: 'Kickboxing, Muay Thai, or MMA',
    key: 'has_striking',
    options: [
      { letter: 'A', label: 'Yes, we have a striking program', description: 'We already run kickboxing, Muay Thai, or MMA classes.' },
      { letter: 'B', label: 'No, but we want to add one', description: "We're interested in adding a striking program to our gym." },
      { letter: 'C', label: "No, and we're not sure yet", description: "We're exploring what makes sense for our gym." },
    ],
  },
  {
    question: 'How many active students do you have?',
    subtitle: 'Approximate current membership',
    key: 'student_count',
    options: [
      { letter: 'A', label: 'Under 50' },
      { letter: 'B', label: '50 to 100' },
      { letter: 'C', label: '100 to 200' },
      { letter: 'D', label: '200+' },
    ],
  },
  {
    question: 'What is your current monthly revenue?',
    subtitle: 'This helps us understand where you are today',
    key: 'current_revenue',
    options: [
      { letter: 'A', label: 'Under $10k/month' },
      { letter: 'B', label: '$10k to $25k/month' },
      { letter: 'C', label: '$25k to $50k/month' },
      { letter: 'D', label: '$50k+/month' },
    ],
  },
  {
    question: 'What is your revenue goal?',
    subtitle: 'Where do you want to be',
    key: 'goal_revenue',
    options: [
      { letter: 'A', label: '$25k/month' },
      { letter: 'B', label: '$50k/month' },
      { letter: 'C', label: '$100k/month' },
      { letter: 'D', label: '$100k+/month' },
    ],
  },
  {
    question: 'What do you most want help with?',
    subtitle: 'Pick the biggest priority right now',
    key: 'primary_goal',
    options: [
      { letter: 'A', label: 'Growing revenue', description: 'More students, better pricing, higher retention.' },
      { letter: 'B', label: 'Systems and operations', description: 'Curriculum, class structure, SOPs, and consistency.' },
      { letter: 'C', label: 'Marketing and lead generation', description: 'Ads, funnels, and getting people through the door.' },
      { letter: 'D', label: 'Hiring and team building', description: 'Finding coaches, training them, and building culture.' },
      { letter: 'E', label: 'Adding a new program', description: 'Launching kickboxing, Muay Thai, or MMA at my gym.' },
    ],
  },
  {
    question: 'How soon are you looking to get started?',
    subtitle: 'No wrong answer here',
    key: 'timeline',
    options: [
      { letter: 'A', label: 'As soon as possible' },
      { letter: 'B', label: 'In the next 1 to 3 months' },
      { letter: 'C', label: 'In the next 3 to 6 months' },
      { letter: 'D', label: 'Just exploring for now' },
    ],
  },
]

const STEP_LABELS: Record<string, string> = {
  has_striking: 'Striking Program',
  student_count: 'Active Students',
  current_revenue: 'Current Revenue',
  goal_revenue: 'Revenue Goal',
  primary_goal: 'Primary Goal',
  timeline: 'Timeline',
}

export default function AffiliateQuizPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pageLoadTime] = useState(() => Date.now())

  function selectOption(key: string, letter: string, label: string) {
    const updated = { ...answers, [key]: label }
    setAnswers(updated)

    track('affiliate_quiz_step', { step: key, answer: letter })

    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setShowForm(true)
      }
    }, 300)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value
    const gymName = (form.elements.namedItem('gym_name') as HTMLInputElement).value
    const gymLocation = (form.elements.namedItem('gym_location') as HTMLInputElement).value
    const programs = (form.elements.namedItem('programs') as HTMLInputElement).value
    const website = (form.elements.namedItem('website') as HTMLInputElement).value

    // Honeypot
    if (website) {
      setSubmitted(true)
      return
    }

    // Build summary for Slack
    const quizSummary = Object.entries(answers)
      .map(([key, val]) => `${STEP_LABELS[key] || key}: ${val}`)
      .join('\n')

    const slackText = [
      `*New Affiliate Application*`,
      `*Name:* ${name}`,
      `*Email:* ${email}`,
      `*Phone:* ${phone}`,
      `*Gym:* ${gymName}`,
      `*Location:* ${gymLocation}`,
      `*Current Programs:* ${programs || 'Not specified'}`,
      ``,
      `*Quiz Answers:*`,
      quizSummary,
    ].join('\n')

    try {
      // Send to Slack only (no DB or GHL for affiliate leads)
      await fetch('/api/affiliate-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slack_text: slackText }),
      })

      track('affiliate_application_submitted')
      setSubmitted(true)
    } catch {}
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between mb-12">
          <a href="/">
            <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
          </a>
          <a href="/affiliate" className="font-heading text-xs uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors">
            Affiliate
          </a>
        </div>

        <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center">
          <h1 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">
            Application Received.
          </h1>
          <p className="text-lg text-white/70 mb-4">
            We&apos;ll review your info and reach out within 48 hours to schedule a call.
          </p>
          <p className="text-white/50">
            In the meantime, feel free to explore what we&apos;re building.
          </p>
          <div className="mt-8">
            <a
              href="/affiliate"
              className="inline-block py-3 px-8 bg-white/10 text-white font-heading text-sm uppercase tracking-widest hover:bg-white/20 transition-colors"
            >
              Back to Affiliate
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between mb-12">
          <a href="/">
            <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
          </a>
          <a href="/affiliate" className="font-heading text-xs uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors">
            Affiliate
          </a>
        </div>

        <div className="max-w-2xl w-full mx-auto flex-1">
          {/* Progress */}
          <div className="flex gap-1.5 mb-12">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-white/20" />
            ))}
            <div className="h-1 flex-1 rounded-full bg-white" />
          </div>

          <h1 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-4">
            Last Step. Tell Us About You.
          </h1>
          <p className="text-white/50 mb-12">
            We&apos;ll use this to reach out and set up a call.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Your Best Email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Your Phone Number"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">
                Gym Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="gym_name"
                placeholder="Your Gym's Name"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">
                Gym Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="gym_location"
                placeholder="City, State"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">
                Current Programs
              </label>
              <input
                type="text"
                name="programs"
                placeholder="e.g. BJJ, No-Gi, Kids"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
            {/* Honeypot */}
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-white text-black font-heading text-lg font-bold uppercase tracking-widest rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const step = STEPS[currentStep]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between mb-12">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <a href="/affiliate" className="font-heading text-xs uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors">
          Affiliate
        </a>
      </div>

      <div className="max-w-2xl w-full mx-auto flex-1">
        {/* Progress */}
        <div className="flex gap-1.5 mb-12">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= currentStep ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
          <div className="h-1 flex-1 rounded-full bg-white/20" />
        </div>

        {/* Question */}
        <h1 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-4">
          {step.question}
        </h1>
        <p className="text-white/50 mb-12">{step.subtitle}</p>

        {/* Options */}
        <div className="space-y-4">
          {step.options.map((opt) => (
            <button
              key={opt.letter}
              onClick={() => selectOption(step.key, opt.letter, opt.label)}
              className="w-full text-left p-6 border border-white/20 hover:border-white/40 transition-all duration-200 flex items-start gap-5 cursor-pointer"
            >
              <span className="font-heading text-2xl font-bold shrink-0 text-white/30">
                {opt.letter}
              </span>
              <div>
                <p className="font-heading text-lg uppercase tracking-tight font-bold mb-1">
                  {opt.label}
                </p>
                {opt.description && (
                  <p className="text-sm text-white/50 mt-1">{opt.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
