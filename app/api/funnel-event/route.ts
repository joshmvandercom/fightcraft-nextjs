import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { event, email, location, offer } = body

  if (!event || !email || !location) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  console.log('[FUNNEL EVENT]', JSON.stringify({ event, email, location, offer }, null, 2))

  return NextResponse.json({ success: true })
}
