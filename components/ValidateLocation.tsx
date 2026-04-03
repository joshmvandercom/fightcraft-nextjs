'use client'

import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'

const VALID_LOCATIONS = ['san-jose', 'merced', 'brevard']

export default function ValidateLocation({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const slug = params.slug as string | undefined

  if (slug && !VALID_LOCATIONS.includes(slug)) {
    notFound()
  }

  return <>{children}</>
}
