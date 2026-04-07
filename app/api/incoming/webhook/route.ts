import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Inbound webhook from GHL when an appointment is booked.
//
// Auth: Bearer token in the Authorization header.
//   Set INCOMING_WEBHOOK_SECRET in env. GHL sends:
//   Authorization: Bearer {{custom_values.api_token}}
//
// Expected payload (from GHL):
// {
//   "contact_id": "...",
//   "contact_name": "Ali Sherzai",
//   "contact_email": "ali@example.com",
//   "contact_phone": "+14087507916",
//   "appointment_id": "...",
//   "appointment_title": "Free Consultation",
//   "appointment_start_time": "2026-04-10T18:00:00-07:00",
//   "appointment_end_time":   "2026-04-10T19:00:00-07:00",
//   "appointment_meeting_location": "FightCraft San Jose",
//   "appointment_notes": "..."
// }

async function logWebhook(payload: string, status: number, error?: string) {
  try {
    await prisma.webhookLog.create({
      data: { endpoint: 'incoming/webhook', status, error: error || null, payload },
    })
  } catch (err) {
    console.error('Failed to log webhook:', err)
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const auth = request.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  const expected = process.env.INCOMING_WEBHOOK_SECRET

  if (!expected || token !== expected) {
    await logWebhook(rawBody, 401, 'Unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    await logWebhook(rawBody, 400, 'Invalid JSON')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('[WEBHOOK PAYLOAD]', JSON.stringify(body, null, 2))

  // GHL nests mapped fields under customData. Merge with top-level for fallback.
  const customData = (body.customData as Record<string, unknown>) || {}
  const data = { ...body, ...customData }

  function pickString(...candidates: unknown[]): string | undefined {
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim()
    }
    return undefined
  }

  // Try multiple field names for email
  const rawEmail = pickString(
    data.contact_email,
    data.email,
    data.contactEmail,
    (data.contact as Record<string, unknown>)?.email,
  )
  const email = rawEmail?.toLowerCase()
  if (!email) {
    await logWebhook(rawBody, 400, `Missing email field. Received keys: ${Object.keys(data).join(', ')}`)
    return NextResponse.json({ error: 'Missing email field', received_keys: Object.keys(data) }, { status: 400 })
  }

  // Resolve IANA timezone for this location
  const calendar = (data.calendar as Record<string, unknown>) || {}
  const ghlState = pickString((data.location as Record<string, unknown>)?.state) || ''
  const ghlCity = pickString((data.location as Record<string, unknown>)?.city) || ''
  const isEastern = ghlState.toLowerCase() === 'nc' ||
                    ghlCity.toLowerCase().includes('brevard')
  const ianaTz = isEastern ? 'America/New_York' : 'America/Los_Angeles'

  // Compute the UTC offset (in minutes) for a given IANA timezone at a given local datetime
  function offsetForZone(localISO: string, zone: string): string {
    // Treat localISO as if it were UTC, then ask what time it would be in `zone`.
    // The diff tells us the zone offset.
    const asUtc = new Date(`${localISO}Z`)
    const tzString = asUtc.toLocaleString('en-US', { timeZone: zone, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    // tzString format: "MM/DD/YYYY, HH:MM:SS"
    const m = tzString.match(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/)
    if (!m) return '+00:00'
    const tzAsUtc = Date.UTC(+m[3], +m[1] - 1, +m[2], +m[4], +m[5], +m[6])
    const diffMin = (tzAsUtc - asUtc.getTime()) / 60000
    const sign = diffMin >= 0 ? '+' : '-'
    const abs = Math.abs(diffMin)
    const hh = String(Math.floor(abs / 60)).padStart(2, '0')
    const mm = String(abs % 60).padStart(2, '0')
    return `${sign}${hh}:${mm}`
  }

  // Parse appointment time — prefer ISO from calendar.startTime, fall back to customData
  let appointmentAt: Date | null = null
  const startTime = pickString(
    calendar.startTime,
    data.appointment_start_time,
    data.startTime,
    data.start_time,
    data.appointmentStartTime,
  )
  if (startTime) {
    let normalized = startTime
    const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(startTime)
    if (!hasTz) {
      // GHL sent a naive datetime. Interpret as local to the gym's IANA zone.
      const localISO = startTime.includes('T') ? startTime : startTime.replace(' ', 'T')
      const offset = offsetForZone(localISO, ianaTz)
      normalized = `${localISO}${offset}`
    }
    const parsed = new Date(normalized)
    if (!isNaN(parsed.getTime())) appointmentAt = parsed
  }

  // Build a notes line capturing the appointment context
  const title = pickString(
    calendar.calendarName,
    calendar.title,
    data.appointment_title,
    data.title,
    data.appointmentTitle,
  )
  const meetingLocation = pickString(
    data.appointment_meeting_location,
    data.meeting_location,
    data.appointmentMeetingLocation,
    (data.location as Record<string, unknown>)?.name,
  )
  const apptNotes = pickString(
    data.appointment_notes,
    data.appointmentNotes,
  )

  const noteParts: string[] = []
  if (title) noteParts.push(title)
  if (appointmentAt) noteParts.push(appointmentAt.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))
  if (meetingLocation) noteParts.push(meetingLocation)
  const summary = noteParts.join(' · ')
  const newNote = `[${new Date().toISOString()}] Booked: ${summary}${apptNotes ? `\n${apptNotes}` : ''}`

  // Infer location slug from any string we can find
  function inferLocation(...candidates: (string | undefined)[]): string {
    for (const c of candidates) {
      if (!c) continue
      const m = c.toLowerCase()
      if (m.includes('merced')) return 'merced'
      if (m.includes('brevard')) return 'brevard'
      if (m.includes('san jose') || m.includes('san-jose') || m.includes('sj')) return 'san-jose'
    }
    return 'san-jose'
  }

  const ghlLocation = (data.location as Record<string, unknown>) || {}
  const contactName = pickString(
    data.contact_name,
    data.full_name,
    data.contactName,
    (data.contact as Record<string, unknown>)?.name,
    [pickString(data.first_name), pickString(data.last_name)].filter(Boolean).join(' ') || undefined,
  ) || 'Unknown'
  const contactPhone = pickString(
    data.contact_phone,
    data.phone,
    data.contactPhone,
    (data.contact as Record<string, unknown>)?.phone,
  ) || ''
  const inferredLocation = inferLocation(
    meetingLocation,
    pickString(ghlLocation.name),
    pickString(ghlLocation.city),
    pickString(calendar.calendarName),
  )

  // Look up existing lead
  const existing = await prisma.lead.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })

  let lead
  let created = false

  if (existing) {
    lead = await prisma.lead.update({
      where: { id: existing.id },
      data: {
        status: 'booked',
        appointmentAt,
        notes: existing.notes ? `${existing.notes}\n${newNote}` : newNote,
      },
    })
  } else {
    lead = await prisma.lead.create({
      data: {
        name: contactName,
        email,
        phone: contactPhone,
        location: inferredLocation,
        source: 'ghl_webhook',
        status: 'booked',
        appointmentAt,
        notes: newNote,
      },
    })
    created = true
  }

  await logWebhook(rawBody, 200)

  return NextResponse.json({
    success: true,
    leadId: lead.id,
    name: lead.name,
    created,
    appointmentAt: appointmentAt?.toISOString() || null,
  })
}
