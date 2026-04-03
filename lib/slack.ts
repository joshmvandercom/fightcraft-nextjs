const SLACK_WEBHOOKS: Record<string, string | undefined> = {
  'san-jose': process.env.SLACK_WEBHOOK_SAN_JOSE,
  'merced': process.env.SLACK_WEBHOOK_MERCED,
  'brevard': process.env.SLACK_WEBHOOK_BREVARD,
}

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
