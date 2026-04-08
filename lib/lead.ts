import { getSid, getLeadBySid } from '@/lib/sid'

export interface Lead {
  name: string
  email: string
  phone: string
  location: string
}

export function getLead(): Lead | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('fightcraft_lead')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function setLead(lead: Lead) {
  localStorage.setItem('fightcraft_lead', JSON.stringify(lead))
}

export function clearLead() {
  localStorage.removeItem('fightcraft_lead')
}

const QUIZ_COMPLETED_KEY = 'fightcraft_quiz_completed_at'
const QUIZ_LOCKOUT_MS = 28 * 24 * 60 * 60 * 1000 // 28 days

export function markQuizCompleted() {
  if (typeof window === 'undefined') return
  localStorage.setItem(QUIZ_COMPLETED_KEY, new Date().toISOString())
}

export function getQuizCompletedAt(): Date | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(QUIZ_COMPLETED_KEY)
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

export function quizLockoutRemainingMs(): number {
  const completedAt = getQuizCompletedAt()
  if (!completedAt) return 0
  const elapsed = Date.now() - completedAt.getTime()
  return Math.max(0, QUIZ_LOCKOUT_MS - elapsed)
}

export function isQuizLockedOut(): boolean {
  return quizLockoutRemainingMs() > 0
}

export async function getLeadWithSid(): Promise<Lead | null> {
  if (typeof window === 'undefined') return null
  const sid = getSid()
  if (sid) {
    const lead = await getLeadBySid(sid)
    if (lead) {
      setLead(lead)
      return lead
    }
  }
  return getLead()
}

export function hasSidParam(): boolean {
  if (typeof window === 'undefined') return false
  return new URL(window.location.href).searchParams.has('sid')
}
