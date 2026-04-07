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
  createdAt: string
  _count: { intakes: number }
}

const STATUSES = [
  { value: 'lead', label: 'Lead', color: 'bg-neutral-200 text-neutral-700' },
  { value: 'booked', label: 'Booked', color: 'bg-blue-100 text-blue-800' },
  { value: 'attended', label: 'Attended', color: 'bg-green-100 text-green-800' },
  { value: 'no_show', label: 'No Show', color: 'bg-amber-100 text-amber-800' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'won', label: 'Won', color: 'bg-emerald-600 text-white' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
]

const FILTERS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function IncomingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [authed, setAuthed] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState('today')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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

  const filteredLeads = statusFilter === 'all' ? leads : leads.filter(l => l.status === statusFilter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.value] = leads.filter(l => l.status === s.value).length
    return acc
  }, {} as Record<string, number>)

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

      {/* Status pills */}
      <div className="bg-white border-b border-black/10 px-6 py-3">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border ${statusFilter === 'all' ? 'bg-black text-white border-black' : 'border-black/20 text-black/60 hover:border-black/40'}`}
          >
            All ({leads.length})
          </button>
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border ${statusFilter === s.value ? 'bg-black text-white border-black' : `${s.color} border-transparent`}`}
            >
              {s.label} ({counts[s.value] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Lead list */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {loading && <p className="text-black/40 text-sm">Loading...</p>}
          {!loading && filteredLeads.length === 0 && (
            <p className="text-black/40 text-sm">No leads in this view.</p>
          )}
          <div className="space-y-2">
            {filteredLeads.map(lead => {
              const status = STATUSES.find(s => s.value === lead.status)
              return (
                <button
                  key={lead.id}
                  onClick={() => router.push(`/${slug}/incoming/${lead.id}`)}
                  className="w-full text-left bg-white border border-black/10 p-4 hover:border-black/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold truncate">{lead.name}</p>
                        {lead._count.intakes > 0 && (
                          <span className="text-[10px] font-heading uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0.5">Intake</span>
                        )}
                      </div>
                      <p className="text-sm text-black/60 truncate">{lead.email}</p>
                      <p className="text-sm text-black/60">{lead.phone || 'No phone'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 mb-1 ${status?.color || 'bg-neutral-200 text-neutral-700'}`}>
                        {status?.label || lead.status}
                      </span>
                      <p className="text-[10px] text-black/40">{timeAgo(lead.createdAt)}</p>
                      <p className="text-[10px] text-black/40">{lead.source}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
