import type { Metadata } from 'next'
import LeadModal from '@/components/LeadModal'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LeadModal />
    </>
  )
}
