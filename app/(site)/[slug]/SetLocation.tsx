'use client'

import { useEffect } from 'react'

export default function SetLocation({ slug }: { slug: string }) {
  useEffect(() => {
    localStorage.setItem('fightcraft_location', slug)
    localStorage.setItem('fightcraft_location_set_at', Date.now().toString())
  }, [slug])
  return null
}
