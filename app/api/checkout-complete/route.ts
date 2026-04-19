import { NextRequest, NextResponse } from 'next/server'
import { notifySlack } from '@/lib/slack'

const WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.WEBHOOK_CHECKOUT_COMPLETE_SAN_JOSE,
  'merced': process.env.WEBHOOK_CHECKOUT_COMPLETE_MERCED,
  'brevard': process.env.WEBHOOK_CHECKOUT_COMPLETE_BREVARD,
}

const OFFER_DISPLAY: Record<string, string> = {
  'web-special-97': 'Web Special',
  'fast-pass-499': '90-Day Fast Pass',
  'early-riser-33': 'Early Riser',
  'start-33': 'Start Training',
  'start-bjj-33': 'Jiu-Jitsu Starter',
  'gear-package-249': 'Gear Package',
  'beginner-program-499': 'Beginner Program',
}

const OFFER_VALUES: Record<string, number> = {
  'web-special-97': 97,
  'fast-pass-499': 499,
  'early-riser-33': 33,
  'start-33': 33,
  'start-bjj-33': 33,
  'gear-package-249': 249,
  'beginner-program-499': 499,
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, name, phone, location, offer } = body

  if (!email || !location) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const webhookUrl = WEBHOOKS[location]
  const isLive = process.env.WEBHOOKS_LIVE === 'true'
  const webhookReady = webhookUrl && !webhookUrl.includes('example.com') && !webhookUrl.includes('placeholder')

  if (isLive && webhookReady) {
    try {
      await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || '',
          phone: phone || '',
          location,
          source: 'fightcraft-web',
          event: 'checkout_completed',
          offer: offer || '',
          offer_name: OFFER_DISPLAY[offer] || offer || '',
          offer_value: OFFER_VALUES[offer] || 0,
          tags: ['checkout_completed', ...(offer ? [`offer:${offer}`] : [])],
        }),
      })
    } catch (err) {
      console.error('Checkout complete webhook error:', err)
    }
  }

  await notifySlack(`Purchase Completed: ${name || 'Unknown'} (${email}) | Offer: ${OFFER_DISPLAY[offer] || offer || 'unknown'} | Location: ${location}`, location)

  return NextResponse.json({ success: true })
}
