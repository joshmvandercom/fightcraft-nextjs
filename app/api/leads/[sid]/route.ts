import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sid: string }> }
) {
  const { sid } = await params

  if (!sid || sid.length < 10) {
    return NextResponse.json({ error: 'Invalid SID' }, { status: 400 })
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { sid },
      select: { name: true, email: true, phone: true, location: true },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
