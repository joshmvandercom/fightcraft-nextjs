import { NextRequest, NextResponse } from 'next/server'
import { getSchedule } from '@/lib/content'

export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams.get('location')
  if (!location) {
    return NextResponse.json({ error: 'Location required' }, { status: 400 })
  }

  const schedule = getSchedule(location)
  return NextResponse.json({ schedule })
}
