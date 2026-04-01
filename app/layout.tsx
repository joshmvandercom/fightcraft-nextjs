import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import LeadModal from '@/components/LeadModal'
import { getLocations, getPrograms } from '@/lib/content'

export const metadata: Metadata = {
  title: 'FightCraft | Premier Martial Arts',
  description: 'FightCraft is a premier martial arts community with locations in San Jose, Merced, and Brevard. Kickboxing, Muay Thai, BJJ, and more.',
  icons: { icon: '/images/fc-white-initials.svg' },
  metadataBase: new URL('https://fightcraft.com'),
  openGraph: {
    title: 'FightCraft | Premier Martial Arts',
    description: 'Kickboxing, Muay Thai, BJJ, MMA, and more. All levels welcome.',
    url: 'https://fightcraft.com',
    siteName: 'FightCraft',
    images: [{ url: 'https://fightcraft.com/images/og-default.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FightCraft | Premier Martial Arts',
    description: 'Kickboxing, Muay Thai, BJJ, MMA, and more. All levels welcome.',
    images: ['https://fightcraft.com/images/og-default.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locations = getLocations()
  const programs = getPrograms()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="preload" href="/fonts/timmons.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="bg-black text-white">
        <Nav locations={locations} programs={programs} />
        <main>{children}</main>
        <Footer locations={locations} />
        <LeadModal />
      </body>
    </html>
  )
}
