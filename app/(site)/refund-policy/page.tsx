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
          <p className="text-black/60 leading-relaxed mb-6">Last updated: April 9, 2026</p>

          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">Cancellation Policy</h2>
          <p className="text-black/60 leading-relaxed mb-6">Most FightCraft memberships require a 30-day written notice to cancel. If you selected a contract term, cancellation is subject to the terms of that agreement. To submit a cancellation request, contact your location directly.</p>

          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">Refund Policy</h2>
          <p className="text-black/60 leading-relaxed mb-6">FightCraft does not issue refunds for membership tuition, whether prepaid or due to non-attendance. All membership fees are non-refundable once processed.</p>

          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">Contact</h2>
          <p className="text-black/60 leading-relaxed">For questions about billing, cancellations, or your membership, contact your local FightCraft gym or email <a href="mailto:friends@fightcraft.com" className="text-black hover:text-black/70">friends@fightcraft.com</a>.</p>
        </div>
      </section>
    </>
  )
}
