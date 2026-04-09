import { NextRequest, NextResponse } from 'next/server'
import { notifySlack } from '@/lib/slack'
import { STABLE_KEYS, DISPLAY_LABELS } from '@/lib/quiz-keys'

const WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.WEBHOOK_QUIZ_COMPLETE_SAN_JOSE,
  'merced': process.env.WEBHOOK_QUIZ_COMPLETE_MERCED,
  'brevard': process.env.WEBHOOK_QUIZ_COMPLETE_BREVARD,
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { location, email, name, phone, p, e, c, r, i } = body

  if (!location) {
    return NextResponse.json({ error: 'Location required' }, { status: 400 })
  }

  const webhookUrl = WEBHOOKS[location]
  const isLive = process.env.WEBHOOKS_LIVE === 'true'
  const webhookReady = webhookUrl && !webhookUrl.includes('example.com') && !webhookUrl.includes('placeholder')

  const payload = {
    email: email || '',
    name: name || '',
    phone: phone || '',
    source: 'fightcraft-quiz',
    location,
    // Stable keys for automations - these never change
    quiz_program: p || 'unknown',
    quiz_experience: STABLE_KEYS.experience[e] || e,
    quiz_commitment: STABLE_KEYS.commitment[c] || c,
    quiz_readiness: STABLE_KEYS.readiness[r] || r,
    ...(i ? { quiz_investment: STABLE_KEYS.investment[i] || i } : {}),
    tags: [
      'quiz-completed',
      `program:${p || 'unknown'}`,
      `experience:${STABLE_KEYS.experience[e] || e}`,
      `commitment:${STABLE_KEYS.commitment[c] || c}`,
      `readiness:${STABLE_KEYS.readiness[r] || r}`,
      ...(i ? [`investment:${STABLE_KEYS.investment[i] || i}`] : []),
    ],
  }

  if (isLive && webhookReady) {
    try {
      await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.error('Quiz webhook error:', err)
    }
  } else {
    console.log('[DRY RUN] Quiz completed:', JSON.stringify(payload, null, 2))
  }

  await notifySlack(
    `Quiz Completed: ${name || 'Unknown'} (${email || 'no email'}) | Location: ${location}\n` +
    `Program Interest: ${p || 'unknown'}\n` +
    `Experience: ${DISPLAY_LABELS.experience[e] || e}\n` +
    `Commitment: ${DISPLAY_LABELS.commitment[c] || c}\n` +
    `Readiness: ${DISPLAY_LABELS.readiness[r] || r}` +
    (i ? `\nInvestment: ${DISPLAY_LABELS.investment[i] || i}` : ''),
    location
  )

  return NextResponse.json({ success: true })
}
