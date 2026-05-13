import type { RuleType } from './rule'

const KEY = 'cee-lo-rings-high-scores'

export type HighScores = Record<RuleType, number | null>

const RULE_IDS: RuleType[] = [
  'rule_1_2943',
  'rule_1_8390',
  'rule_1_37654',
  'rule_2_2943',
  'rule_2_8390',
  'rule_2_37654',
  'rule_3_0409',
  'rule_3_2009',
  'rule_3_6819',
]

function empty(): HighScores {
  return RULE_IDS.reduce((acc, id) => {
    acc[id] = null
    return acc
  }, {} as HighScores)
}

export function load(): HighScores {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...empty(), ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return empty()
}

export function save(scores: HighScores): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(scores))
  } catch {
    /* ignore */
  }
}
