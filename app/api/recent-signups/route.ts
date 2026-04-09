import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const exclude = request.nextUrl.searchParams.get('exclude') || ''

  const leads = await prisma.lead.findMany({
    where: {
      source: { not: 'csv_import' },
      ...(exclude ? { email: { not: exclude } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { name: true },
  })

  const names = leads
    .map(l => {
      const parts = (l.name || '').trim().split(/\s+/)
      const first = parts[0]
      const lastInitial = parts[1]?.[0]
      if (!first) return null
      return lastInitial ? `${first} ${lastInitial}.` : first
    })
    .filter(Boolean)

  const totalRecent = await prisma.lead.count({
    where: {
      source: { not: 'csv_import' },
    },
  })

  return NextResponse.json({ names, totalRecent })
}
