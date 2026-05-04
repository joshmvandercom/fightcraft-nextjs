import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCareer } from '@/lib/careers'
import { sendNotificationEmail, sendApplicantConfirmation } from '@/lib/career-emails'
import { notifyCareerApplication } from '@/lib/slack'

export const runtime = 'nodejs'

const optionalUrl = z.string().url().max(500).optional().or(z.literal(''))
const optionalLongUrl = z.string().url().max(1000).optional().or(z.literal(''))

const applicationSchema = z.object({
  roleSlug: z.string().min(1).max(100),
  fullName: z.string().min(2).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional().or(z.literal('')),
  linkedinUrl: optionalUrl,
  whyThisRole: z.string().min(100).max(2000),
  keyExperience: z.string().min(100).max(2000),
  twoYearVision: z.string().min(50).max(1500),
  resumeUrl: optionalLongUrl,
})

const RATE_LIMIT = 3
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const submissions = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (submissions.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)

  if (recent.length >= RATE_LIMIT) {
    submissions.set(ip, recent)
    return true
  }

  recent.push(now)
  submissions.set(ip, recent)

  if (submissions.size > 10_000) {
    for (const [key, times] of submissions) {
      if (times.every(t => now - t > RATE_WINDOW_MS)) submissions.delete(key)
    }
  }

  return false
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = applicationSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return NextResponse.json({ error: 'Validation failed.', fieldErrors }, { status: 400 })
  }

  const data = parsed.data

  const role = getCareer(data.roleSlug)
  if (!role) {
    return NextResponse.json({ error: 'Role not found.' }, { status: 404 })
  }

  const userAgent = request.headers.get('user-agent') ?? null
  const referer = request.headers.get('referer') ?? null

  let application
  try {
    application = await prisma.careerApplication.create({
      data: {
        roleSlug: data.roleSlug,
        roleTitle: role.title,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        linkedinUrl: data.linkedinUrl?.trim() || null,
        whyThisRole: data.whyThisRole.trim(),
        keyExperience: data.keyExperience.trim(),
        twoYearVision: data.twoYearVision.trim(),
        resumeUrl: data.resumeUrl?.trim() || null,
        ipAddress: ip,
        userAgent,
        source: referer,
      },
    })
  } catch (err) {
    console.error('[careers/apply] DB write failed', err)
    return NextResponse.json({ error: 'Could not save application. Please try again.' }, { status: 500 })
  }

  // Fire-and-forget downstream notifications. We log internally; client doesn't see failures here.
  await Promise.allSettled([
    sendNotificationEmail({
      applicationId: application.id,
      roleSlug: application.roleSlug,
      roleTitle: application.roleTitle,
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      linkedinUrl: application.linkedinUrl,
      resumeUrl: application.resumeUrl,
      whyThisRole: application.whyThisRole,
      keyExperience: application.keyExperience,
      twoYearVision: application.twoYearVision,
      createdAt: application.createdAt,
    }),
    sendApplicantConfirmation({
      applicantEmail: application.email,
      fullName: application.fullName,
      roleTitle: application.roleTitle,
    }),
    notifyCareerApplication({
      applicationId: application.id,
      roleTitle: application.roleTitle,
      roleSlug: application.roleSlug,
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      linkedinUrl: application.linkedinUrl,
      resumeUrl: application.resumeUrl,
      whyThisRole: application.whyThisRole,
      keyExperience: application.keyExperience,
      twoYearVision: application.twoYearVision,
      createdAt: application.createdAt,
    }),
  ])

  return NextResponse.json({ success: true, applicationId: application.id })
}
