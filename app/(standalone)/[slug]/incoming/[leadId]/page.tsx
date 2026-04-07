'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Intake {
  id: string
  coach: string | null
  dob: string | null
  emergencyName: string | null
  emergencyPhone: string | null
  goals: string | null
  experience: string | null
  injuries: string | null
  howHeard: string | null
  programInterest: string | null
  availableClasses: string | null
  waiverAccepted: boolean
  createdAt: string
}

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
  intakes: Intake[]
}

const COACHES = ['Josh', 'Quinn', 'Veronica', 'David', 'Marissa', 'Troy', 'Matt', 'Jacob', 'Jimmy']

const STATUSES = [
  { value: 'lead', label: 'Lead', color: 'bg-neutral-200 text-neutral-700' },
  { value: 'booked', label: 'Booked', color: 'bg-blue-100 text-blue-800' },
  { value: 'attended', label: 'Attended', color: 'bg-green-100 text-green-800' },
  { value: 'no_show', label: 'No Show', color: 'bg-amber-100 text-amber-800' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'won', label: 'Won', color: 'bg-emerald-600 text-white' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
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

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const leadId = params.leadId as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCoach, setSelectedCoach] = useState<string>('')

  const fetchLead = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/incoming/intake?leadId=${leadId}`)
    if (res.status === 401) {
      router.push(`/${slug}/incoming`)
      return
    }
    const data = await res.json()
    setLead(data.lead || null)
    setLoading(false)
  }, [leadId, slug, router])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  async function updateStatus(status: string, statusReason?: string) {
    const res = await fetch('/api/incoming/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, status, statusReason }),
    })
    if (res.ok && lead) {
      setLead({ ...lead, status, statusReason: statusReason || null })
    }
  }

  async function updateNotes(notes: string) {
    const res = await fetch('/api/incoming/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, notes }),
    })
    if (res.ok && lead) {
      setLead({ ...lead, notes })
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><p className="text-black/40">Loading...</p></div>
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-black/60 mb-4">Lead not found.</p>
          <button onClick={() => router.push(`/${slug}/incoming`)} className="px-4 py-2 bg-black text-white text-sm font-bold">Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      {/* Header */}
      <header className="bg-black text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push(`/${slug}/incoming`)} className="flex items-center gap-2 text-white/70 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            <span className="font-heading text-sm uppercase tracking-widest">Back</span>
          </button>
          <p className="font-heading text-xs uppercase tracking-widest text-white/40">FightCraft · {slug}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Name + meta */}
        <div className="mb-10">
          <h1 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-2">{lead.name}</h1>
          <p className="text-sm text-black/60">{timeAgo(lead.createdAt)} · {lead.source}</p>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <a href={`mailto:${lead.email}`} className="border border-black/10 bg-white p-4 hover:border-black/40">
            <p className="font-heading text-[10px] uppercase tracking-widest text-black/40 mb-1">Email</p>
            <p className="text-sm break-all">{lead.email}</p>
          </a>
          <a href={`tel:${lead.phone}`} className="border border-black/10 bg-white p-4 hover:border-black/40">
            <p className="font-heading text-[10px] uppercase tracking-widest text-black/40 mb-1">Phone</p>
            <p className="text-sm">{lead.phone || 'No phone'}</p>
          </a>
          {lead.phone && (
            <a href={`sms:${lead.phone}`} className="border border-black/10 bg-white p-4 hover:border-black/40">
              <p className="font-heading text-[10px] uppercase tracking-widest text-black/40 mb-1">SMS</p>
              <p className="text-sm">Send a text</p>
            </a>
          )}
        </div>

        {/* Status */}
        <div className="mb-10">
          <h2 className="font-heading text-xs uppercase tracking-widest font-bold text-black/40 mb-3">Status</h2>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => {
                  if (s.value === 'lost') {
                    const reason = prompt('Why lost?')
                    if (reason !== null) updateStatus(s.value, reason)
                  } else {
                    updateStatus(s.value)
                  }
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${lead.status === s.value ? `${s.color} ring-2 ring-black ring-offset-2 ring-offset-neutral-50` : `${s.color} opacity-60 hover:opacity-100`}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {lead.status === 'lost' && lead.statusReason && (
            <p className="text-sm text-black/60 mt-3">Reason: {lead.statusReason}</p>
          )}
        </div>

        {/* Notes */}
        <div className="mb-10">
          <h2 className="font-heading text-xs uppercase tracking-widest font-bold text-black/40 mb-3">Notes</h2>
          <textarea
            defaultValue={lead.notes || ''}
            onBlur={e => updateNotes(e.target.value)}
            placeholder="Add notes about this lead..."
            className="w-full p-4 border border-black/10 bg-white text-sm focus:border-black focus:outline-none resize-none"
            rows={5}
          />
        </div>

        {/* Intakes */}
        {lead.intakes.length > 0 && (
          <div className="mb-10">
            <h2 className="font-heading text-xs uppercase tracking-widest font-bold text-black/40 mb-3">
              Intake{lead.intakes.length > 1 ? 's' : ''} ({lead.intakes.length})
            </h2>
            <div className="space-y-3">
              {lead.intakes.map(intake => (
                <details key={intake.id} className="border border-black/10 bg-white" open>
                  <summary className="px-5 py-4 cursor-pointer flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold">{new Date(intake.createdAt).toLocaleString()}</span>
                      {intake.coach && <span className="text-xs text-black/50 ml-3">with Coach {intake.coach}</span>}
                    </div>
                    <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {intake.dob && (
                      <div>
                        <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Date of Birth</p>
                        <p>{intake.dob}</p>
                      </div>
                    )}
                    {(intake.emergencyName || intake.emergencyPhone) && (
                      <div>
                        <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Emergency Contact</p>
                        <p>{intake.emergencyName}</p>
                        {intake.emergencyPhone && <p><a href={`tel:${intake.emergencyPhone}`} className="hover:underline">{intake.emergencyPhone}</a></p>}
                      </div>
                    )}
                    {intake.experience && (
                      <div>
                        <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Experience</p>
                        <p>{intake.experience}</p>
                      </div>
                    )}
                    {intake.howHeard && (
                      <div>
                        <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">How Heard</p>
                        <p>{intake.howHeard}</p>
                      </div>
                    )}
                    {intake.goals && (
                      <div className="md:col-span-2">
                        <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Goals</p>
                        <p>{intake.goals}</p>
                      </div>
                    )}
                    {intake.programInterest && (
                      <div className="md:col-span-2">
                        <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Program Interest</p>
                        <p>{intake.programInterest}</p>
                      </div>
                    )}
                    {intake.availableClasses && (
                      <div className="md:col-span-2">
                        <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Available Classes</p>
                        <ul className="space-y-1">
                          {intake.availableClasses.split(', ').map((cls, i) => (
                            <li key={i}>{cls}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {intake.injuries && (
                      <div className="md:col-span-2">
                        <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Injuries / Conditions</p>
                        <p>{intake.injuries}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-heading text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Waiver</p>
                      <p>{intake.waiverAccepted ? 'Accepted' : 'Not accepted'}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Coach selector */}
        <div className="mb-4">
          <h2 className="font-heading text-xs uppercase tracking-widest font-bold text-black/40 mb-3">Who&apos;s handling this intake?</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {COACHES.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCoach(c)}
                className={`px-3 py-3 text-sm font-bold border-2 transition-all ${selectedCoach === c ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20 hover:border-black/50'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Action: start intake */}
        <button
          onClick={() => router.push(`/${slug}/incoming/intake/${leadId}?coach=${encodeURIComponent(selectedCoach)}`)}
          disabled={!selectedCoach}
          className="w-full py-4 bg-black text-white font-heading text-sm uppercase tracking-widest font-bold hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {lead.intakes.length > 0 ? 'Start New Intake' : 'Start Intake'}
        </button>
      </div>
    </div>
  )
}
