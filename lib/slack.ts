const SLACK_WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.SLACK_WEBHOOK_SAN_JOSE,
  'merced': process.env.SLACK_WEBHOOK_MERCED,
  'brevard': process.env.SLACK_WEBHOOK_BREVARD,
}

const CAREERS_WEBHOOK = process.env.SLACK_WEBHOOK_CAREERS

export async function notifySlack(message: string, location?: string) {
  const url = location ? SLACK_WEBHOOKS[location] : Object.values(SLACK_WEBHOOKS).find(u => u && !u.includes('PLACEHOLDER'))

  if (!url || url.includes('PLACEHOLDER')) {
    console.log(`[SLACK DRY RUN${location ? ` - ${location}` : ''}]`, message)
    return
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    })
  } catch (err) {
    console.error('Slack notification failed:', err)
  }
}

export interface CareerApplicationPayload {
  applicationId: string
  roleTitle: string
  roleSlug: string
  fullName: string
  email: string
  phone?: string | null
  linkedinUrl?: string | null
  resumeUrl?: string | null
  whyThisRole: string
  keyExperience: string
  twoYearVision: string
  createdAt: Date
}

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

export async function notifyCareerApplication(app: CareerApplicationPayload) {
  const summary = `New application: ${app.roleTitle} — ${app.fullName} <${app.email}>`

  const fields: { type: 'mrkdwn'; text: string }[] = [
    { type: 'mrkdwn', text: `*Name*\n${app.fullName}` },
    { type: 'mrkdwn', text: `*Email*\n<mailto:${app.email}|${app.email}>` },
  ]
  if (app.phone) fields.push({ type: 'mrkdwn', text: `*Phone*\n${app.phone}` })
  if (app.linkedinUrl) fields.push({ type: 'mrkdwn', text: `*LinkedIn*\n<${app.linkedinUrl}|profile>` })

  const blocks: unknown[] = [
    { type: 'header', text: { type: 'plain_text', text: `New application — ${app.roleTitle}` } },
    { type: 'section', fields },
  ]

  if (app.resumeUrl) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Resume*\n<${app.resumeUrl}|Download resume>` },
    })
  }

  blocks.push({ type: 'divider' })
  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: `*Why this role*\n${truncate(app.whyThisRole, 1500)}` },
  })
  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: `*A hard moment, handled*\n${truncate(app.keyExperience, 1500)}` },
  })
  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: `*Two-year vision*\n${truncate(app.twoYearVision, 1500)}` },
  })
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Application \`${app.applicationId}\` · role \`${app.roleSlug}\` · ${app.createdAt.toISOString()}`,
      },
    ],
  })

  const payload = { text: summary, blocks }

  if (!CAREERS_WEBHOOK || CAREERS_WEBHOOK.includes('PLACEHOLDER')) {
    console.log('[SLACK CAREERS DRY RUN]', summary)
    return
  }

  try {
    const res = await fetch(CAREERS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('Career Slack webhook returned non-ok:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('Career Slack webhook failed:', err)
  }
}
