import { RuleId } from './rule'

const STORAGE_KEY = 'cee-lo-rings-highscore'

export type HighScoreMap = Partial<Record<RuleId, number>>

export const loadHighScore = (): HighScoreMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as HighScoreMap
  } catch {
    return {}
  }
}

export const saveHighScore = (map: HighScoreMap): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore quota / privacy mode
  }
}
