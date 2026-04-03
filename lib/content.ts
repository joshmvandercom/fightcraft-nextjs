import { parse } from 'yaml'
import { readFileSync } from 'fs'
import path from 'path'

function load(file: string) {
  return parse(readFileSync(path.join(process.cwd(), 'content', file), 'utf-8'))
}

export interface Location {
  slug: string
  name: string
  label: string | null
  status: 'open' | 'coming_soon'
  address: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
  phone: string | null
  email: string
  instagram: string | null
  contact_email: string
  owner: string
  programs: string[]
}

export interface Program {
  slug: string
  name: string
  image: string
  short_description: string
  location: string
  header_title: string
  header_subtitle: string
  primary_title: string
  primary_text_1: string
  primary_text_2: string
  hero_video?: string
  callout_title: string
  callout_text: string
  callout_image?: string
  callout_video?: string
  bullets: string[]
  seo_text?: string
  seo_closing?: string
}

export interface CoreValue {
  title: string
  body: string
  quote: string
  author: string
}

export interface Testimonial {
  name: string
  stars: number
  body: string
}

export interface FAQ {
  question: string
  answer: string
}

export function getLocations(): Location[] {
  return load('locations.yml').locations
}

export function getPrograms(): Program[] {
  return load('programs.yml').programs
}

export function getCoreValues(): CoreValue[] {
  return load('core_values.yml').core_values
}

export function getTestimonials(): Testimonial[] {
  return load('testimonials.yml').testimonials
}

export function getFaqs(): FAQ[] {
  return load('faqs.yml').faqs
}

export interface OfferConfig {
  headline_template: string
  subtitle: string
  coach_intro: string
  body_line_1: string
  body_line_2: string
  cta_title: string
  cta_subtitle: string
  button_text: string
  button_sub: string
  footer_note: string
  quiz_skip_program: boolean
  quiz_preset_experience: string | null
}

export interface ProgramConfig {
  display_name: string
  image: string
  slug_value: string
}

export function getOffer(offerSlug: string): OfferConfig | null {
  const data = load('offers.yml')
  return data.offers?.[offerSlug] || null
}

export function getProgramConfig(programSlug: string): ProgramConfig | null {
  const data = load('offers.yml')
  return data.programs?.[programSlug] || null
}

export function getOfferSlugs(): string[] {
  const data = load('offers.yml')
  return Object.keys(data.offers || {})
}

export function getProgramSlugs(): string[] {
  const data = load('offers.yml')
  return Object.keys(data.programs || {})
}

export interface ScheduleClass {
  time: string
  name: string
  bookable?: boolean
}

export interface ScheduleDay {
  day: string
  classes: ScheduleClass[]
}

export function getSchedule(locationSlug: string): ScheduleDay[] {
  const data = load('schedules.yml').schedules
  return data[locationSlug] || []
}
