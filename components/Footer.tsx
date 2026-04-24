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
                  </a>
                  <p className="text-sm text-white/60">{loc.address}<br />{loc.city}, {loc.state} {loc.zip}</p>
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
              <a href="/privacy-policy" className="block text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</a>
              <a href="/refund-policy" className="block text-sm text-white/60 hover:text-white transition-colors">Refund Policy</a>
              <a href="/affiliate" className="block text-sm text-white/60 hover:text-white transition-colors">Become an Affiliate</a>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm uppercase tracking-widest text-white mb-6">Connect</h3>
            <div className="space-y-4">
              {locations.map(loc => (
                <div key={loc.slug}>
                  <p className="font-heading text-xs uppercase tracking-wider text-white/80">{loc.name}</p>
                  {loc.instagram && (
                    <a href={`https://instagram.com/${loc.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-white/60 hover:text-white transition-colors">{loc.instagram}</a>
                  )}
                  {loc.contact_email && (
                    <a href={`mailto:${loc.contact_email}`} className="text-sm text-white/60 hover:text-white transition-colors">
                      {loc.contact_email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/images/fc-white-initials.svg" alt="FC" className="h-8 brightness-0 invert" />
            <div className="w-px h-6 bg-white/40" />
            <span className="font-heading text-sm uppercase tracking-[0.3em] text-white">FIGHTCRAFT</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">&copy; {new Date().getFullYear()} FIGHTCRAFT. All rights reserved.</p>
            <a href="https://schedulous.com" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors">
              Powered by Schedulous
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
