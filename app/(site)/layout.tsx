import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import LeadModal from '@/components/LeadModal'
import PromoBanner from '@/components/PromoBanner'
import { getLocations, getPrograms } from '@/lib/content'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const locations = getLocations()
  const programs = getPrograms()

  return (
    <>
      <Nav locations={locations} programs={programs} />
      <main className="overflow-x-hidden">{children}</main>
      <Footer locations={locations} />
      <LeadModal />
      <PromoBanner />
    </>
  )
}
