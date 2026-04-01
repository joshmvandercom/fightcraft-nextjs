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

export interface ScheduleClass {
  time: string
  name: string
}

export interface ScheduleDay {
  day: string
  classes: ScheduleClass[]
}

export function getSchedule(locationSlug: string): ScheduleDay[] {
  const data = load('schedules.yml').schedules
  return data[locationSlug] || []
}
