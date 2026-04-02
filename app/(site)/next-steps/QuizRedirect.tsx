'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getLead } from '@/lib/lead'

// Locations that use the quiz flow
const QUIZ_LOCATIONS = ['san-jose']

export default function QuizRedirect() {
  const router = useRouter()

  useEffect(() => {
    const lead = getLead()
    if (lead && QUIZ_LOCATIONS.includes(lead.location)) {
      router.replace(`/${lead.location}/quiz`)
    }
  }, [router])

  return null
}
