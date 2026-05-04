import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CareerMarkdown from '@/components/CareerMarkdown'
import { getCareer, getCareerSlugs, type CareerPosting } from '@/lib/careers'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getCareerSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const role = getCareer(slug)
  if (!role) return { title: 'Role Not Found | FightCraft Careers' }

  const description =
    role.compensation_summary ??
    role.employment_type ??
    `Open role at FightCraft${role.location ? ` — ${role.location}` : ''}.`

  return {
    title: `${role.title} | FightCraft Careers`,
    description,
    openGraph: {
      title: `${role.title} — FightCraft`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${role.title} — FightCraft`,
      description,
    },
  }
}

function ApplyAnchor({ role, className = '' }: { role: CareerPosting; className?: string }) {
  const externalLink =
    role.apply_link && /^https?:\/\//i.test(role.apply_link.trim()) ? role.apply_link.trim() : null
  const href = externalLink ?? `/careers/${role.slug}/apply`
  const externalAttrs = externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <a
      href={href}
      {...externalAttrs}
      className={`inline-flex items-center justify-center gap-3 bg-white text-black font-heading text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/90 transition-colors ${className}`}
    >
      Apply Now
      <span aria-hidden>→</span>
    </a>
  )
}

function jobPostingSchema(role: CareerPosting): Record<string, unknown> {
  const description = [
    role.intro,
    role.about_the_opportunity,
    role.what_youll_do,
    role.the_lifestyle,
    role.what_we_expect,
    role.what_you_can_expect,
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: role.title,
    description,
    datePosted: role.posted_date,
    employmentType: role.employment_type,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'FightCraft',
      sameAs: 'https://fightcraft.com',
    },
    jobLocation: role.location
      ? {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: role.location,
          },
        }
      : undefined,
    baseSalary: role.compensation_summary
      ? {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: { '@type': 'QuantitativeValue', unitText: 'YEAR', name: role.compensation_summary },
        }
      : undefined,
  }
}

export default async function CareerDetailPage({ params }: PageProps) {
  const { slug } = await params
  const role = getCareer(slug)
  if (!role) notFound()

  const schema = jobPostingSchema(role)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero */}
      <section className="relative bg-black text-white pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/careers"
            className="inline-block font-heading text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors mb-10"
          >
            ← All Open Roles
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-4">
                {role.location ? `_${role.location.replace(/\s+/g, '_').toUpperCase()}` : '_FIGHTCRAFT'}
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl uppercase font-bold tracking-tight">
                {role.title}
              </h1>
              <div className="w-16 h-px bg-white mt-6 mb-8" />

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 max-w-2xl">
                {role.location && (
                  <div>
                    <dt className="font-heading text-xs uppercase tracking-[0.3em] text-white/40 mb-2">
                      Location
                    </dt>
                    <dd className="text-white">{role.location}</dd>
                  </div>
                )}
                {role.employment_type && (
                  <div>
                    <dt className="font-heading text-xs uppercase tracking-[0.3em] text-white/40 mb-2">
                      Type
                    </dt>
                    <dd className="text-white">{role.employment_type}</dd>
                  </div>
                )}
              </dl>

              {role.compensation_summary && (
                <div className="mt-10 border border-white/20 p-6 max-w-2xl">
                  <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/40 mb-3">
                    Compensation
                  </p>
                  <p className="font-heading text-xl md:text-2xl uppercase tracking-tight text-white">
                    {role.compensation_summary}
                  </p>
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-32 border-2 border-white p-6">
                <div className="border border-white/40 p-5">
                  <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-3">
                    _READY_TO_GO
                  </p>
                  <p className="font-heading text-2xl uppercase tracking-tight text-white mb-2">
                    Apply for {role.title.split('—')[0].trim()}
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed mb-6">
                    Brief, real, in your own voice. We respond within 5 business days.
                  </p>
                  <ApplyAnchor role={role} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="bg-white text-black py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          {role.intro && (
            <section id="intro">
              <CareerMarkdown>{role.intro}</CareerMarkdown>
            </section>
          )}

          {role.about_the_opportunity && (
            <section id="about-the-opportunity">
              <CareerMarkdown>{role.about_the_opportunity}</CareerMarkdown>
            </section>
          )}

          {role.what_youll_do && (
            <section id="what-youll-do">
              <CareerMarkdown>{role.what_youll_do}</CareerMarkdown>
            </section>
          )}

          {role.what_youll_earn && (
            <section id="what-youll-earn">
              <CareerMarkdown>{role.what_youll_earn}</CareerMarkdown>
            </section>
          )}

          {role.the_lifestyle && (
            <section id="the-lifestyle">
              <CareerMarkdown>{role.the_lifestyle}</CareerMarkdown>
            </section>
          )}

          {role.what_we_expect && (
            <section id="what-we-expect">
              <CareerMarkdown>{role.what_we_expect}</CareerMarkdown>
            </section>
          )}

          {role.what_you_can_expect && (
            <section id="what-you-can-expect">
              <CareerMarkdown>{role.what_you_can_expect}</CareerMarkdown>
            </section>
          )}

          {role.ideal_candidate && (
            <section id="ideal-candidate">
              <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight">
                Who We&apos;re Looking For
              </h2>
              <div className="w-12 h-px bg-black/40 mt-4 mb-8" />

              {role.ideal_candidate.required && role.ideal_candidate.required.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-heading text-lg uppercase tracking-widest text-black mb-4">
                    Required
                  </h3>
                  <ul className="space-y-3">
                    {role.ideal_candidate.required.map((item, i) => (
                      <li key={i} className="flex gap-4 text-base md:text-lg text-black/70 leading-relaxed">
                        <span aria-hidden className="font-heading text-black/40 mt-1">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {role.ideal_candidate.helpful && role.ideal_candidate.helpful.length > 0 && (
                <div>
                  <h3 className="font-heading text-lg uppercase tracking-widest text-black mb-4">
                    Helpful, Not Required
                  </h3>
                  <ul className="space-y-3">
                    {role.ideal_candidate.helpful.map((item, i) => (
                      <li key={i} className="flex gap-4 text-base md:text-lg text-black/70 leading-relaxed">
                        <span aria-hidden className="font-heading text-black/40 mt-1">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {role.not_a_fit_if && role.not_a_fit_if.length > 0 && (
            <section id="not-a-fit">
              <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight">
                Not a Fit If
              </h2>
              <div className="w-12 h-px bg-black/40 mt-4 mb-8" />
              <ul className="space-y-3">
                {role.not_a_fit_if.map((item, i) => (
                  <li key={i} className="flex gap-4 text-base md:text-lg text-black/70 leading-relaxed">
                    <span aria-hidden className="font-heading text-black/40 mt-1">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {role.hiring_process && (
            <section id="hiring-process">
              <CareerMarkdown>{role.hiring_process}</CareerMarkdown>
            </section>
          )}

          <section id="apply" className="border-t border-black/10 pt-16">
            <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight">
              Ready to apply?
            </h2>
            <div className="w-12 h-px bg-black/40 mt-4 mb-6" />
            <p className="text-base md:text-lg text-black/70 leading-relaxed max-w-2xl mb-8">
              The application takes a few minutes. Brief, real, in your own voice — we care more
              about how you answer than how you format a resume. We respond to every application
              within 5 business days.
            </p>
            <ApplyAnchor role={role} className="!bg-black !text-white hover:!bg-black/90" />
          </section>
        </div>
      </article>

      {/* Mobile sticky apply */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur-sm border-t border-white/20 p-4">
        <ApplyAnchor role={role} className="w-full" />
      </div>
      <div className="lg:hidden h-20" aria-hidden />
    </>
  )
}
