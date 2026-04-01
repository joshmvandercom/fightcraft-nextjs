import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Refund Policy | FightCraft',
}

export default function RefundPolicyPage() {
  return (
    <>
      <PageHero title="Refund Policy" />
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-black/60 leading-relaxed mb-6">Last updated: April 1, 2026</p>
          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">Memberships</h2>
          <p className="text-black/60 leading-relaxed mb-6">FightCraft memberships are month-to-month with a 30-day cancellation notice. There are no long-term contracts. To cancel, contact your location directly.</p>
          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">Contact</h2>
          <p className="text-black/60 leading-relaxed">For questions about billing or refunds, contact your local FightCraft gym or email <a href="mailto:friends@fightcraft.com" className="text-black hover:text-black/70">friends@fightcraft.com</a>.</p>
        </div>
      </section>
    </>
  )
}
