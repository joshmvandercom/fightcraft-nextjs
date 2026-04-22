import { NextRequest, NextResponse } from 'next/server'

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_AFFILIATE

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { slack_text } = body

  if (!slack_text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (SLACK_WEBHOOK) {
    try {
      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: slack_text }),
      })
    } catch (err) {
      console.error('Affiliate Slack webhook error:', err)
    }
  } else {
    console.log('[AFFILIATE APPLICATION]', slack_text)
  }

  return NextResponse.json({ success: true })
}
