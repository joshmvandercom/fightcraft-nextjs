import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import LeadModal from '@/components/LeadModal'
import { getLocations, getPrograms } from '@/lib/content'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const locations = getLocations()
  const programs = getPrograms()

  return (
    <>
      <Nav locations={locations} programs={programs} />
      <main>{children}</main>
      <Footer locations={locations} />
      <LeadModal />
    </>
  )
}
