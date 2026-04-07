'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Log {
  id: string
  endpoint: string
  status: number
  error: string | null
  payload: string
  createdAt: string
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-800'
  if (status >= 400 && status < 500) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}

function prettyJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2)
  } catch {
    return s
  }
}

export default function WebhookLogsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchLogs() {
    setLoading(true)
    const res = await fetch('/api/incoming/webhook-logs')
    if (res.status === 401) {
      router.push(`/${slug}/incoming`)
      return
    }
    const data = await res.json()
    setLogs(data.logs || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      <header className="bg-black text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push(`/${slug}/incoming`)} className="flex items-center gap-2 text-white/70 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            <span className="font-heading text-sm uppercase tracking-widest">Back</span>
          </button>
          <h1 className="font-heading text-lg uppercase tracking-widest">Webhook Logs</h1>
          <button onClick={fetchLogs} className="text-xs text-white/60 hover:text-white font-heading uppercase tracking-widest">Refresh</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-sm text-black/60 mb-6">Last 50 webhook hits. Auto-refreshes every 5 seconds.</p>

        {loading && logs.length === 0 && <p className="text-black/40 text-sm">Loading...</p>}
        {!loading && logs.length === 0 && <p className="text-black/40 text-sm">No webhooks received yet.</p>}

        <div className="space-y-3">
          {logs.map(log => (
            <details key={log.id} className="border border-black/10 bg-white">
              <summary className="px-5 py-4 cursor-pointer flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${statusColor(log.status)}`}>
                    {log.status}
                  </span>
                  <span className="text-sm font-bold truncate">{log.endpoint}</span>
                  {log.error && <span className="text-xs text-red-600 truncate">{log.error}</span>}
                </div>
                <span className="text-xs text-black/40 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
              </summary>
              <div className="px-5 pb-5">
                <pre className="text-xs bg-neutral-100 p-4 overflow-auto whitespace-pre-wrap break-all">{prettyJson(log.payload)}</pre>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
