import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkIncomingAuth } from '@/lib/incoming-auth'

export async function GET(request: NextRequest) {
  if (!checkIncomingAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const logs = await prisma.webhookLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ logs })
}
