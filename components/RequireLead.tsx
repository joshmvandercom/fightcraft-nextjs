'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getLead } from '@/lib/lead'

export default function RequireLead({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const [hasLead, setHasLead] = useState(false)
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    const lead = getLead()
    if (lead) {
      setHasLead(true)
    } else {
      router.replace(`/${slug}`)
    }
    setChecked(true)
  }, [router, slug])

  if (!checked || !hasLead) {
    return <div className="min-h-screen bg-black" />
  }

  return <>{children}</>
}
