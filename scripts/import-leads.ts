import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { readFileSync, writeFileSync } from 'fs'

const csvPath = process.argv[2]
if (!csvPath) {
  console.error('Usage: npx tsx scripts/import-leads.ts <path-to-csv>')
  process.exit(1)
}

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is required. Set it in .env or pass it inline.')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: dbUrl })
const prisma = new PrismaClient({ adapter })

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

interface Row { name: string; email: string; phone: string; location: string }

async function main() {
  const csvText = readFileSync(csvPath, 'utf-8')
  const lines = csvText.trim().split('\n')

  if (lines.length < 2) {
    console.error('CSV must have a header row and at least one data row')
    process.exit(1)
  }

  const header = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase().replace(/"/g, ''))
  console.log('Headers:', header.join(', '))

  const firstNameIdx = header.findIndex(h => h === 'first name' || h === 'firstname')
  const lastNameIdx = header.findIndex(h => h === 'last name' || h === 'lastname')
  const nameIdx = header.findIndex(h => ['name', 'full_name', 'fullname', 'contact name'].includes(h))
  const emailIdx = header.findIndex(h => h === 'email' || h === 'email_address')
  const phoneIdx = header.findIndex(h => h === 'phone' || h === 'phone_number')
  const locationIdx = header.findIndex(h => h === 'location')

  if (emailIdx === -1) {
    console.error('CSV must have an email column. Found headers:', header.join(', '))
    process.exit(1)
  }

  // Parse all rows first
  const rows: Row[] = []
  const seen = new Set<string>()
  let csvDupes = 0

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    const email = cols[emailIdx]?.trim()
    if (!email) continue

    if (seen.has(email)) { csvDupes++; continue }
    seen.add(email)

    let name = ''
    if (firstNameIdx >= 0) {
      const first = cols[firstNameIdx]?.trim() || ''
      const last = lastNameIdx >= 0 ? cols[lastNameIdx]?.trim() || '' : ''
      name = [first, last].filter(Boolean).join(' ')
    } else if (nameIdx >= 0) {
      name = cols[nameIdx]?.trim() || ''
    }

    const phone = phoneIdx >= 0 ? cols[phoneIdx]?.trim() || '' : ''
    const location = locationIdx >= 0 ? cols[locationIdx]?.trim() || 'san-jose' : 'san-jose'

    rows.push({ name, email, phone, location })
  }

  console.log(`Parsed ${rows.length} unique emails (${csvDupes} dupes in CSV). Importing...`)

  // Get all existing emails in one query
  const existingLeads = await prisma.lead.findMany({
    where: { email: { in: rows.map(r => r.email) } },
    select: { email: true, sid: true, name: true },
  })
  const existingMap = new Map(existingLeads.map(l => [l.email, l]))
  console.log(`${existingMap.size} already in database, ${rows.length - existingMap.size} to import.`)

  const results: { email: string; sid: string }[] = []

  // Add existing leads to results
  for (const lead of existingLeads) {
    results.push({ email: lead.email, sid: lead.sid })
  }

  // Batch insert new leads
  const newRows = rows.filter(r => !existingMap.has(r.email))
  const BATCH_SIZE = 100

  for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
    const batch = newRows.slice(i, i + BATCH_SIZE)
    const created = await prisma.lead.createManyAndReturn({
      data: batch.map(r => ({
        name: r.name,
        email: r.email,
        phone: r.phone,
        location: r.location,
        source: 'csv_import',
      })),
      select: { email: true, sid: true },
    })
    for (const lead of created) {
      results.push({ email: lead.email, sid: lead.sid })
    }
    console.log(`  ${Math.min(i + BATCH_SIZE, newRows.length)}/${newRows.length}...`)
  }

  console.log(`\nDone. Imported: ${newRows.length}, Already existed: ${existingMap.size}`)

  // Write GHL backfill CSV
  const outPath = csvPath.replace(/\.csv$/, '-with-sids.csv')
  const outHeader = 'email,sid'
  const outRows = results.map(r => `${r.email},${r.sid}`)
  writeFileSync(outPath, [outHeader, ...outRows].join('\n'))
  console.log(`GHL backfill CSV written to: ${outPath}`)

  await prisma.$disconnect()
}

main()
