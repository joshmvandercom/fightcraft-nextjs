import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import LeadCapture from '@/components/LeadCapture'
import { getTestimonials } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Reviews | FightCraft',
  description: 'See what our members say about training at FightCraft. Real Google reviews from real people.',
}

export default function ReviewsPage() {
  const testimonials = getTestimonials()

  return (
    <>
      <PageHero title="Reviews" subtitle="What Our Members Say" />

      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="border border-black/20 p-8">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-black/70 leading-relaxed mb-6">&ldquo;{t.body}&rdquo;</p>
                <div>
                  <p className="font-heading text-sm uppercase tracking-wide font-bold text-black">{t.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <img src="/images/google.webp" alt="Google" className="w-4 h-4" />
                    <span className="text-[10px] text-black/40 uppercase tracking-widest">Google Review</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LeadCapture />
    </>
  )
}
