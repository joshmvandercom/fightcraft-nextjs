import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import Locations from '@/components/Locations'
import LeadCapture from '@/components/LeadCapture'
import { getLocations } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Locations | FightCraft',
  description: 'Find a FightCraft gym near you. Locations in San Jose CA, Merced CA, and Brevard NC.',
}

export default function LocationsPage() {
  const locations = getLocations()

  return (
    <>
      <PageHero title="Our Locations" subtitle="Find Your Gym" />
      <Locations locations={locations} linked />
      <LeadCapture />
    </>
  )
}
