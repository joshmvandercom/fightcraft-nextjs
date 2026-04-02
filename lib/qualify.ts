// Quiz answer keys:
// m = motivation (A-D)
// e = experience (A-D)
// c = commitment (A-D)
// o = objection (A-E)
// v = vision (A-D)
// r = readiness (A-D)

export function isQualified(answers: { c: string; o: string; r: string }): boolean {
  let flags = 0

  // Readiness: travel or still exploring
  if (answers.r === 'C' || answers.r === 'D') flags++

  // Commitment: not sure
  if (answers.c === 'D') flags++

  // Objection: cost
  if (answers.o === 'D') flags++

  // Qualified if 0 flags, or only 1 minor flag
  // Not qualified if 2+ flags, or if readiness is D (exploring) regardless
  if (answers.r === 'D') return false
  if (flags >= 2) return false

  return true
}
