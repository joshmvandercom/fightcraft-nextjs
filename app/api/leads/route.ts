import { NextRequest, NextResponse } from 'next/server'
import { notifySlack } from '@/lib/slack'

const WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.WEBHOOK_SAN_JOSE,
  'merced': process.env.WEBHOOK_MERCED,
  'brevard': process.env.WEBHOOK_BREVARD,
}

// In-memory rate limit: IP -> timestamps of recent submissions
const submissions = new Map<string, number[]>()
const RATE_LIMIT = 3         // max submissions
const RATE_WINDOW = 60_000   // per 60 seconds

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = submissions.get(ip) || []
  const recent = timestamps.filter(t => now - t < RATE_WINDOW)

  if (recent.length >= RATE_LIMIT) {
    return true
  }

  recent.push(now)
  submissions.set(ip, recent)

  // Cleanup old entries periodically
  if (submissions.size > 10_000) {
    for (const [key, times] of submissions) {
      if (times.every(t => now - t > RATE_WINDOW)) {
        submissions.delete(key)
      }
    }
  }

  return false
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  // Rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { name, email, phone, location, website } = body

  // Honeypot check
  if (website) {
    return NextResponse.json({ success: true })
  }

  // Validation
  if (!name || !email || !location) {
    return NextResponse.json(
      { error: 'Name, email, and location are required.' },
      { status: 400 }
    )
  }

  const webhookUrl = WEBHOOKS[location]
  const isLive = process.env.WEBHOOKS_LIVE === 'true'
  const webhookReady = webhookUrl && !webhookUrl.includes('example.com') && !webhookUrl.includes('placeholder')

  const payload = {
    name,
    email,
    phone: phone || '',
    location,
    source: 'fightcraft-web',
    firstName: name,
    first_name: name,
  }

  if (isLive && webhookReady) {
    try {
      const res = await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        console.error(`Webhook failed for ${location}: ${res.status}`)
      }
    } catch (err) {
      console.error('Webhook error:', err)
    }
  } else if (!webhookReady) {
    console.log(`[NO WEBHOOK] Lead for ${location}, Slack only:`, JSON.stringify(payload, null, 2))
  }

  // Always send Slack regardless of webhook status
  await notifySlack(`New Lead: ${name} (${email}) | Phone: ${phone || 'n/a'} | Location: ${location}`, location)
  return NextResponse.json({ success: true })
}
