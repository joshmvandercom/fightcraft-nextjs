import type { Metadata } from 'next'
import LeadModal from '@/components/LeadModal'
import ValidateLocation from '@/components/ValidateLocation'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <ValidateLocation>
      {children}
      <LeadModal />
    </ValidateLocation>
  )
}
