interface LeadCaptureProps {
  selectedLocation?: string
}

export default function LeadCapture({ selectedLocation }: LeadCaptureProps) {
  return (
    <section id="contact" className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/home/lian.jpeg" alt="" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="font-display text-[5rem] sm:text-[7rem] md:text-[9rem] leading-[0.85] uppercase text-white tracking-tight">
          Start Your<br />Journey
        </h2>
        <p className="text-white/50 mt-6 mb-12 max-w-md mx-auto">
          Request information about our programs and schedule a free class at the location nearest you.
        </p>

        <form action="#" method="POST" className="max-w-xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input type="text" name="first_name" placeholder="First Name" required className="w-full px-4 py-3 bg-transparent border border-white/30 text-white placeholder-white/30 font-heading text-sm uppercase tracking-wider focus:border-white focus:outline-none transition-colors" />
            <input type="email" name="email" placeholder="Email" required className="w-full px-4 py-3 bg-transparent border border-white/30 text-white placeholder-white/30 font-heading text-sm uppercase tracking-wider focus:border-white focus:outline-none transition-colors" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <input type="tel" name="phone" placeholder="Phone" className="w-full px-4 py-3 bg-transparent border border-white/30 text-white placeholder-white/30 font-heading text-sm uppercase tracking-wider focus:border-white focus:outline-none transition-colors" />
            <select name="location" defaultValue={selectedLocation || ''} className="w-full px-4 py-3 bg-transparent border border-white/30 text-white/50 font-heading text-sm uppercase tracking-wider focus:border-white focus:outline-none transition-colors">
              <option value="" className="bg-black">Select Location</option>
              <option value="san-jose" className="bg-black">San Jose</option>
              <option value="merced" className="bg-black">Merced</option>
              <option value="brevard" className="bg-black">Brevard</option>
            </select>
          </div>

          <div className="asdf">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <button type="submit" className="w-full sm:w-auto px-12 py-4 bg-white text-black font-heading text-sm uppercase tracking-widest hover:bg-white/90 transition-colors">
            Request Info
          </button>
        </form>
      </div>
    </section>
  )
}
