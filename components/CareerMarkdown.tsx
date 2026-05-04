import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface CareerMarkdownProps {
  children: string
  variant?: 'light' | 'dark'
}

export default function CareerMarkdown({ children, variant = 'light' }: CareerMarkdownProps) {
  const muted = variant === 'dark' ? 'text-white/70' : 'text-black/70'
  const heading = variant === 'dark' ? 'text-white' : 'text-black'
  const strong = variant === 'dark' ? 'text-white' : 'text-black'
  const rule = variant === 'dark' ? 'bg-white/40' : 'bg-black/40'
  const tableBorder = variant === 'dark' ? 'border-white/20' : 'border-black/10'
  const tableHeadBg = variant === 'dark' ? 'bg-white/5' : 'bg-black/5'
  const tableHeadText = variant === 'dark' ? 'text-white' : 'text-black'

  return (
    <div className="space-y-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <div className="pt-4">
              <h2 className={`font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight ${heading}`}>
                {children}
              </h2>
              <div className={`w-12 h-px mt-4 ${rule}`} />
            </div>
          ),
          h3: ({ children }) => (
            <h3 className={`font-heading text-xl md:text-2xl uppercase font-bold tracking-tight ${heading} pt-4`}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`leading-relaxed text-base md:text-lg ${muted}`}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold ${strong}`}>{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc pl-6 space-y-2 leading-relaxed ${muted}`}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal pl-6 space-y-2 leading-relaxed ${muted}`}>{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} className={`underline underline-offset-4 ${strong} hover:opacity-70`}>
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className={`w-full border-collapse border ${tableBorder} text-sm`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className={tableHeadBg}>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className={`border-b ${tableBorder}`}>{children}</tr>,
          th: ({ children }) => (
            <th
              className={`font-heading text-xs uppercase tracking-widest text-left px-4 py-3 border ${tableBorder} ${tableHeadText}`}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-3 border ${tableBorder} ${muted}`}>{children}</td>
          ),
          hr: () => <hr className={`border-0 h-px ${rule}`} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
