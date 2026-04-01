import LeadForm from './LeadForm'

interface LeadCaptureProps {
  selectedLocation?: string
}

export default function LeadCapture({ selectedLocation }: LeadCaptureProps) {
  return (
    <section id="contact" className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-fixed bg-cover bg-center grayscale" style={{ backgroundImage: 'url(/images/home/lian.jpeg)' }} />
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-white mb-3">
          Ready to Get Started?
        </h2>
        <p className="text-white/60 mb-10">
          Drop your info and we&apos;ll reach out with everything you need to get started.
        </p>

        <LeadForm selectedLocation={selectedLocation} variant="dark" />
      </div>
    </section>
  )
}
