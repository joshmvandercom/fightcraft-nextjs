'use client'

import { useEffect } from 'react'

export default function TabNotifier() {
  useEffect(() => {
    const originalTitle = document.title
    const originalFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')?.href
      || '/images/fc-white-initials.svg'
    let interval: NodeJS.Timeout | null = null
    let showingNotification = false

    function setFavicon(href: string) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        link.type = 'image/svg+xml'
        document.head.appendChild(link)
      }
      link.href = href
    }

    function onVisibilityChange() {
      if (document.hidden) {
        setFavicon('/favicon-notify.svg')
        showingNotification = true
        document.title = '(1) New Message'
        interval = setInterval(() => {
          showingNotification = !showingNotification
          document.title = showingNotification ? '(1) New Message' : originalTitle
        }, 1000)
      } else {
        if (interval) clearInterval(interval)
        interval = null
        showingNotification = false
        document.title = originalTitle
        setFavicon(originalFavicon)
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (interval) clearInterval(interval)
      document.title = originalTitle
      setFavicon(originalFavicon)
    }
  }, [])

  return null
}
