import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { event, email, properties } = body

  if (!event || !email) {
    return NextResponse.json({ error: 'event and email required' }, { status: 400 })
  }

  if (process.env.SUPPRESS_ANALYTICS === 'true') {
    console.log('[ANALYTICS SUPPRESSED]', event, email, properties)
    return NextResponse.json({ success: true })
  }

  const apiKey = process.env.AMPLITUDE_SECRET_KEY
  if (!apiKey || apiKey === 'your-amplitude-server-secret-key') {
    console.log('[AMPLITUDE DRY RUN]', event, email, properties)
    return NextResponse.json({ success: true })
  }

  try {
    await fetch('https://api2.amplitude.com/2/httpapi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        events: [{
          event_type: event,
          user_id: email,
          event_properties: properties || {},
        }],
      }),
    })
  } catch (err) {
    console.error('Amplitude server event error:', err)
  }

  return NextResponse.json({ success: true })
}
