import { NextRequest, NextResponse } from 'next/server'
import { getLocations } from '@/lib/content'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('location')
  if (!slug) return NextResponse.json({ error: 'Location required' }, { status: 400 })

  const location = getLocations().find(l => l.slug === slug)
  if (!location) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  return NextResponse.json({ programs: location.programs })
}
