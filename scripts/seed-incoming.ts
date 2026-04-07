import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

if (!dbUrl.includes('localhost')) {
  console.error('Refusing to seed: DATABASE_URL must be localhost')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: dbUrl })
const prisma = new PrismaClient({ adapter })

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000)

const TEST_LEADS = [
  { name: 'Marcus Chen', email: 'marcus.test@example.com', phone: '4085551001', source: 'meta', status: 'lead', hoursAgo: 0.5 },
  { name: 'Priya Patel', email: 'priya.test@example.com', phone: '4085551002', source: 'website', status: 'lead', hoursAgo: 1 },
  { name: 'David Rodriguez', email: 'david.test@example.com', phone: '4085551003', source: 'meta', status: 'booked', hoursAgo: 2 },
  { name: 'Sarah Kim', email: 'sarah.test@example.com', phone: '4085551004', source: 'website', status: 'booked', hoursAgo: 3 },
  { name: 'Jamal Williams', email: 'jamal.test@example.com', phone: '4085551005', source: 'meta', status: 'attended', hoursAgo: 4 },
  { name: 'Emily Tran', email: 'emily.test@example.com', phone: '4085551006', source: 'website', status: 'attended', hoursAgo: 5 },
  { name: 'Carlos Mendez', email: 'carlos.test@example.com', phone: '4085551007', source: 'meta', status: 'no_show', hoursAgo: 6, statusReason: null },
  { name: 'Rachel Green', email: 'rachel.test@example.com', phone: '4085551008', source: 'website', status: 'rescheduled', hoursAgo: 7 },
  { name: 'Tyler Brooks', email: 'tyler.test@example.com', phone: '4085551009', source: 'meta', status: 'won', hoursAgo: 8 },
  { name: 'Aisha Johnson', email: 'aisha.test@example.com', phone: '4085551010', source: 'website', status: 'lost', hoursAgo: 9, statusReason: 'Said price was too high' },
  { name: 'Kevin Park', email: 'kevin.test@example.com', phone: '4085551011', source: 'meta', status: 'lead', hoursAgo: 0.25 },
  { name: 'Zoe Martinez', email: 'zoe.test@example.com', phone: '4085551012', source: 'website', status: 'lead', hoursAgo: 0.75 },
]

async function main() {
  console.log('Cleaning up old test data...')
  await prisma.lead.deleteMany({
    where: { email: { contains: '.test@example.com' } },
  })

  console.log(`Seeding ${TEST_LEADS.length} test leads...`)
  for (const t of TEST_LEADS) {
    await prisma.lead.create({
      data: {
        name: t.name,
        email: t.email,
        phone: t.phone,
        location: 'san-jose',
        source: t.source,
        status: t.status,
        statusReason: t.statusReason || null,
        createdAt: hoursAgo(t.hoursAgo),
      },
    })
  }

  // Add an intake for one of the attended leads to test the badge
  const jamal = await prisma.lead.findUnique({ where: { email: 'jamal.test@example.com' } })
  if (jamal) {
    await prisma.intake.create({
      data: {
        leadId: jamal.id,
        dob: '1995-03-15',
        emergencyName: 'Lisa Williams',
        emergencyPhone: '4085559999',
        goals: 'Get in shape, Build confidence',
        experience: 'Complete beginner',
        injuries: 'N/A',
        howHeard: 'Instagram',
        programInterest: 'Kickboxing, Brazilian Jiu-Jitsu',
        availableClasses: 'Monday 6:15pm Kickboxing Fundamentals, Wednesday 6:15pm Kickboxing Fundamentals',
        waiverAccepted: true,
      },
    })
    console.log(`Added intake for ${jamal.name}`)
  }

  console.log('Done.')
  await prisma.$disconnect()
}

main()
