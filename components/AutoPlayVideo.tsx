'use client'

import { useEffect, useRef } from 'react'

interface AutoPlayVideoProps {
  src: string
  className?: string
}

export default function AutoPlayVideo({ src, className = '' }: AutoPlayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    video.muted = true
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('playsinline', '')

    const play = () => {
      const promise = video.play()
      if (promise !== undefined) {
        promise.catch(() => {})
      }
    }

    // Use IntersectionObserver to play/pause based on visibility
    // Desktop Safari sometimes blocks autoplay until element is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(video)

    // Also try on loadeddata
    video.addEventListener('loadeddata', play, { once: true })

    // Also try on canplay
    video.addEventListener('canplay', play, { once: true })

    // Fallback: retry every second for 5 seconds
    let attempts = 0
    const interval = setInterval(() => {
      if (attempts >= 5 || !video.paused) {
        clearInterval(interval)
        return
      }
      play()
      attempts++
    }, 1000)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
