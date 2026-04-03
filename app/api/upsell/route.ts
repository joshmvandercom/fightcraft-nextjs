import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { notifySlack } from '@/lib/slack'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
})

const UPSELL_PRICES: Record<string, { envKey: string; amount: number; name: string }> = {
  'handwraps': { envKey: 'STRIPE_PRICE_HANDWRAPS', amount: 1200, name: 'Hand Wraps' },
  'basic-gear': { envKey: 'STRIPE_PRICE_BASIC_GEAR', amount: 18000, name: 'Basic Gear Set' },
  'premium-gear': { envKey: 'STRIPE_PRICE_PREMIUM_GEAR', amount: 19900, name: 'Premium Gear Set + T-Shirt' },
  'meal-plan': { envKey: 'STRIPE_PRICE_MEAL_PLAN', amount: 4900, name: 'Fighter Meal Plan' },
  'meal-plan-coach': { envKey: 'STRIPE_PRICE_MEAL_PLAN_COACH', amount: 9900, name: 'Meal Plan + Accountability Coach' },
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { sessionId, location, upsellId } = body

  if (!sessionId || !upsellId) {
    console.error('Upsell missing fields:', { sessionId, upsellId, location })
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const upsellConfig = UPSELL_PRICES[upsellId]
  if (!upsellConfig) {
    console.error('Invalid upsell ID:', upsellId, 'Valid IDs:', Object.keys(UPSELL_PRICES))
    return NextResponse.json({ error: 'Invalid upsell' }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey.includes('your_') || sessionId === 'dry_run') {
    console.log('[UPSELL DRY RUN]', { sessionId, location, upsellId, amount: upsellConfig.amount })
    await notifySlack(`Upsell Accepted (DRY RUN): ${upsellConfig.name} ($${upsellConfig.amount / 100}) | Location: ${location}`, location)
    return NextResponse.json({ success: true })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'payment_intent.payment_method'],
    })

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent
    if (!paymentIntent) {
      console.error('Upsell: No payment intent on session', sessionId)
      return NextResponse.json({ error: 'No payment found' }, { status: 400 })
    }

    const paymentMethodId = typeof paymentIntent.payment_method === 'string'
      ? paymentIntent.payment_method
      : (paymentIntent.payment_method as Stripe.PaymentMethod)?.id

    if (!paymentMethodId) {
      console.error('Upsell: No payment method on intent', paymentIntent.id)
      return NextResponse.json({ error: 'Cannot process upsell' }, { status: 400 })
    }

    // Get or create customer
    let customerId = session.customer as string | null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.customer_details?.email || session.metadata?.name || '',
        name: session.metadata?.name || '',
        metadata: { source: 'upsell-auto-created', location: location || '' },
      })
      customerId = customer.id

      // Attach payment method to new customer
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    }

    await stripe.paymentIntents.create({
      amount: upsellConfig.amount,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        type: 'upsell',
        upsell_id: upsellId,
        upsell_name: upsellConfig.name,
        location: location || '',
        original_session: sessionId,
      },
    })

    const customerName = session.metadata?.name || 'Unknown'
    await notifySlack(`Upsell Accepted: ${customerName} | ${upsellConfig.name} ($${upsellConfig.amount / 100}) | Location: ${location}`, location)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Upsell error:', err)
    return NextResponse.json({ error: 'Upsell failed' }, { status: 500 })
  }
}
