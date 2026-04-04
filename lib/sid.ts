'use client'

import type { Lead } from '@/lib/lead'

export function getSid(): string | null {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const paramSid = url.searchParams.get('sid')
  if (paramSid) {
    setSidCookie(paramSid)
    return paramSid
  }
  const match = document.cookie.match(/(?:^|; )fightcraft_sid=([^;]+)/)
  return match ? match[1] : null
}

export function setSidCookie(sid: string) {
  const maxAge = 365 * 24 * 60 * 60
  document.cookie = `fightcraft_sid=${sid}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export async function getLeadBySid(sid: string): Promise<Lead | null> {
  try {
    const res = await fetch(`/api/leads/${sid}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
