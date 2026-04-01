import type { MetadataRoute } from 'next'
import { getLocations, getPrograms } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fightcraft.com'
  const locations = getLocations()
  const programs = getPrograms()

  const staticPages = [
    { url: baseUrl, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/locations`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/about/faq`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/about/reviews`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/about/core-values`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${baseUrl}/refund-policy`, changeFrequency: 'yearly' as const, priority: 0.2 },
  ]

  const locationPages = locations.map(loc => ({
    url: `${baseUrl}/${loc.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const schedulePages = locations.map(loc => ({
    url: `${baseUrl}/${loc.slug}/schedule`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const programPages = programs.map(p => ({
    url: `${baseUrl}/${p.location}/programs/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...locationPages, ...schedulePages, ...programPages]
}
