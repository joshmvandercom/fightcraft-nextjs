import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old program pages → SJ program pages (since old site was SJ-only)
      { source: '/kickboxing', destination: '/san-jose/programs/kickboxing', permanent: true },
      { source: '/muay-thai', destination: '/san-jose/programs/muay-thai', permanent: true },
      { source: '/brazilian-jiu-jitsu', destination: '/san-jose/programs/brazilian-jiu-jitsu', permanent: true },
      { source: '/kids-kickboxing', destination: '/san-jose/programs/kids-martial-arts', permanent: true },
      { source: '/programs', destination: '/san-jose', permanent: true },

      // Old pages → new equivalents
      { source: '/reviews', destination: '/about/reviews', permanent: true },
      { source: '/faq', destination: '/about/faq', permanent: true },
      { source: '/core-values', destination: '/about/core-values', permanent: true },
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/contact-us', destination: '/san-jose', permanent: true },
      { source: '/schedule', destination: '/san-jose/schedule', permanent: true },
      { source: '/first-timers', destination: '/san-jose', permanent: false },

      // Old conversion pages
      { source: '/get-info', destination: '/san-jose', permanent: true },
      { source: '/offer', destination: '/san-jose', permanent: true },
      { source: '/thank-you', destination: '/next-steps', permanent: true },
      { source: '/trial-class-confirmation', destination: '/next-steps', permanent: true },
    ]
  },
}

export default nextConfig
