import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCareer, getCareerSlugs } from '@/lib/careers'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Application Received | FightCraft Careers',
  robots: { index: false, follow: false },
}

export function generateStaticParams() {
  return getCareerSlugs().map(slug => ({ slug }))
}

export default async function ApplicationSuccessPage({ params }: PageProps) {
  const { slug } = await params
  const role = getCareer(slug)
  if (!role) notFound()

  return (
    <section className="bg-black text-white min-h-[80vh] flex items-center px-6 py-32">
      <div className="max-w-3xl mx-auto w-full">
        <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-4">
          _APPLICATION_RECEIVED
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl uppercase font-bold tracking-tight">
          Your application is in
        </h1>
        <div className="w-16 h-px bg-white mt-6 mb-10" />

        <div className="space-y-6 text-white/70 text-base md:text-lg leading-relaxed max-w-2xl">
          <p>
            Thanks for applying for the <span className="text-white">{role.title}</span> role.
            We received it.
          </p>
          <p>
            Someone on our team reads every application that comes in. We respond to all of them,
            usually within 5 business days. If we want to move forward, the next step is a
            20-minute phone screen.
          </p>
          <p>
            In the meantime, no need to follow up — we will reach out either way.
          </p>
          <p className="text-white/50 text-sm pt-2">
            A confirmation email is on its way to the address you provided. If you do not see it
            within a few minutes, check your spam folder.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link
            href="/careers"
            className="inline-flex items-center gap-3 border border-white/40 text-white font-heading text-sm uppercase tracking-widest px-8 py-4 hover:border-white hover:bg-white hover:text-black transition-colors"
          >
            ← All Open Roles
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-3 font-heading text-sm uppercase tracking-widest text-white/60 hover:text-white px-2 py-4 transition-colors"
          >
            Back to FightCraft
          </Link>
        </div>
      </div>
    </section>
  )
}
