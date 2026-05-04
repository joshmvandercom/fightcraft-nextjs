import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CareerApplicationForm from '@/components/CareerApplicationForm'
import { getCareer, getCareerSlugs } from '@/lib/careers'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export function generateStaticParams() {
  return getCareerSlugs().map(slug => ({ slug }))
}

export default async function ApplyPage({ params }: PageProps) {
  const { slug } = await params
  const role = getCareer(slug)
  if (!role) notFound()

  const blobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN

  return (
    <>
      <section className="bg-black text-white pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/careers/${role.slug}`}
            className="inline-block font-heading text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors mb-8"
          >
            ← Back to role
          </Link>
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-3">
            _APPLICATION
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase font-bold tracking-tight">
            Apply for this role
          </h1>
          <div className="w-12 h-px bg-white mt-5 mb-6" />
          <p className="text-white/70 text-base md:text-lg leading-relaxed">
            Applying for: <span className="text-white">{role.title}</span>
            {role.location && <span className="text-white/50">, {role.location}</span>}.
          </p>
          <p className="text-white/50 text-sm mt-3 leading-relaxed">
            Brief, real, in your own voice. Resume optional — we care more about how you write
            than how you format your work history.
          </p>
        </div>
      </section>

      <section className="bg-white text-black py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <CareerApplicationForm roleSlug={role.slug} blobEnabled={blobEnabled} />
        </div>
      </section>
    </>
  )
}
