import BrandBadge from './BrandBadge'
import AutoPlayVideo from './AutoPlayVideo'
import QuickForm from './QuickForm'

interface PageHeroProps {
  title: string
  subtitle?: string
  image?: string
  youtubeId?: string
  videoSrc?: string
  tall?: boolean
  badge?: {
    locationName?: string
    state?: string
  }
}

export default function PageHero({ title, subtitle, image, youtubeId, videoSrc, tall = false, badge }: PageHeroProps) {
  return (
    <section className={`relative flex flex-col overflow-hidden ${tall ? 'min-h-screen md:min-h-[70vh]' : 'min-h-[70vh] md:min-h-[50vh]'}`}>
      {videoSrc ? (
        <div className="absolute inset-0">
          <AutoPlayVideo
            src={videoSrc}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
      ) : youtubeId ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1`}
              allow="autoplay"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none grayscale"
              style={{ border: 0, width: 'max(177.78vh, 100vw)', height: 'max(56.25vw, 100vh)' }}
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

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20 flex-1 flex flex-col items-center justify-center">
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

      <div className="relative z-10">
        <QuickForm />
      </div>
    </section>
  )
}
