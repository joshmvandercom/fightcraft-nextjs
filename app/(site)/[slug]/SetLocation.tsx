'use client'

import { useEffect } from 'react'

export default function SetLocation({ slug }: { slug: string }) {
  useEffect(() => {
    localStorage.setItem('fightcraft_location', slug)
  }, [slug])
  return null
}
