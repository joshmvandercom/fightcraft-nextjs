'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import RequireLead from '@/components/RequireLead'
import { getLead } from '@/lib/lead'

interface ScheduleClass {
  time: string
  name: string
  bookable?: boolean
}

interface ScheduleDay {
  day: string
  classes: ScheduleClass[]
}

function BookContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const programParam = searchParams.get('p') || ''
  const defaultCategory = PROGRAM_TO_CATEGORY[programParam] || 'all'
  const router = useRouter()
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [filter, setFilter] = useState<string>(defaultCategory)
  const [selectedClass, setSelectedClass] = useState<DatedClass | null>(null)
  const [booked, setBooked] = useState(false)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetch(`/api/schedule?location=${slug}`)
      .then(r => r.json())
      .then(data => setSchedule(data.schedule || []))
      .catch(() => {})
  }, [slug])

  const datedClasses = buildDatedSchedule(schedule)

  // Get categories that have classes in this location's schedule
  const availableCategories = Array.from(new Set(datedClasses.map(c => getCategory(c.name)))).sort()

  const bookableCategories = availableCategories.filter(c => c !== 'Sparring')

  const categories = [
    { label: 'All', value: 'all' },
    ...bookableCategories.map(cat => ({ label: cat, value: cat })),
  ]

  const filteredClasses = datedClasses.filter(c => {
    if (getCategory(c.name) === 'Sparring') return false
    return filter === 'all' || getCategory(c.name) === filter
  })

  // Group by date string
  const groupedByDate: Record<string, { dayName: string; classes: DatedClass[] }> = {}
  for (const cls of filteredClasses) {
    const key = cls.dateStr
    if (!groupedByDate[key]) groupedByDate[key] = { dayName: cls.dayName, classes: [] }
    groupedByDate[key].classes.push(cls)
  }

  async function handleBook() {
    if (!selectedClass) return
    setBooking(true)

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: slug,
          day: selectedClass.dayName,
          date: selectedClass.date.toISOString(),
          time: selectedClass.time,
          className: selectedClass.name,
          ...(() => { const l = getLead(); return l ? { name: l.name, email: l.email, phone: l.phone } : {} })(),
        }),
      })

      if (res.ok) {
        // Download the .ics file
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'fightcraft-class.ics'
        a.click()
        URL.revokeObjectURL(url)

        // Redirect to confirmed page
        const qp = new URLSearchParams({
          class: selectedClass.name,
          day: `${selectedClass.dayName}, ${selectedClass.dateStr}`,
          time: selectedClass.time,
        })
        router.push(`/${slug}/quiz/class-confirmed?${qp.toString()}`)
        return
      }
    } catch {}
    setBooking(false)
  }

  const locationName = slug === 'san-jose' ? 'San Jose' : slug === 'merced' ? 'Merced' : slug === 'brevard' ? 'Brevard' : slug

  if (booked) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between mb-16">
          <a href="/">
            <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
          </a>
        </div>
        <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center text-center">
          <h1 className="font-heading text-4xl md:text-5xl uppercase font-bold tracking-tight mb-6">
            You&apos;re Booked.
          </h1>
          <p className="text-lg text-white/70 mb-2">
            {selectedClass?.name}
          </p>
          <p className="text-white/50 mb-8">
            {selectedClass?.dayName}, {selectedClass?.dateStr} at {selectedClass?.time}
          </p>
          <p className="text-white/50 mb-2">A calendar invite was just downloaded.</p>
          <p className="text-white/50 mb-12">Add it to your calendar so you don&apos;t forget.</p>

          <div className="space-y-4">
            <p className="text-base text-white/70">What to bring:</p>
            <p className="text-sm text-white/50">Comfortable athletic clothes and water. We provide everything else.</p>
          </div>

          <div className="mt-12">
            <a href={`/${slug}`} className="font-heading text-sm uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              Explore FightCraft {locationName}
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 py-8">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-12">
        <a href="/">
          <img src="/images/fc-white-initials.svg" alt="FightCraft" className="h-10 brightness-0 invert" />
        </a>
        <p className="font-heading text-xs uppercase tracking-widest text-white/40">FightCraft {locationName}</p>
      </div>

      <div className="max-w-4xl w-full mx-auto flex-1">
        <h1 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-3">
          Pick Your First Class
        </h1>
        <p className="text-white/50 mb-10">
          Select a class below. We&apos;ll send you a calendar invite.
        </p>

        {/* Filter */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setFilter(cat.value); setSelectedClass(null) }}
              className={`px-4 py-2 text-sm font-heading uppercase tracking-widest transition-colors cursor-pointer ${
                filter === cat.value
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Schedule */}
        {Object.keys(groupedByDate).length === 0 ? (
          <p className="text-white/40">Loading schedule...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {Object.entries(groupedByDate).map(([dateStr, { dayName, classes }]) => (
              <div key={dateStr}>
                <h3 className="font-heading text-base uppercase font-bold tracking-tight mb-1">
                  {dayName}
                </h3>
                <p className="text-xs text-white/40 mb-4 pb-2 border-b border-white/20">{dateStr}</p>
                <div className="space-y-2">
                  {classes.map((cls, i) => {
                    if (!cls.bookable) return null
                    const isSelected = selectedClass?.dateStr === cls.dateStr && selectedClass?.time === cls.time && selectedClass?.name === cls.name
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedClass(cls)}
                        className={`w-full text-left px-3 py-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <p className={`font-heading text-xs uppercase tracking-wider ${isSelected ? 'text-black/50' : 'text-white/40'}`}>
                          {cls.time}
                        </p>
                        <p className={`text-sm ${isSelected ? 'text-black font-medium' : 'text-white/70'}`}>
                          {cls.name}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Book button */}
        <div className="sticky bottom-0 bg-black py-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            {selectedClass ? (
              <p className="text-sm text-white/60">
                <span className="text-white font-medium">{selectedClass.name}</span> {selectedClass.dayName}, {selectedClass.dateStr} at {selectedClass.time}
              </p>
            ) : (
              <p className="text-sm text-white/40">Select a class to continue</p>
            )}
            <button
              onClick={handleBook}
              disabled={!selectedClass || booking}
              className={`px-10 py-4 font-heading text-sm uppercase tracking-widest transition-colors ${
                selectedClass
                  ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {booking ? 'Booking...' : 'Book This Class'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const DAY_MAP: Record<string, number> = {
  'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
  'Thursday': 4, 'Friday': 5, 'Saturday': 6,
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface DatedClass {
  date: Date
  dateStr: string
  dayName: string
  time: string
  name: string
  bookable: boolean
}

function buildDatedSchedule(schedule: ScheduleDay[]): DatedClass[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const classes: DatedClass[] = []

  // 3 days out, but if that lands on Sat/Sun extend to include Monday
  const baseEnd = new Date(today)
  baseEnd.setDate(today.getDate() + 3)
  const endDay = baseEnd.getDay()
  let totalDays = 3
  if (endDay === 6) totalDays = 5  // Sat: extend through Sun + Mon
  if (endDay === 0) totalDays = 4  // Sun: extend through Mon

  for (let offset = 0; offset < totalDays; offset++) {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    const dayOfWeek = date.getDay()

    const daySchedule = schedule.find(d => DAY_MAP[d.day] === dayOfWeek)
    if (!daySchedule) continue

    for (const cls of daySchedule.classes) {
      classes.push({
        date,
        dateStr: `${MONTHS[date.getMonth()]} ${date.getDate()}`,
        dayName: daySchedule.day,
        time: cls.time,
        name: cls.name,
        bookable: cls.bookable !== false,
      })
    }
  }

  return classes
}

const PROGRAM_CATEGORIES: { label: string; keywords: string[] }[] = [
  { label: 'Kickboxing', keywords: ['kickboxing'] },
  { label: 'Muay Thai', keywords: ['muay thai'] },
  { label: 'Jiu Jitsu', keywords: ['jiu-jitsu', 'jiu jitsu', 'no gi', 'open mat'] },
  { label: 'MMA', keywords: ['mma', 'wrestling', 'wall work', 'striking for mma'] },
  { label: 'Sparring', keywords: ['sparring'] },
  { label: 'Kids & Teens', keywords: ['kids', 'teens'] },
  { label: 'Fight Team', keywords: ['fight team'] },
]

function getCategory(className: string): string {
  const lower = className.toLowerCase()
  for (const cat of PROGRAM_CATEGORIES) {
    if (cat.keywords.some(kw => lower.includes(kw))) return cat.label
  }
  return 'Other'
}

// Map quiz program value → booking filter category
const PROGRAM_TO_CATEGORY: Record<string, string> = {
  kickboxing: 'Kickboxing',
  muay_thai: 'Muay Thai',
  brazilian_jiu_jitsu: 'Jiu Jitsu',
  no_gi_jiu_jitsu: 'Jiu Jitsu',
  mixed_martial_arts: 'MMA',
  wrestling: 'MMA',
  kids_martial_arts: 'Kids & Teens',
  'kids_and_teens': 'Kids & Teens',
  teens_kickboxing: 'Kids & Teens',
}

export default function BookPage() {
  return (
    <RequireLead>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <BookContent />
      </Suspense>
    </RequireLead>
  )
}
