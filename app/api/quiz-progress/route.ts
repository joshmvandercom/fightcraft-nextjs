import { NextRequest, NextResponse } from 'next/server'
import { STABLE_KEYS, STEP_KEYS, resolveAnswer } from '@/lib/quiz-keys'

const WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.WEBHOOK_QUIZ_PROGRESS_SAN_JOSE,
  'merced': process.env.WEBHOOK_QUIZ_PROGRESS_MERCED,
  'brevard': process.env.WEBHOOK_QUIZ_PROGRESS_BREVARD,
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { location, email, name, phone, step, answer, answers } = body

  if (!location || !email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const webhookUrl = WEBHOOKS[location]
  const isLive = process.env.WEBHOOKS_LIVE === 'true'
  const webhookReady = webhookUrl && !webhookUrl.includes('example.com') && !webhookUrl.includes('placeholder')

  // Resolve all answers to stable keys
  const resolvedAnswers: Record<string, string> = {}
  for (const [k, v] of Object.entries(answers || {})) {
    const idx = parseInt(k)
    const stepName = STEP_KEYS[idx] || `step_${k}`
    resolvedAnswers[`quiz_${stepName}`] = resolveAnswer(idx, v as string)
  }

  const payload = {
    email,
    name: name || '',
    phone: phone || '',
    source: 'fightcraft-quiz-progress',
    location,
    quiz_step: step,
    quiz_step_name: STEP_KEYS[step] || `step_${step}`,
    quiz_latest_answer: resolveAnswer(step, answer),
    quiz_total_answered: step + 1,
    quiz_total_questions: 6,
    quiz_completed: false,
    ...resolvedAnswers,
    tags: ['quiz-in-progress', `quiz-step-${step + 1}`],
  }

  if (isLive && webhookReady) {
    try {
      await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.error('Quiz progress webhook error:', err)
    }
  } else {
    console.log('[QUIZ PROGRESS]', JSON.stringify(payload, null, 2))
  }

  return NextResponse.json({ success: true })
}
