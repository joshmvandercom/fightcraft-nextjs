interface BrandBadgeProps {
  mark?: string
  line1?: string
  line2?: string
  locationName?: string
  state?: string
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

export default function BrandBadge({
  mark = 'FC',
  line1 = 'FIGHTCRAFT',
  line2,
  locationName,
  state,
  variant = 'light',
  size = 'md',
}: BrandBadgeProps) {
  const borderColor = variant === 'light' ? 'border-white' : 'border-black'
  const textColor = variant === 'light' ? 'text-white' : 'text-black'
  const ruleColor = variant === 'light' ? 'bg-white' : 'bg-black'

  const sizeClasses = {
    sm: { box: 'w-28 py-6', mark: 'text-3xl', text: 'text-[8px]', gap: 'gap-2', rule: 'w-6' },
    md: { box: 'w-40 py-8', mark: 'text-5xl', text: 'text-[9px]', gap: 'gap-3', rule: 'w-8' },
    lg: { box: 'w-52 py-10', mark: 'text-7xl', text: 'text-[10px]', gap: 'gap-4', rule: 'w-10' },
  }

  const s = sizeClasses[size]

  return (
    <div className={`${s.box} ${borderColor} border-2 p-1 inline-block`}>
      <div className={`${borderColor} border h-full flex flex-col items-center justify-center ${s.gap} px-4 py-4`}>
        {/* Mark */}
        <span className={`font-heading ${s.mark} font-bold ${textColor} leading-none tracking-tighter`}>
          {mark}
        </span>

        {/* Rule */}
        <div className={`${s.rule} h-px ${ruleColor}`} />

        {/* Text lines */}
        <div className={`${s.text} font-heading uppercase tracking-[0.2em] ${textColor} text-center space-y-0.5`}>
          <p>{line1}</p>
          {line2 && <p className="opacity-60">{line2}</p>}
          {locationName && (
            <p className="flex justify-between w-full">
              <span>{locationName}</span>
              {state && <span className="opacity-60">{state}</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
