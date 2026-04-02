import { NextRequest, NextResponse } from 'next/server'
import { notifySlack } from '@/lib/slack'

const WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.WEBHOOK_SAN_JOSE,
  'merced': process.env.WEBHOOK_MERCED,
  'brevard': process.env.WEBHOOK_BREVARD,
}

// Stable keys for GHL automations. These NEVER change even if quiz copy changes.
const STABLE_KEYS: Record<string, Record<string, string>> = {
  motivation: {
    A: 'self_defense',
    B: 'personal_growth',
    C: 'fitness',
    D: 'competition',
  },
  experience: {
    A: 'beginner',
    B: 'dabbled',
    C: 'some_experience',
    D: 'active',
  },
  commitment: {
    A: 'committed_2_3x',
    B: 'willing_to_adjust',
    C: 'starting_slow',
    D: 'unsure',
  },
  objection: {
    A: 'time',
    B: 'intimidation',
    C: 'fitness_first',
    D: 'cost',
    E: 'none',
  },
  vision: {
    A: 'confidence',
    B: 'community',
    C: 'competition',
    D: 'health',
  },
  readiness: {
    A: 'ready_now',
    B: 'couple_weeks',
    C: 'after_travel',
    D: 'exploring',
  },
}

// Human-readable labels for Slack notifications only
const DISPLAY_LABELS: Record<string, Record<string, string>> = {
  motivation: {
    A: 'Self-defense & personal protection',
    B: 'Personal growth & discipline',
    C: 'Fitness with a real purpose',
    D: 'Competition & sport',
  },
  experience: {
    A: 'Complete beginner',
    B: 'Tried it once or twice',
    C: 'Some experience',
    D: 'Active practitioner',
  },
  commitment: {
    A: '2-3 sessions per week',
    B: 'Willing to adjust schedule',
    C: '1-2 times to start',
    D: 'Not sure yet',
  },
  objection: {
    A: 'Time',
    B: 'Intimidation',
    C: 'Physical readiness',
    D: 'Cost',
    E: 'Nothing - ready to go',
  },
  vision: {
    A: 'Confidence',
    B: 'Community',
    C: 'Competition',
    D: 'Health & fitness',
  },
  readiness: {
    A: 'Ready now',
    B: 'Within a couple weeks',
    C: 'After travel',
    D: 'Still exploring',
  },
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { location, email, name, m, e, c, o, v, r } = body

  if (!location) {
    return NextResponse.json({ error: 'Location required' }, { status: 400 })
  }

  const webhookUrl = WEBHOOKS[location]
  const isLive = process.env.WEBHOOKS_LIVE === 'true'

  const payload = {
    email: email || '',
    name: name || '',
    source: 'fightcraft-quiz',
    location,
    // Stable keys for automations - these never change
    quiz_motivation: STABLE_KEYS.motivation[m] || m,
    quiz_experience: STABLE_KEYS.experience[e] || e,
    quiz_commitment: STABLE_KEYS.commitment[c] || c,
    quiz_objection: STABLE_KEYS.objection[o] || o,
    quiz_vision: STABLE_KEYS.vision[v] || v,
    quiz_readiness: STABLE_KEYS.readiness[r] || r,
    tags: [
      'quiz-completed',
      `motivation:${STABLE_KEYS.motivation[m] || m}`,
      `experience:${STABLE_KEYS.experience[e] || e}`,
      `commitment:${STABLE_KEYS.commitment[c] || c}`,
      `objection:${STABLE_KEYS.objection[o] || o}`,
      `vision:${STABLE_KEYS.vision[v] || v}`,
      `readiness:${STABLE_KEYS.readiness[r] || r}`,
    ],
  }

  if (isLive && webhookUrl) {
    try {
      await fetch(webhookUrl, {
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
    `Motivation: ${DISPLAY_LABELS.motivation[m] || m}\n` +
    `Experience: ${DISPLAY_LABELS.experience[e] || e}\n` +
    `Commitment: ${DISPLAY_LABELS.commitment[c] || c}\n` +
    `Objection: ${DISPLAY_LABELS.objection[o] || o}\n` +
    `Vision: ${DISPLAY_LABELS.vision[v] || v}\n` +
    `Readiness: ${DISPLAY_LABELS.readiness[r] || r}`
  )

  return NextResponse.json({ success: true })
}
