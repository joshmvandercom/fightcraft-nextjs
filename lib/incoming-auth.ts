import { NextRequest } from 'next/server'

export const INCOMING_COOKIE = 'fightcraft_incoming_auth'

export function checkIncomingAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(INCOMING_COOKIE)?.value
  const expected = process.env.INCOMING_PASSWORD
  if (!expected) return false
  return cookie === expected
}
