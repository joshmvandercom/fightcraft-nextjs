'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ScrollRevealImageProps {
  src: string
  alt: string
  className?: string
}

export default function ScrollRevealImage({ src, alt, className = '' }: ScrollRevealImageProps) {
  const ref = useRef<HTMLImageElement>(null)
  const [grayscaleAmount, setGrayscaleAmount] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  const updateGrayscale = useCallback(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const viewportH = window.innerHeight
    // Center of the image relative to viewport
    const center = rect.top + rect.height / 2
    // 0 = top of viewport, 1 = bottom of viewport
    const position = center / viewportH

    // Below 50% (bottom half): fully grayscale (1)
    // At 50%: starts transitioning
    // At top (0%): fully color (0)
    if (position >= 0.5) {
      setGrayscaleAmount(1)
    } else if (position <= 0) {
      setGrayscaleAmount(0)
    } else {
      // Linear from 1 at 50% to 0 at 0%
      setGrayscaleAmount(position / 0.5)
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    let raf: number
    const onScroll = () => {
      raf = requestAnimationFrame(updateGrayscale)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateGrayscale()

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [updateGrayscale])

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`${className} ${!isMobile ? 'grayscale group-hover:grayscale-0 transition-all duration-700' : ''}`}
      style={isMobile ? { filter: `grayscale(${grayscaleAmount})`, transition: 'filter 0.3s ease-out' } : undefined}
    />
  )
}
