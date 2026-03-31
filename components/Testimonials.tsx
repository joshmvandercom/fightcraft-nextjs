import type { Testimonial } from '@/lib/content'

interface TestimonialsProps {
  testimonials: Testimonial[]
  layout?: 'carousel' | 'grid'
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="border border-white/20 p-8">
      <div className="flex gap-1 mb-6">
        {Array.from({ length: t.stars }).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-white/70 leading-relaxed mb-6">&ldquo;{t.body}&rdquo;</p>
      <div>
        <p className="font-heading text-sm uppercase tracking-wide font-bold">{t.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <img src="/images/google.webp" alt="Google" className="w-4 h-4" />
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Google Review</span>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials({ testimonials, layout = 'carousel' }: TestimonialsProps) {
  return (
    <section id="testimonials" className="bg-black text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {layout === 'carousel' && (
          <div className="mb-16">
            <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight">What People Say</h2>
            <div className="w-16 h-px bg-white mt-6" />
          </div>
        )}

        {layout === 'carousel' ? (
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {testimonials.map(t => (
              <div key={t.name} className="snap-start shrink-0 w-[320px] md:w-[400px]">
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <TestimonialCard key={t.name} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
