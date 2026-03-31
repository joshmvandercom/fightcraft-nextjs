import type { Location } from '@/lib/content'

interface FooterProps {
  locations: Location[]
}

export default function Footer({ locations }: FooterProps) {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-heading text-sm uppercase tracking-widest text-white mb-6">Locations</h3>
            <div className="space-y-4">
              {locations.map(loc => (
                <div key={loc.slug}>
                  <a href={`/${loc.slug}`} className="font-heading text-lg uppercase text-white hover:text-white/70 transition-colors">
                    {loc.name}
                    {loc.label === 'Headquarters' && <span className="text-xs text-white/40 ml-2">HQ</span>}
                  </a>
                  {loc.status === 'coming_soon' ? (
                    <p className="text-sm text-white/40">Coming Soon</p>
                  ) : (
                    <p className="text-sm text-white/60">{loc.address}<br />{loc.city}, {loc.state} {loc.zip}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm uppercase tracking-widest text-white mb-6">Quick Links</h3>
            <div className="space-y-3">
              <a href="/about/core-values" className="block text-sm text-white/60 hover:text-white transition-colors">Our Values</a>
              <a href="/locations" className="block text-sm text-white/60 hover:text-white transition-colors">Find a Gym</a>
              <a href="/about/reviews" className="block text-sm text-white/60 hover:text-white transition-colors">Reviews</a>
              <a href="/about/faq" className="block text-sm text-white/60 hover:text-white transition-colors">FAQ</a>
              <a href="/about" className="block text-sm text-white/60 hover:text-white transition-colors">About Us</a>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm uppercase tracking-widest text-white mb-6">Connect</h3>
            <div className="space-y-3">
              {locations.filter(loc => loc.instagram).map(loc => (
                <p key={loc.slug} className="text-sm text-white/60">
                  <span className="text-white/70">{loc.name}:</span> {loc.instagram}
                </p>
              ))}
            </div>
            <p className="text-sm text-white/60 mt-6">
              <a href="mailto:friends@fightcraft.com" className="hover:text-white transition-colors">friends@fightcraft.com</a>
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="font-display text-4xl text-white/40 leading-none">FC</span>
            <div className="w-px h-6 bg-white/10" />
            <span className="font-heading text-[10px] uppercase tracking-[0.3em] text-white/40">FIGHTCRAFT</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">&copy; {new Date().getFullYear()} FIGHTCRAFT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
