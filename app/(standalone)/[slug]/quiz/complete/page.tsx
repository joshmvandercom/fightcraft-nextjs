'use client'

import { useSearchParams, useParams } from 'next/navigation'
import { Suspense } from 'react'
import RequireLead from '@/components/RequireLead'
import { isQualified } from '@/lib/qualify'

function buildStory(p: string, e: string, c: string, r: string): string[] {
  const lines: string[] = []

  // Open loop
  lines.push("Hey.")
  lines.push("")
  lines.push("At the bottom of this page you're going to be able to take the next step.")
  lines.push("")
  lines.push("But first I want to tell you something.")
  lines.push("")
  lines.push("")

  // Program opener
  if (p.includes('kickboxing')) {
    lines.push("Kickboxing.")
    lines.push("")
    lines.push("Good choice.")
    lines.push("")
    lines.push("It's where most of our members start.")
    lines.push("")
    lines.push("There's something about hitting pads that just resets your whole day.")
    lines.push("")
    lines.push("The stress goes somewhere. Your body wakes up. And you walk out feeling like a completely different person.")
  } else if (p.includes('muay_thai')) {
    lines.push("Muay Thai.")
    lines.push("")
    lines.push("The Art of 8 Limbs.")
    lines.push("")
    lines.push("Fists. Elbows. Knees. Shins. All working together.")
    lines.push("")
    lines.push("It's the most complete striking system in the world.")
    lines.push("")
    lines.push("And it builds a kind of toughness that carries over into everything else you do.")
  } else if (p.includes('jiu_jitsu') || p.includes('bjj')) {
    lines.push("Jiu Jitsu.")
    lines.push("")
    lines.push("The gentle art.")
    lines.push("")
    lines.push("Don't let the name fool you. It's chess with your body.")
    lines.push("")
    lines.push("Every roll is a puzzle. Every class teaches you something new about yourself.")
    lines.push("")
    lines.push("It's the one martial art where a smaller person can control a bigger one. Technique over strength. Always.")
  } else if (p.includes('mma') || p.includes('mixed_martial_arts')) {
    lines.push("MMA.")
    lines.push("")
    lines.push("The complete package.")
    lines.push("")
    lines.push("Striking. Grappling. Wall work. Transitions.")
    lines.push("")
    lines.push("Most martial arts teach you one thing. MMA teaches you everything.")
    lines.push("")
    lines.push("It's the most demanding and the most rewarding training you'll ever do.")
  } else if (p.includes('kids') || p.includes('teens')) {
    lines.push("You're looking into training for a young person in your life.")
    lines.push("")
    lines.push("That's one of the best decisions you can make for them.")
    lines.push("")
    lines.push("Confidence. Discipline. Focus. Real friendships.")
    lines.push("")
    lines.push("The kind of things that no app or after-school program can teach.")
  } else if (p.includes('wrestling')) {
    lines.push("Wrestling.")
    lines.push("")
    lines.push("The foundation of every great fighter.")
    lines.push("")
    lines.push("Takedowns. Control. The ability to dictate where the fight happens.")
    lines.push("")
    lines.push("It's the hardest martial art to train. And the most rewarding.")
  } else {
    lines.push("You're not sure which program yet.")
    lines.push("")
    lines.push("That's actually fine.")
    lines.push("")
    lines.push("Most people who walk through our door don't know either.")
    lines.push("")
    lines.push("That's what we're here for. To help you figure it out.")
  }

  lines.push("")
  lines.push("")

  // Experience woven in
  if (e === 'A') {
    lines.push("Now here's the part where most people get nervous.")
    lines.push("")
    lines.push("\"I've never done this before.\"")
    lines.push("")
    lines.push("Neither had anyone else on day one.")
    lines.push("")
    lines.push("Including me.")
    lines.push("")
    lines.push("A blank slate isn't a disadvantage. It's an advantage.")
    lines.push("")
    lines.push("No bad habits. No ego. Just potential.")
  } else if (e === 'B') {
    lines.push("You've tried this before.")
    lines.push("")
    lines.push("Something about it stuck with you.")
    lines.push("")
    lines.push("That little voice that keeps saying \"I should go back\"?")
    lines.push("")
    lines.push("Listen to it.")
  } else if (e === 'C') {
    lines.push("You already know what good training feels like.")
    lines.push("")
    lines.push("That drive home after a hard session where everything just feels... right.")
    lines.push("")
    lines.push("You're not starting over.")
    lines.push("")
    lines.push("You're picking up where you left off. With better coaching this time.")
  } else {
    lines.push("You're already training.")
    lines.push("")
    lines.push("And you're looking for more.")
    lines.push("")
    lines.push("That tells me everything I need to know about you.")
  }

  lines.push("")
  lines.push("")

  // Commitment
  if (c === 'A' || c === 'B') {
    lines.push("Two to three sessions a week.")
    lines.push("")
    lines.push("That's the number.")
    lines.push("")
    lines.push("Not five. Not every day. Just two or three.")
    lines.push("")
    lines.push("That's where technique sticks.")
    lines.push("")
    lines.push("That's where your body starts to change.")
    lines.push("")
    lines.push("That's where it stops being \"something you're trying\" and becomes part of who you are.")
  } else {
    lines.push("Start with whatever you can.")
    lines.push("")
    lines.push("Once a week. Twice. Doesn't matter.")
    lines.push("")
    lines.push("The people who last aren't the ones who go hardest at the beginning.")
    lines.push("")
    lines.push("They're the ones who keep showing up.")
  }

  lines.push("")
  lines.push("")

  // Close the loop
  lines.push("Remember what I said at the top?")
  lines.push("")

  if (r === 'A') {
    lines.push("You're ready now.")
    lines.push("")
    lines.push("So here it is.")
  } else if (r === 'B') {
    lines.push("You said you need a couple weeks.")
    lines.push("")
    lines.push("That's fine. But go ahead and book now so it's real.")
    lines.push("")
    lines.push("Pick a date that works. We'll be ready.")
  } else if (r === 'C') {
    lines.push("You've got travel coming up.")
    lines.push("")
    lines.push("Book it now anyway. Pick a date after you're back.")
    lines.push("")
    lines.push("That way when you land, it's already on the calendar.")
  } else {
    lines.push("You're still thinking about it.")
    lines.push("")
    lines.push("That's okay. But sometimes the best way to decide...")
    lines.push("")
    lines.push("...is to just put it on the calendar and see how it feels.")
  }

  return lines
}

function QuizResults() {
  const searchParams = useSearchParams()
  const params = useParams()
  const slug = params.slug as string

  const p = searchParams.get('p') || 'explore'
  const e = searchParams.get('e') || 'A'
  const c = searchParams.get('c') || 'A'
  const r = searchParams.get('r') || 'A'
  const i = searchParams.get('i') || undefined

  const story = buildStory(p, e, c, r)
  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug
  const qualified = isQualified({ p, e, c, r, i }, slug)
  const qpStr = new URLSearchParams(Object.fromEntries(searchParams.entries())).toString()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-16">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <p className="font-heading text-xs uppercase tracking-widest text-white/40">Your Profile</p>
      </div>

      <div className="max-w-xl w-full mx-auto flex-1">
        <div className="mb-16">
          {story.map((line, i) => {
            if (line === '') return <div key={i} className="h-4" />
            return <p key={i} className="text-base text-white/70 leading-relaxed">{line}</p>
          })}
        </div>

        <div className="mt-4">
          <a
            href={qualified ? `/${slug}/quiz/book?${qpStr}` : `/${slug}/quiz/thank-you?${qpStr}`}
            className="inline-block w-full max-w-sm py-4 bg-white text-black text-center font-heading text-base font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
          >
            {qualified ? "Let's Do This" : "Next Step"}
          </a>
        </div>
      </div>
    </div>
  )
}

export default function CompletePage() {
  return (
    <RequireLead>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <QuizResults />
      </Suspense>
    </RequireLead>
  )
}
