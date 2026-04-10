import { NextRequest, NextResponse } from 'next/server'
import { notifySlack } from '@/lib/slack'

const WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.WEBHOOK_QUIZ_COMPLETE_SAN_JOSE,
  'merced': process.env.WEBHOOK_QUIZ_COMPLETE_MERCED,
  'brevard': process.env.WEBHOOK_QUIZ_COMPLETE_BREVARD,
}

export async function POST(request: NextRequest) {
  const { location, email, name, phone, followUpDate, reason } = await request.json()

  const webhookUrl = WEBHOOKS[location]
  const isLive = process.env.WEBHOOKS_LIVE === 'true'
  const webhookReady = webhookUrl && !webhookUrl.includes('example.com') && !webhookUrl.includes('placeholder')

  const payload = {
    email: email || '',
    name: name || '',
    phone: phone || '',
    source: 'fightcraft-quiz-followup',
    location,
    quiz_follow_up_date: followUpDate,
    quiz_follow_up_reason: reason,
  }

  if (isLive && webhookReady) {
    try {
      await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.error('Quiz followup webhook error:', err)
    }
  }

  const dateStr = new Date(followUpDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  await notifySlack(
    `📅 Follow-up Requested: ${name || 'Unknown'} (${email || 'no email'}) | Location: ${location}\n` +
    `Reason: ${reason === 'travel' ? 'Upcoming travel' : 'Still exploring'}\n` +
    `Follow up on: ${dateStr}`,
    location
  )

  return NextResponse.json({ success: true })
}
