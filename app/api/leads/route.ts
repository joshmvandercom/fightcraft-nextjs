import { NextRequest, NextResponse } from 'next/server'
import { notifySlack } from '@/lib/slack'
import { prisma } from '@/lib/db'

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

const MIN_TIME_ON_PAGE = 3000 // 3 seconds

function isSpam(name: string, email: string, timestamp?: number): boolean {
  // Time on page: reject if submitted faster than a human can fill a form
  if (timestamp && Date.now() - timestamp < MIN_TIME_ON_PAGE) return true

  // Email patterns: excessive dots in local part (be.r.oh.iyed.o style)
  const localPart = email.split('@')[0]
  const dotCount = (localPart.match(/\./g) || []).length
  if (dotCount >= 4) return true

  // Email: reject if local part is mostly random characters (high consonant ratio)
  const stripped = localPart.replace(/[^a-zA-Z]/g, '')
  if (stripped.length >= 6) {
    const vowels = (stripped.match(/[aeiou]/gi) || []).length
    if (vowels / stripped.length < 0.15) return true
  }

  // Name: reject if not plausibly human (no vowels, random strings)
  const nameLetters = name.replace(/[^a-zA-Z]/g, '')
  if (nameLetters.length >= 4) {
    const nameVowels = (nameLetters.match(/[aeiou]/gi) || []).length
    if (nameVowels / nameLetters.length < 0.1) return true
  }

  // Name: reject if name is clearly a random string (all uppercase, no spaces, too long)
  if (name.length > 5 && name === name.toUpperCase() && !name.includes(' ')) return true

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
  const { name, email, phone, location, website, lead_source, _t } = body

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

  // Spam detection (all fail silently)
  if (isSpam(name, email, _t)) {
    return NextResponse.json({ success: true })
  }

  // Upsert lead in database — dedup by email, update info if they come back
  let sid = ''
  try {
    const lead = await prisma.lead.upsert({
      where: { email },
      update: {
        name,
        phone: phone || undefined,
        location,
      },
      create: {
        name,
        email,
        phone: phone || '',
        location,
        source: lead_source || 'website',
      },
    })
    sid = lead.sid
  } catch (err) {
    console.error('DB lead creation failed:', err)
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
    lead_source: lead_source || 'website',
    firstName: name,
    first_name: name,
    sid,
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

  return NextResponse.json({ success: true, sid })
}
