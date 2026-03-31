import type { CoreValue } from '@/lib/content'

interface ValuesProps {
  values: CoreValue[]
  layout?: 'compact' | 'full'
}

export default function Values({ values, layout = 'compact' }: ValuesProps) {
  return (
    <section id="values" className="bg-white text-black py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {layout === 'compact' && (
          <div className="mb-16">
            <h2 className="font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight text-black">Our Values</h2>
            <div className="w-16 h-px bg-black mt-6" />
          </div>
        )}

        {layout === 'compact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {values.map((value, i) => (
              <div key={value.title}>
                <p className="font-heading text-xs uppercase tracking-widest text-black/30 mb-3">0{i + 1}</p>
                <h3 className="font-heading text-2xl uppercase font-bold tracking-tight text-black mb-4">{value.title}</h3>
                <p className="text-sm text-black/60 leading-relaxed mb-6">{value.body}</p>
                <blockquote className="border-l border-black/20 pl-4">
                  <p className="text-sm italic text-black/50">&ldquo;{value.quote}&rdquo;</p>
                  <cite className="text-xs text-black/30 not-italic mt-1 block">&mdash; {value.author}</cite>
                </blockquote>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-20">
            {values.map((value, i) => (
              <div key={value.title} className={`grid grid-cols-1 md:grid-cols-12 gap-8 ${i > 0 ? 'pt-20 border-t border-black/10' : ''}`}>
                <div className="md:col-span-4">
                  <p className="font-heading text-xs uppercase tracking-widest text-black/30 mb-3">0{i + 1}</p>
                  <h3 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight text-black">{value.title}</h3>
                </div>
                <div className="md:col-span-8">
                  <p className="text-base text-black/60 leading-relaxed mb-8">{value.body}</p>
                  <blockquote className="border-l-2 border-black pl-6">
                    <p className="text-lg italic text-black/50">&ldquo;{value.quote}&rdquo;</p>
                    <cite className="text-sm text-black/40 not-italic mt-2 block">&mdash; {value.author}</cite>
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
