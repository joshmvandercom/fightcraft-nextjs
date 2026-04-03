// Stable keys for GHL automations. These NEVER change even if quiz copy changes.
export const STABLE_KEYS: Record<string, Record<string, string>> = {
  experience: {
    A: 'beginner',
    B: 'dabbled',
    C: 'some_experience',
    D: 'active',
  },
  commitment: {
    A: 'committed_2_3x',
    B: 'willing_to_adjust',
    C: 'starting_slow',
    D: 'unsure',
  },
  objection: {
    A: 'time',
    B: 'intimidation',
    C: 'fitness_first',
    D: 'cost',
    E: 'none',
  },
  vision: {
    A: 'confidence',
    B: 'community',
    C: 'competition',
    D: 'health',
  },
  readiness: {
    A: 'ready_now',
    B: 'couple_weeks',
    C: 'after_travel',
    D: 'exploring',
  },
}

// Human-readable labels for Slack notifications only
export const DISPLAY_LABELS: Record<string, Record<string, string>> = {
  experience: {
    A: 'Complete beginner',
    B: 'Tried it once or twice',
    C: 'Some experience',
    D: 'Active practitioner',
  },
  commitment: {
    A: '2-3 sessions per week',
    B: 'Willing to adjust schedule',
    C: '1-2 times to start',
    D: 'Not sure yet',
  },
  objection: {
    A: 'Time',
    B: 'Intimidation',
    C: 'Physical readiness',
    D: 'Cost',
    E: 'Nothing - ready to go',
  },
  vision: {
    A: 'Confidence',
    B: 'Community',
    C: 'Competition',
    D: 'Health & fitness',
  },
  readiness: {
    A: 'Ready now',
    B: 'Within a couple weeks',
    C: 'After travel',
    D: 'Still exploring',
  },
}

// Step index to key name mapping
export const STEP_KEYS = ['program', 'experience', 'commitment', 'objection', 'vision', 'readiness']

// Resolve a raw answer letter to its stable key
export function resolveAnswer(stepIndex: number, letter: string): string {
  const stepName = STEP_KEYS[stepIndex]
  if (stepName === 'program') return letter // program is already a slug value
  return STABLE_KEYS[stepName]?.[letter] || letter
}
