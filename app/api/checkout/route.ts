import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { notifySlack } from '@/lib/slack'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
})

const OFFER_PRICES: Record<string, string | undefined> = {
  'web-special-97': process.env.STRIPE_PRICE_WEB_SPECIAL,
  'fast-pass-499': process.env.STRIPE_PRICE_FAST_PASS,
  'early-riser-33': process.env.STRIPE_PRICE_EARLY_RISER,
  'start-33': process.env.STRIPE_PRICE_EARLY_RISER,
  'start-bjj-33': process.env.STRIPE_PRICE_EARLY_RISER,
  'gear-package-249': process.env.STRIPE_PRICE_GEAR_PACKAGE,
  'beginner-program-499': process.env.STRIPE_PRICE_BEGINNER_PROGRAM,
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, name, phone, location, offer, cancelPath } = body

  const VALID_LOCATIONS = ['san-jose', 'merced', 'brevard']
  if (!email || !location || !offer) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!VALID_LOCATIONS.includes(location)) {
    return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
  }

  const price = OFFER_PRICES[offer]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fightcraft.com'

  if (!price || price.includes('your_')) {
    console.log('[STRIPE DRY RUN] Would create checkout for:', { email, name, location, offer, price })
    await notifySlack(`Checkout Initiated (DRY RUN): ${name} (${email}) | Offer: ${offer} | Location: ${location}`, location)
    return NextResponse.json({ url: `/${location}/checkout/gear?session_id=dry_run` })
  }

  try {
    // Create customer upfront so upsells can charge the saved payment method
    const customer = await stripe.customers.create({
      email,
      name: name || '',
      metadata: { phone: phone || '', location, offer, source: 'fightcraft-web' },
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price, quantity: 1 }],
      customer: customer.id,
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
      success_url: `${baseUrl}/${location}/checkout/gear?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancelPath || `/${location}/web-special`}`,
      metadata: {
        name: name || '',
        phone: phone || '',
        location,
        offer,
        source: 'fightcraft-web',
      },
    })

    await notifySlack(`Checkout Started: ${name} (${email}) | Offer: ${offer} | Location: ${location}`, location)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
