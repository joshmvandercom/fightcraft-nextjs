import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Privacy Policy | FightCraft',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" />
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <p className="text-black/60 leading-relaxed mb-6">Last updated: April 1, 2026</p>
          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">Information We Collect</h2>
          <p className="text-black/60 leading-relaxed mb-6">When you fill out a form on our website, we collect your name, email address, phone number, and preferred location. This information is used solely to respond to your inquiry and provide information about our programs.</p>
          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">How We Use Your Information</h2>
          <p className="text-black/60 leading-relaxed mb-6">We use the information you provide to contact you about FightCraft programs and services. We do not sell, trade, or rent your personal information to third parties.</p>
          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">Cookies</h2>
          <p className="text-black/60 leading-relaxed mb-6">We use localStorage to remember your preferred gym location. We do not use tracking cookies for advertising purposes.</p>
          <h2 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">Contact</h2>
          <p className="text-black/60 leading-relaxed">If you have questions about this privacy policy, contact us at <a href="mailto:friends@fightcraft.com" className="text-black hover:text-black/70">friends@fightcraft.com</a>.</p>
        </div>
      </section>
    </>
  )
}
