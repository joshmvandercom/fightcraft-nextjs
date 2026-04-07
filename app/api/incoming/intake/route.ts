import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkIncomingAuth } from '@/lib/incoming-auth'

export async function POST(request: NextRequest) {
  if (!checkIncomingAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { leadId, coach, dob, emergencyName, emergencyPhone, goals, experience, injuries, howHeard, programInterest, availableClasses, waiverAccepted } = body

  if (!leadId) {
    return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })
  }

  const intake = await prisma.intake.create({
    data: {
      leadId,
      coach: coach || null,
      dob: dob || null,
      emergencyName: emergencyName || null,
      emergencyPhone: emergencyPhone || null,
      goals: goals || null,
      experience: experience || null,
      injuries: injuries || null,
      howHeard: howHeard || null,
      programInterest: programInterest || null,
      availableClasses: availableClasses || null,
      waiverAccepted: !!waiverAccepted,
    },
  })

  // Auto-update lead status to attended when intake is completed
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: 'attended' },
  })

  return NextResponse.json({ intake })
}

export async function GET(request: NextRequest) {
  if (!checkIncomingAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const leadId = url.searchParams.get('leadId')
  if (!leadId) {
    return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { intakes: { orderBy: { createdAt: 'desc' } } },
  })

  if (!lead) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ lead })
}
