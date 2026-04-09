// Quiz answer keys:
// p = program interest (dynamic per location)
// e = experience (A-D)
// c = commitment (A-D)
// o = objection (A-D)
// v = vision (A-D)
// r = readiness (A-D)

// Location-specific: programs that require orientation for beginners
// Currently disabled - all beginners book directly
const BEGINNER_ORIENTATION_REQUIRED: Record<string, string[]> = {}

export function isQualified(answers: { p: string; e: string; c: string; o: string; r: string }, location?: string): boolean {
  // Check if this specific program at this location requires beginner orientation
  if (answers.e === 'A' && location) {
    const programs = BEGINNER_ORIENTATION_REQUIRED[location] || []
    if (programs.includes(answers.p)) return false
  }

  // "Not sure" on program always goes to orientation
  if (answers.p === 'explore') return false

  // Still exploring readiness always goes to call
  if (answers.r === 'D') return false

  // Upcoming travel — never book into a class, route to call
  if (answers.r === 'C') return false

  // Count flags for remaining answers
  let flags = 0
  if (answers.c === 'D') flags++ // unsure on commitment
  if (answers.o === 'D') flags++ // cost concern

  if (flags >= 2) return false

  return true
}
