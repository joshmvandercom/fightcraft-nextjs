import CTAButton from './CTAButton'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/iimq3DGVEJE?autoplay=1&mute=1&loop=1&playlist=iimq3DGVEJE&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1"
            allow="autoplay"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none grayscale"
            style={{ border: 0, width: 'max(177.78vh, 100vw)', height: 'max(56.25vw, 100vh)' }}
            title="Background video"
          />
        </div>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="font-heading text-sm uppercase tracking-[0.3em] text-white/60 mb-6">
          FIGHTCRAFT // PREMIER_MARTIAL_ARTS
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase font-bold leading-[0.95] tracking-tight text-white">
          Escape the Mundane.<br />
          Become Your Best Self.
        </h1>
        <p className="text-white/70 mt-6 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          Learn modern martial arts, for every level, at a gym near you.
        </p>
        <div className="mt-10">
          <CTAButton className="inline-block px-10 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest hover:bg-white/90 transition-colors cursor-pointer">
            Request More Information
          </CTAButton>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7" />
        </svg>
      </div>
    </section>
  )
}
