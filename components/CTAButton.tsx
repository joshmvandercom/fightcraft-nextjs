'use client'

interface CTAButtonProps {
  children: React.ReactNode
  className?: string
}

export default function CTAButton({ children, className = '' }: CTAButtonProps) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('open-lead-modal'))}
      className={className}
    >
      {children}
    </button>
  )
}
