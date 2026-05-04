import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { getCareer } from '@/lib/careers'

export const runtime = 'nodejs'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
] as const
const MAX_BYTES = 5 * 1024 * 1024

function sanitize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'resume'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'File upload is not configured. Use the resume URL field instead.' },
      { status: 503 }
    )
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayloadRaw) => {
        let clientPayload: { roleSlug?: string; originalFilename?: string } = {}
        try {
          clientPayload = clientPayloadRaw ? JSON.parse(clientPayloadRaw) : {}
        } catch {
          throw new Error('Invalid client payload.')
        }

        if (!clientPayload.roleSlug || !getCareer(clientPayload.roleSlug)) {
          throw new Error('Unknown role.')
        }

        const safeName = sanitize(clientPayload.originalFilename ?? pathname.split('/').pop() ?? 'resume')
        const finalPathname = `resumes/${clientPayload.roleSlug}/${Date.now()}-${safeName}`

        return {
          allowedContentTypes: [...ALLOWED_TYPES],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: false,
          pathname: finalPathname,
          tokenPayload: JSON.stringify({ roleSlug: clientPayload.roleSlug }),
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[careers/resume-upload] uploaded', { url: blob.url, pathname: blob.pathname })
      },
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[careers/resume-upload] error', err)
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
