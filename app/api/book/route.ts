import { NextRequest, NextResponse } from 'next/server'
import { notifySlack } from '@/lib/slack'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { location, day, date, time, className, name, email, phone } = body

  if (!location || !day || !time || !className) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Slack notification only — GHL webhook handled by /api/leads
  await notifySlack(`Class Booked: ${name || 'Unknown'} (${email || 'no email'}) | ${className} | ${day} at ${time} | Location: ${location}`, location)

  // Generate .ics content using the actual date from the client
  const classDate = date ? new Date(date) : new Date()

  // Parse time like "6:00am" or "5:15pm"
  const timeMatch = time.match(/(\d+):(\d+)(am|pm)/i)
  if (timeMatch) {
    let hours = parseInt(timeMatch[1])
    const minutes = parseInt(timeMatch[2])
    const period = timeMatch[3].toLowerCase()
    if (period === 'pm' && hours !== 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
    classDate.setHours(hours, minutes, 0, 0)
  }

  const endDate = new Date(classDate)
  endDate.setHours(endDate.getHours() + 1)

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const locationNames: Record<string, string> = {
    'san-jose': 'FightCraft San Jose - 1825 W. San Carlos St., San Jose, CA',
    'merced': 'FightCraft Merced - 2844 G St, Merced, CA',
    'brevard': 'FightCraft Brevard - 69 West French Broad, Brevard, NC',
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FightCraft//Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(classDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${className} - FightCraft`,
    `LOCATION:${locationNames[location] || 'FightCraft'}`,
    `DESCRIPTION:Your first class at FightCraft! Wear comfortable athletic clothes and bring water. We provide everything else.`,
    'STATUS:CONFIRMED',
    `UID:${Date.now()}@fightcraft.com`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="fightcraft-class.ics"`,
    },
  })
}
