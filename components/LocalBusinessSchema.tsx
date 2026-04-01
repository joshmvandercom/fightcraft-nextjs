import type { Location } from '@/lib/content'

interface LocalBusinessSchemaProps {
  location: Location
  programs: string[]
  baseUrl?: string
}

export default function LocalBusinessSchema({ location: loc, programs, baseUrl = 'https://fightcraft.com' }: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: `FightCraft ${loc.name}`,
    description: `FightCraft ${loc.name} offers ${programs.join(', ')} in ${loc.city}, ${loc.state}. All levels welcome.`,
    url: `${baseUrl}/${loc.slug}`,
    telephone: loc.phone || undefined,
    email: loc.contact_email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.address,
      addressLocality: loc.city,
      addressRegion: loc.state,
      postalCode: loc.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: loc.lat,
      longitude: loc.lng,
    },
    image: `${baseUrl}/images/fc-logo-circle-social.png`,
    logo: `${baseUrl}/images/fc-logo-circle-social.png`,
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '06:00',
        closes: '21:00',
      },
    ],
    sameAs: loc.instagram
      ? [`https://instagram.com/${loc.instagram.replace('@', '')}`]
      : [],
    parentOrganization: {
      '@type': 'Organization',
      name: 'FightCraft',
      url: baseUrl,
      logo: `${baseUrl}/images/fc-logo-circle-social.png`,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Martial Arts Programs',
      itemListElement: programs.map(p => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: p,
          provider: {
            '@type': 'SportsActivityLocation',
            name: `FightCraft ${loc.name}`,
          },
        },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
