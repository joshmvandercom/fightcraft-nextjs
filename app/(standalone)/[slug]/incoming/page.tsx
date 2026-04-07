'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Lead {
  id: string
  sid: string
  name: string
  email: string
  phone: string
  source: string
  status: string
  statusReason: string | null
  notes: string | null
  appointmentAt: string | null
  createdAt: string
  _count: { intakes: number }
}

const LOCATION_TZ: Record<string, string> = {
  'san-jose': 'America/Los_Angeles',
  'merced': 'America/Los_Angeles',
  'brevard': 'America/New_York',
}

function formatAppointmentTime(iso: string, slug: string): string {
  const tz = LOCATION_TZ[slug] || 'America/Los_Angeles'
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz })
}

function formatAppointmentDate(iso: string, slug: string): string {
  const tz = LOCATION_TZ[slug] || 'America/Los_Angeles'
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: tz })
}

function extractClassName(notes: string | null): string {
  if (!notes) return ''
  // Notes format: [iso] Booked: ClassName · Day, Mon Day, H:MM PM · Location
  const match = notes.match(/Booked:\s*([^·\n]+?)(?:\s*·|\n|$)/)
  return match ? match[1].trim() : ''
}

const FILTERS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Upcoming' },
]

export default function IncomingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [authed, setAuthed] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState('today')
  const [loading, setLoading] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/incoming/leads?location=${slug}&filter=${filter}`)
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      const data = await res.json()
      setLeads(data.leads || [])
      setAuthed(true)
    } catch {
      setAuthed(false)
    } finally {
      setLoading(false)
    }
  }, [slug, filter])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/incoming/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      fetchLeads()
    } else {
      setAuthError('Wrong password')
    }
  }


  if (authed === null) {
    return <div className="min-h-screen bg-black" />
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
            <h1 className="font-heading text-xl uppercase tracking-widest text-white">Incoming</h1>
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-white focus:outline-none mb-3"
            autoFocus
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button type="submit" className="w-full py-3 bg-white text-black font-heading text-sm uppercase tracking-widest font-bold">Sign In</button>
        </form>
      </div>
    )
  }

  // Group leads by date (in the gym's local timezone)
  const grouped = leads.reduce((acc, lead) => {
    if (!lead.appointmentAt) return acc
    const key = formatAppointmentDate(lead.appointmentAt, slug)
    if (!acc[key]) acc[key] = []
    acc[key].push(lead)
    return acc
  }, {} as Record<string, Lead[]>)

  return (
    <div className="min-h-screen bg-neutral-50 text-black flex flex-col">
      {/* Header */}
      <header className="bg-black text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-8 brightness-0 invert" />
            <h1 className="font-heading text-lg uppercase tracking-widest">Incoming · {slug}</h1>
          </div>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-heading uppercase tracking-widest ${filter === f.value ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Lead list */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {loading && <p className="text-black/40 text-sm">Loading...</p>}
          {!loading && leads.length === 0 && (
            <p className="text-black/40 text-sm">No appointments in this view.</p>
          )}
          <div className="space-y-8">
            {Object.entries(grouped).map(([dateLabel, dayLeads]) => (
              <div key={dateLabel}>
                <h2 className="font-heading text-xs uppercase tracking-widest font-bold text-black/40 mb-3">{dateLabel}</h2>
                <div className="space-y-2">
                  {dayLeads.map(lead => {
                    const className = extractClassName(lead.notes)
                    const time = lead.appointmentAt ? formatAppointmentTime(lead.appointmentAt, slug) : ''
                    return (
                      <button
                        key={lead.id}
                        onClick={() => router.push(`/${slug}/incoming/${lead.id}`)}
                        className="w-full text-left bg-white border border-black/10 p-4 hover:border-black/40 transition-colors flex items-center gap-4"
                      >
                        <div className="w-20 shrink-0">
                          <p className="font-heading text-lg font-bold">{time}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold truncate">{lead.name}</p>
                            {lead._count.intakes > 0 && (
                              <span className="text-[10px] font-heading uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0.5">Intake</span>
                            )}
                          </div>
                          {className && <p className="text-sm text-black/70 truncate">{className}</p>}
                          <p className="text-xs text-black/50 truncate">{lead.phone || lead.email}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
