'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

function getFbq(): ((...args: string[]) => void) | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return typeof w.fbq === 'function' ? w.fbq : null
}

export function metaPixelTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const fbq = getFbq()
  if (!fbq) return
  if (params) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(fbq as any)('track', event, params)
  } else {
    fbq('track', event)
  }
}

export default function MetaPixel() {
  const pathname = usePathname()
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  useEffect(() => {
    if (!pixelId || pixelId === 'your-meta-pixel-id') return
    if (process.env.NEXT_PUBLIC_SUPPRESS_ANALYTICS === 'true') return
    const fbq = getFbq()
    if (fbq) fbq('track', 'PageView')
  }, [pathname, pixelId])

  if (!pixelId || pixelId === 'your-meta-pixel-id') return null
  if (process.env.NEXT_PUBLIC_SUPPRESS_ANALYTICS === 'true') return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
