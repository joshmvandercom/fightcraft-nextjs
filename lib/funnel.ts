'use client'

import { getLead } from '@/lib/lead'
import { getSid } from '@/lib/sid'

export function fireFunnelEvent(event: string, offer?: string) {
  const lead = getLead()
  if (!lead?.email) return

  const sid = getSid()

  fetch('/api/funnel-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      email: lead.email,
      name: lead.name,
      phone: lead.phone,
      location: lead.location,
      offer,
      sid: sid || '',
    }),
  }).catch(() => {})
}
