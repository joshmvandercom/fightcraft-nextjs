import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const where = { source: { not: 'csv_import' } }

    // Get the oldest non-import lead to determine the date range
    const oldest = await prisma.lead.findFirst({
      where,
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })

    if (!oldest) {
      return NextResponse.json({ leadsPerWeek: 0 })
    }

    const totalLeads = await prisma.lead.count({ where })

    const now = new Date()
    const msElapsed = now.getTime() - oldest.createdAt.getTime()
    const weeksElapsed = Math.max(msElapsed / (7 * 24 * 60 * 60 * 1000), 1)

    const leadsPerWeek = Math.round(totalLeads / weeksElapsed)

    return NextResponse.json({ leadsPerWeek })
  } catch (err) {
    console.error('Affiliate stats error:', err)
    return NextResponse.json({ leadsPerWeek: 0 })
  }
}
