import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { getAllCareers } from '@/lib/careers'

export const metadata: Metadata = {
  title: 'Careers | FightCraft',
  description: 'Open roles at FightCraft. Build something real with people who give a damn.',
  openGraph: {
    title: 'Careers at FightCraft',
    description: 'Build something real with people who give a damn.',
    type: 'website',
  },
}

const FALLBACK_EMAIL = 'friends@fightcraft.com'

export default function CareersPage() {
  const roles = getAllCareers()

  return (
    <>
      <PageHero
        title="Now Hiring"
        subtitle="The bar is high. The room is worth being in."
        image="/images/home/carlos.jpeg"
      />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-black/50 mb-4">_OPEN_ROLES</p>
            <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight">
              Now Hiring
            </h2>
            <div className="w-16 h-px bg-black mt-6" />
          </div>

          {roles.length === 0 ? (
            <div className="border border-black/10 p-12 max-w-3xl">
              <p className="font-heading text-xl md:text-2xl uppercase tracking-tight text-black mb-4">
                No open positions right now
              </p>
              <p className="text-black/70 leading-relaxed">
                But we&apos;re always interested in talented people. If you think you&apos;re a fit
                for FightCraft, send us a note at{' '}
                <a href={`mailto:${FALLBACK_EMAIL}`} className="underline underline-offset-4 text-black hover:opacity-70">
                  {FALLBACK_EMAIL}
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map(role => (
                <Link
                  key={role.slug}
                  href={`/careers/${role.slug}`}
                  className="group block border border-black/10 p-8 hover:border-black transition-colors"
                >
                  <p className="font-heading text-xs uppercase tracking-[0.3em] text-black/50 mb-3">
                    {role.location ?? 'FightCraft'}
                  </p>
                  <h3 className="font-heading text-2xl md:text-3xl uppercase font-bold tracking-tight text-black mb-3 group-hover:opacity-80">
                    {role.title}
                  </h3>
                  {role.employment_type && (
                    <p className="text-sm text-black/60 leading-relaxed mb-4">
                      {role.employment_type}
                    </p>
                  )}
                  {role.compensation_summary && (
                    <p className="text-sm text-black mb-6 leading-relaxed">
                      {role.compensation_summary}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-3 font-heading text-sm uppercase tracking-widest text-black border-b border-black pb-1">
                    View Role
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-4">_WORKING_HERE</p>
            <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight">
              What This Place Is
            </h2>
            <div className="w-16 h-px bg-white mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-4">_01</p>
              <h3 className="font-heading text-2xl uppercase font-bold tracking-tight mb-4">
                Built, Not Cobbled
              </h3>
              <p className="text-white/70 leading-relaxed">
                We run a real business with real systems. Playbooks, training,
                marketing, retention — all of it documented and improving. You
                inherit a machine that works, not a mess.
              </p>
            </div>
            <div>
              <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-4">_02</p>
              <h3 className="font-heading text-2xl uppercase font-bold tracking-tight mb-4">
                Performance Over Politics
              </h3>
              <p className="text-white/70 leading-relaxed">
                Numbers tell the truth. We promote on results, pay on results,
                and have honest conversations about what is and isn&apos;t working.
                If that sounds harsh, it isn&apos;t the right fit.
              </p>
            </div>
            <div>
              <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-4">_03</p>
              <h3 className="font-heading text-2xl uppercase font-bold tracking-tight mb-4">
                A Real Path
              </h3>
              <p className="text-white/70 leading-relaxed">
                Roles here are designed with what comes next built in. We&apos;ve
                already promoted from inside the room more than once. The
                ladder isn&apos;t hypothetical.
              </p>
            </div>
          </div>

          <div className="mt-20 max-w-3xl">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-white/50 mb-4">_HIRING_PHILOSOPHY</p>
            <p className="text-white/70 leading-relaxed text-lg mb-4">
              We respect your time and we expect you to respect ours. Our
              hiring process is fast, direct, and honest. You will know where
              you stand at every step.
            </p>
            <p className="text-white/70 leading-relaxed text-lg">
              We hire slow and back people hard. The bar is high and the room
              is worth being in.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
