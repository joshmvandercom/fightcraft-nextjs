import { parse } from 'yaml'
import { readFileSync, readdirSync } from 'fs'
import path from 'path'

export interface IdealCandidate {
  required?: string[]
  helpful?: string[]
}

export interface CareerPosting {
  slug: string
  title: string
  location?: string
  employment_type?: string
  compensation_summary?: string
  posted_date?: string
  apply_email?: string
  apply_link?: string
  intro?: string
  about_the_opportunity?: string
  what_youll_do?: string
  what_youll_earn?: string
  the_lifestyle?: string
  what_we_expect?: string
  what_you_can_expect?: string
  ideal_candidate?: IdealCandidate
  not_a_fit_if?: string[]
  hiring_process?: string
}

const CAREERS_DIR = path.join(process.cwd(), 'content', 'careers')

function readPosting(filename: string): CareerPosting {
  const raw = readFileSync(path.join(CAREERS_DIR, filename), 'utf-8')
  const parsed = parse(raw) as CareerPosting
  if (!parsed.slug) parsed.slug = filename.replace(/\.ya?ml$/, '')
  return parsed
}

export function getAllCareers(): CareerPosting[] {
  let files: string[] = []
  try {
    files = readdirSync(CAREERS_DIR).filter(f => /\.ya?ml$/.test(f))
  } catch {
    return []
  }
  return files
    .map(readPosting)
    .sort((a, b) => (b.posted_date ?? '').localeCompare(a.posted_date ?? ''))
}

export function getCareer(slug: string): CareerPosting | null {
  return getAllCareers().find(c => c.slug === slug) ?? null
}

export function getCareerSlugs(): string[] {
  return getAllCareers().map(c => c.slug)
}
