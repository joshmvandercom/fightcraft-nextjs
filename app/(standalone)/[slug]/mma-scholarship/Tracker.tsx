'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import { fireFunnelEvent } from '@/lib/funnel'

export default function Tracker({ slug }: { slug: string }) {
  useEffect(() => {
    localStorage.setItem('fightcraft_location', slug)
    localStorage.setItem('fightcraft_location_set_at', Date.now().toString())
    track('page_view', { location: slug, page: 'mma-scholarship', lead_source: 'meta' })
    fireFunnelEvent('offer_viewed', 'mma-scholarship')
  }, [slug])
  return null
}
