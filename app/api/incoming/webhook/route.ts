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

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  const expected = process.env.INCOMING_WEBHOOK_SECRET

  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = (body.contact_email as string)?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Missing contact_email' }, { status: 400 })
  }

  // Look up lead by email (case-insensitive)
  const lead = await prisma.lead.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found', email }, { status: 404 })
  }

  // Parse appointment time
  let appointmentAt: Date | null = null
  const startTime = body.appointment_start_time as string
  if (startTime) {
    const parsed = new Date(startTime)
    if (!isNaN(parsed.getTime())) appointmentAt = parsed
  }

  // Build a notes line capturing the appointment context
  const title = body.appointment_title as string
  const location = body.appointment_meeting_location as string
  const apptNotes = body.appointment_notes as string

  const noteParts: string[] = []
  if (title) noteParts.push(title)
  if (appointmentAt) noteParts.push(appointmentAt.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))
  if (location) noteParts.push(location)
  const summary = noteParts.join(' · ')
  const newNote = `[${new Date().toISOString()}] Booked: ${summary}${apptNotes ? `\n${apptNotes}` : ''}`

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      status: 'booked',
      appointmentAt,
      notes: lead.notes ? `${lead.notes}\n${newNote}` : newNote,
    },
  })

  return NextResponse.json({
    success: true,
    leadId: lead.id,
    name: lead.name,
    appointmentAt: appointmentAt?.toISOString() || null,
  })
}
