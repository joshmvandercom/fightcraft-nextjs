export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/home/kickboxing.jpg" alt="" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="font-heading text-sm uppercase tracking-[0.4em] text-white/40 mb-6">
          The Premier Boutique Martial Arts Community
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase font-bold leading-[0.95] tracking-tight text-white">
          Escape the Mundane.<br />
          Become Your Best Self.
        </h1>
        <p className="text-white/50 mt-6 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          Learn modern martial arts — for every level, at a gym near you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <a href="#contact" className="inline-block px-10 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest hover:bg-white/90 transition-colors">
            Try a Free Class
          </a>
          <a href="/locations" className="inline-block px-10 py-4 border border-white/40 text-white font-heading text-sm uppercase tracking-widest hover:border-white transition-colors">
            Find a Gym
          </a>
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
