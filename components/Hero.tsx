import AutoPlayVideo from './AutoPlayVideo'
import QuickForm from './QuickForm'

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0">
        <AutoPlayVideo
          src="/images/home/hero.mp4"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex-1 flex flex-col justify-center py-24">
        <p className="font-heading text-sm uppercase tracking-[0.3em] text-white/60 mb-6">
          FIGHTCRAFT // PREMIER_MARTIAL_ARTS
        </p>
        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase font-bold leading-[0.95] tracking-tight text-white">
          Escape the Mundane.<br />
          Become Your Best Self.
        </h1>
        <p className="text-white/70 mt-6 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          Learn modern martial arts, for every level, at a gym near you.
        </p>
      </div>

      <div className="relative z-10">
        <QuickForm />
      </div>
    </section>
  )
}
