'use client'

import * as amplitude from '@amplitude/analytics-browser'

let initialized = false

export function initAnalytics() {
  if (initialized) return
  const key = process.env.NEXT_PUBLIC_AMPLITUDE_KEY
  if (!key || key === 'your-amplitude-browser-api-key') return

  amplitude.init(key, {
    defaultTracking: {
      pageViews: true,
      sessions: true,
    },
  })
  initialized = true
}

export function identify(email: string, properties?: Record<string, string>) {
  initAnalytics()
  amplitude.setUserId(email)
  if (properties) {
    const identifyObj = new amplitude.Identify()
    for (const [k, v] of Object.entries(properties)) {
      identifyObj.set(k, v)
    }
    amplitude.identify(identifyObj)
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  initAnalytics()
  amplitude.track(event, properties)
}
