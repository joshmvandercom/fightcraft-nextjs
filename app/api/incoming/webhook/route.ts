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

  // Parse appointment time — prefer ISO from calendar.startTime, fall back to customData
  let appointmentAt: Date | null = null
  const calendar = (data.calendar as Record<string, unknown>) || {}
  const startTime = pickString(
    calendar.startTime,
    data.appointment_start_time,
    data.startTime,
    data.start_time,
    data.appointmentStartTime,
  )
  if (startTime) {
    const parsed = new Date(startTime)
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
