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
