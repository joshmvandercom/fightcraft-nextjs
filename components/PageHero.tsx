import BrandBadge from './BrandBadge'

interface PageHeroProps {
  title: string
  subtitle?: string
  image?: string
  youtubeId?: string
  tall?: boolean
  badge?: {
    locationName?: string
    state?: string
  }
}

export default function PageHero({ title, subtitle, image, youtubeId, tall = false, badge }: PageHeroProps) {
  return (
    <section className={`relative flex items-center justify-center overflow-hidden ${tall ? 'min-h-[70vh]' : 'min-h-[50vh]'}`}>
      {youtubeId ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 scale-150">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1`}
              allow="autoplay"
              className="w-full h-full pointer-events-none grayscale"
              style={{ border: 0 }}
              title="Background video"
            />
          </div>
          <div className="absolute inset-0 bg-black/70" />
        </div>
      ) : image ? (
        <div className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-black/80" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20 flex flex-col items-center">
        {badge && (
          <div className="mb-10">
            <BrandBadge
              locationName={badge.locationName?.replace(/\s+/g, '_').toUpperCase()}
              state={badge.state}
              variant="light"
              size="md"
            />
          </div>
        )}
        <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl uppercase font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="font-heading text-lg md:text-xl uppercase tracking-[0.3em] text-white/50 mt-6">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
