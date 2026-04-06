import { NextRequest, NextResponse } from 'next/server'
import { notifySlack } from '@/lib/slack'

const WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.WEBHOOK_SAN_JOSE,
  'merced': process.env.WEBHOOK_MERCED,
  'brevard': process.env.WEBHOOK_BREVARD,
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { event, email, name, phone, location, offer, sid } = body

  if (!event || !email || !location) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const webhookUrl = WEBHOOKS[location]
  const isLive = process.env.WEBHOOKS_LIVE === 'true'
  const webhookReady = webhookUrl && !webhookUrl.includes('example.com') && !webhookUrl.includes('placeholder')

  const payload = {
    email,
    name: name || '',
    phone: phone || '',
    location,
    source: 'fightcraft-web',
    sid: sid || '',
    funnel_event: event,
    funnel_offer: offer || '',
    tags: [event, ...(offer ? [`offer:${offer}`] : [])],
  }

  if (isLive && webhookReady) {
    try {
      await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.error('Funnel event webhook error:', err)
    }
  } else {
    console.log('[FUNNEL EVENT]', JSON.stringify(payload, null, 2))
  }

  return NextResponse.json({ success: true })
}
