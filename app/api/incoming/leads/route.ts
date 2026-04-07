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

  const now = new Date()
  let since: Date | null = null

  if (filter === 'today') {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (filter === 'week') {
    since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (filter === 'month') {
    since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  const where: { location: string; createdAt?: { gte: Date }; status?: string } = { location }
  if (since) where.createdAt = { gte: since }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
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
