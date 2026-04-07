import { NextRequest, NextResponse } from 'next/server'
import { INCOMING_COOKIE } from '@/lib/incoming-auth'

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(INCOMING_COOKIE)
  return res
}

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const expected = process.env.INCOMING_PASSWORD

  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(INCOMING_COOKIE, expected, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return res
}
