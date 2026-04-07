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

  // Try multiple field names for email — GHL can send any of these
  const rawEmail = (body.contact_email || body.email || body.contactEmail || (body.contact as Record<string, unknown>)?.email) as string | undefined
  const email = rawEmail?.trim().toLowerCase()
  if (!email) {
    await logWebhook(rawBody, 400, `Missing email field. Received keys: ${Object.keys(body).join(', ')}`)
    return NextResponse.json({ error: 'Missing email field', received_keys: Object.keys(body) }, { status: 400 })
  }

  // Parse appointment time (try multiple field name variants)
  let appointmentAt: Date | null = null
  const startTime = (body.appointment_start_time || body.startTime || body.start_time || body.appointmentStartTime) as string | undefined
  if (startTime) {
    const parsed = new Date(startTime)
    if (!isNaN(parsed.getTime())) appointmentAt = parsed
  }

  // Build a notes line capturing the appointment context
  const title = (body.appointment_title || body.title || body.appointmentTitle) as string | undefined
  const meetingLocation = (body.appointment_meeting_location || body.meeting_location || body.appointmentMeetingLocation || body.location) as string | undefined
  const apptNotes = (body.appointment_notes || body.appointmentNotes || body.notes) as string | undefined

  const noteParts: string[] = []
  if (title) noteParts.push(title)
  if (appointmentAt) noteParts.push(appointmentAt.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))
  if (meetingLocation) noteParts.push(meetingLocation)
  const summary = noteParts.join(' · ')
  const newNote = `[${new Date().toISOString()}] Booked: ${summary}${apptNotes ? `\n${apptNotes}` : ''}`

  // Infer location slug from meeting_location if possible
  function inferLocation(meeting: string | undefined): string {
    if (!meeting) return 'san-jose'
    const m = meeting.toLowerCase()
    if (m.includes('merced')) return 'merced'
    if (m.includes('brevard')) return 'brevard'
    return 'san-jose'
  }

  const contactName = ((body.contact_name || body.name || body.contactName || (body.contact as Record<string, unknown>)?.name) as string) || 'Unknown'
  const contactPhone = ((body.contact_phone || body.phone || body.contactPhone || (body.contact as Record<string, unknown>)?.phone) as string) || ''
  const inferredLocation = inferLocation(meetingLocation)

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
