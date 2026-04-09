'use client'

import { useEffect, useState, useRef } from 'react'
import { getLead } from '@/lib/lead'

const STORAGE_KEY = 'fightcraft_social_proof'
const STORAGE_COUNT_KEY = 'fightcraft_social_proof_count'
const SHOW_MS = 8000
const HIDE_MS = 3000

function loadState(): { names: string[]; index: number; nextShowAt: number } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveState(names: string[], index: number, nextShowAt: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ names, index, nextShowAt }))
  } catch {}
}

export default function SocialProof() {
  const [current, setCurrent] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [totalRecent, setTotalRecent] = useState(0)
  const namesRef = useRef<string[]>([])
  const indexRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Always fetch count + names on mount
  useEffect(() => {
    const lead = getLead()
    const exclude = lead?.email || ''

    fetch(`/api/recent-signups?exclude=${encodeURIComponent(exclude)}`)
      .then(r => r.json())
      .then(data => {
        const names: string[] = data.names || []
        const count: number = data.totalRecent || 0
        setTotalRecent(count)
        if (names.length === 0) return

        const saved = loadState()
        let startIndex = 0
        let initialDelay = 3000

        if (saved && saved.names.length > 0) {
          const now = Date.now()
          const delay = Math.max(0, saved.nextShowAt - now)
          startIndex = delay > 0 ? saved.index : (saved.index + 1) % names.length
          initialDelay = Math.min(delay, HIDE_MS)
        }

        namesRef.current = names
        indexRef.current = startIndex

        function showNext() {
          const name = namesRef.current[indexRef.current]
          setCurrent(name)
          setVisible(true)
          saveState(namesRef.current, indexRef.current, Date.now() + SHOW_MS + HIDE_MS)

          timeoutRef.current = setTimeout(() => {
            setVisible(false)
            timeoutRef.current = setTimeout(() => {
              indexRef.current = (indexRef.current + 1) % namesRef.current.length
              showNext()
            }, HIDE_MS)
          }, SHOW_MS)
        }

        timeoutRef.current = setTimeout(showNext, initialDelay)
      })
      .catch(() => {})

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  if (!current) return null

  return (
    <div
      className={`fixed bottom-24 right-6 z-50 transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-white text-black rounded-full shadow-2xl px-6 py-4 flex items-center gap-4 max-w-sm">
        <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center shrink-0">
          <span className="text-white font-heading text-base font-bold">
            {current?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold truncate">{current} just signed up</p>
          <p className="text-sm text-gray-500">{totalRecent > 1 ? `Along with ${totalRecent - 1} others recently` : 'Recently'}</p>
        </div>
      </div>
    </div>
  )
}
