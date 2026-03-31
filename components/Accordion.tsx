'use client'

import { useState } from 'react'
import type { FAQ } from '@/lib/content'

interface AccordionProps {
  items: FAQ[]
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="divide-y divide-black/10">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-6 text-left group"
            aria-expanded={openIndex === i}
          >
            <span className="font-heading text-lg md:text-xl uppercase tracking-tight font-bold text-black group-hover:text-black/70 transition-colors pr-8">
              {item.question}
            </span>
            <svg
              className={`w-5 h-5 text-black/40 shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="pb-6">
              <p className="text-black/60 leading-relaxed max-w-2xl">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
