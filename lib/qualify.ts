// Quiz answer keys:
// p = program interest (dynamic per location)
// e = experience (A-D)
// c = commitment (A-D)
// o = objection (A-E)
// v = vision (A-D)
// r = readiness (A-D)

export function isQualified(answers: { p: string; e: string; c: string; o: string; r: string }): boolean {
  // All beginners go to orientation call regardless of program
  if (answers.e === 'A') return false

  // "Not sure" on program → orientation call
  if (answers.p === 'explore') return false

  // Still exploring readiness → always a call
  if (answers.r === 'D') return false

  // Count flags for remaining answers
  let flags = 0
  if (answers.r === 'C') flags++ // travel
  if (answers.c === 'D') flags++ // unsure on commitment
  if (answers.o === 'D') flags++ // cost concern

  if (flags >= 2) return false

  return true
}
