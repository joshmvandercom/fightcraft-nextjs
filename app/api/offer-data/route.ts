import { NextRequest, NextResponse } from 'next/server'
import { getOffer, getProgramConfig, getLocations } from '@/lib/content'

export async function GET(request: NextRequest) {
  const programSlug = request.nextUrl.searchParams.get('program')
  const offerSlug = request.nextUrl.searchParams.get('offer')
  const locationSlug = request.nextUrl.searchParams.get('location')

  if (!programSlug || !offerSlug) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const offer = getOffer(offerSlug)
  const program = getProgramConfig(programSlug)
  const location = locationSlug ? getLocations().find(l => l.slug === locationSlug) : null

  if (!offer || !program) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ offer, program, owner: location?.owner || 'Josh' })
}
