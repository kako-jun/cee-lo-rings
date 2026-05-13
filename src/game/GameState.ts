import type { RuleType, GameStats } from './rule'

export type GameMode =
  | 'first'
  | 'ready'
  | 'rotate_3'
  | 'braking_3'
  | 'braked_3'
  | 'rotate_2'
  | 'braking_2'
  | 'braked_2'
  | 'rotate_1'
  | 'braking_1'
  | 'braked_1'
  | 'showing_mods'
  | 'showing_scores'
  | 'shown_scores'
  | 'shown_result'

/**
 * Serializable snapshot of game progress. Used by initWithState() so a
 * scene can be restored at an arbitrary point for debugging or replay.
 */
export interface GameState {
  rule: RuleType
  mode: GameMode
  elapsedTime: number
  betTimes: number
  totalScore: number
  speed: number
  iCombo: number
  iScore1000: number
  bulletTime: boolean
  revolution: boolean
  zoneSeconds: number
  rollbackStock: number
  reserveChangeBGM: boolean
  reserveStartZone: boolean
  reserveFinishZone: boolean
  rings: { ns: number[]; color: string }[]
  stats: GameStats
}

export function defaultState(rule: RuleType): GameState {
  return {
    rule,
    mode: 'first',
    elapsedTime: 0,
    betTimes: 0,
    totalScore: 0,
    speed: 4,
    iCombo: 0,
    iScore1000: 0,
    bulletTime: false,
    revolution: false,
    zoneSeconds: 0,
    rollbackStock: 0,
    reserveChangeBGM: false,
    reserveStartZone: false,
    reserveFinishZone: false,
    rings: [
      { ns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], color: 'white' },
      { ns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], color: 'white' },
      { ns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], color: 'white' },
    ],
    stats: {
      max_combo: 0,
      max_gain: 0,
      roll: {
        pinzoro: 0,
        arashikabu: 0,
        kemono: 0,
        triple_seven: 0,
        zorome: 0,
        shigoro: 0,
        hifumi: 0,
        pinbasami: 0,
        me: 0,
        pin: 0,
        nizou: 0,
        santa: 0,
        yotsuya: 0,
        goke: 0,
        roppou: 0,
        shichiken: 0,
        oicho: 0,
        kabu: 0,
        pink_ribbon: 0,
        buta: 0,
      },
      zone: { bullet_time: 0, revolution: 0 },
      triple_seven: {
        all_1: 0,
        all_6: 0,
        all_123: 0,
        all_456: 0,
        triplets: 0,
        others: 0,
        rollback: 0,
      },
      egg: { ambulance: 0 },
    },
  }
}

/** Parse a base64-encoded ?state= URL query, if present, into a GameState. */
export function parseStateFromUrl(): GameState | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('state')
    if (!raw) return null
    const json = atob(raw)
    return JSON.parse(json) as GameState
  } catch {
    return null
  }
}
