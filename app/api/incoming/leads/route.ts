import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkIncomingAuth } from '@/lib/incoming-auth'

export async function GET(request: NextRequest) {
  if (!checkIncomingAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const location = url.searchParams.get('location') || 'san-jose'
  const filter = url.searchParams.get('filter') || 'today'

  // Filter window for appointmentAt
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000)

  let appointmentRange: { gte?: Date; lt?: Date } | undefined
  if (filter === 'today') {
    appointmentRange = { gte: startOfToday, lt: endOfToday }
  } else if (filter === 'week') {
    appointmentRange = { gte: startOfToday, lt: endOfWeek }
  } else if (filter === 'month') {
    const endOfMonth = new Date(startOfToday.getTime() + 30 * 24 * 60 * 60 * 1000)
    appointmentRange = { gte: startOfToday, lt: endOfMonth }
  }

  const where: {
    location: string
    appointmentAt?: { gte?: Date; lt?: Date; not?: null }
  } = { location }

  if (appointmentRange) {
    where.appointmentAt = appointmentRange
  } else {
    // 'all' filter — show every lead with an appointment
    where.appointmentAt = { not: null }
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { appointmentAt: 'asc' },
    select: {
      id: true,
      sid: true,
      name: true,
      email: true,
      phone: true,
      source: true,
      status: true,
      statusReason: true,
      notes: true,
      appointmentAt: true,
      createdAt: true,
      _count: { select: { intakes: true } },
    },
    take: 200,
  })

  return NextResponse.json({ leads })
}

export async function PATCH(request: NextRequest) {
  if (!checkIncomingAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status, statusReason, notes } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const data: { status?: string; statusReason?: string | null; notes?: string | null } = {}
  if (status !== undefined) data.status = status
  if (statusReason !== undefined) data.statusReason = statusReason || null
  if (notes !== undefined) data.notes = notes || null

  const lead = await prisma.lead.update({
    where: { id },
    data,
  })

  return NextResponse.json({ lead })
}
