// Phina rule.js から TypeScript に再構築。判定式は Phina に厳密一致。
// pure 関数群。lodash 依存箇所は標準 JS で置換。

import {
  Roll,
  RollTableMulti,
  RollTableMe,
  RollTableKabu,
  Tuple,
} from './rolls'

export type Eyes = [number, number, number, number, number]
export type RuleId =
  | 'rule_1_2943'
  | 'rule_1_8390'
  | 'rule_1_37654'
  | 'rule_2_2943'
  | 'rule_2_8390'
  | 'rule_2_37654'
  | 'rule_3_0409'
  | 'rule_3_2009'
  | 'rule_3_6819'

export interface Score {
  id: string
  eye: string
  tuple: Tuple
  mod: number
  won: boolean
  roll: Roll | null
  gain?: number
  sum?: number
}

export type CurrentScores = [number, number, number, number]

export interface Stats {
  max_combo: number
  max_gain: number
  roll: Record<string, number>
  zone: { bullet_time: number; revolution: number }
  triple_seven: {
    all_1: number
    all_6: number
    all_123: number
    all_456: number
    triplets: number
    others: number
    rollback: number
  }
  egg: { ambulance: number }
}

export interface TripleSevenEffect {
  ring1_ns: number[]
  ring2_ns: number[]
  ring3_ns: number[]
  rollback_stock: number
  stats: Stats
}

const ALPHABETS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']

// reach 判定で使う 11 ライン × (eye1, eye2) のインデックス対応表
// Phina rule.js:14-67 の switch 文を表に置換 (挙動は同一)
const LINE_INDEX: Record<string, [number, number]> = {
  a: [0, 0],
  b: [1, 1],
  c: [2, 2],
  d: [3, 3],
  e: [4, 4],
  f: [2, 1],
  g: [3, 2],
  h: [4, 3],
  i: [0, 1],
  j: [1, 2],
  k: [2, 3],
}

const REACH_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [3, 3],
  [6, 6],
  [7, 7],
  [0, 0],
  [2, 2],
  [4, 4],
  [5, 5],
  [8, 8],
  [9, 9],
  [4, 5],
  [5, 4],
  [4, 6],
  [6, 4],
  [5, 6],
  [6, 5],
  [1, 2],
  [2, 1],
  [1, 3],
  [3, 1],
  [2, 3],
  [3, 2],
]

const isReachPair = (a: number, b: number): boolean => {
  for (const [x, y] of REACH_PAIRS) {
    if (x === a && y === b) return true
  }
  return false
}

const ZONE_REACH_PAIRS: ReadonlyArray<readonly [number, number, string]> = [
  [1, 1, '110'],
  [3, 5, '359'],
  [4, 2, '427'],
  [4, 8, '488'],
  [5, 0, '501'],
  [5, 6, '564'],
  [7, 1, '712'],
  [8, 9, '893'],
  [9, 3, '931'],
]

export const Rule = {
  shuffle: <T>(array: T[]): T[] => {
    let n = array.length
    while (n) {
      const i = Math.floor(Math.random() * n--)
      const t = array[n]
      array[n] = array[i]
      array[i] = t
    }
    return array
  },

  random: (min: number, max: number): number => {
    // Phina の _.random(0, 1) は 0 か 1 を返す inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  getReaches: (eyes1: Eyes, eyes2: Eyes): string[] => {
    const reaches: string[] = []
    for (const alphabet of ALPHABETS) {
      const [i1, i2] = LINE_INDEX[alphabet]
      const eye1 = eyes1[i1]
      const eye2 = eyes2[i2]
      if (isReachPair(eye1, eye2)) reaches.push(alphabet)
    }
    return reaches
  },

  getZoneReaches: (eyes1: Eyes, eyes2: Eyes): string[] => {
    const reaches: string[] = []
    for (const alphabet of ALPHABETS) {
      const [i1, i2] = LINE_INDEX[alphabet]
      const eye1 = eyes1[i1]
      const eye2 = eyes2[i2]
      for (const [a, b, name] of ZONE_REACH_PAIRS) {
        if (a === eye1 && b === eye2) {
          reaches.push(name)
          break
        }
      }
    }
    return reaches
  },

  calcTuples: (eyes1: Eyes, eyes2: Eyes, eyes3: Eyes): Tuple[] => {
    return [
      [eyes1[0], eyes2[0], eyes3[0]],
      [eyes1[1], eyes2[1], eyes3[1]],
      [eyes1[2], eyes2[2], eyes3[2]],
      [eyes1[3], eyes2[3], eyes3[3]],
      [eyes1[4], eyes2[4], eyes3[4]],
      [eyes1[2], eyes2[1], eyes3[0]],
      [eyes1[3], eyes2[2], eyes3[1]],
      [eyes1[4], eyes2[3], eyes3[2]],
      [eyes1[0], eyes2[1], eyes3[2]],
      [eyes1[1], eyes2[2], eyes3[3]],
      [eyes1[2], eyes2[3], eyes3[4]],
    ]
  },

  getZoneRolls: (tuples: Tuple[]): string[] => {
    const out: string[] = []
    for (const t of tuples) {
      const key = `${t[0]}${t[1]}${t[2]}`
      switch (key) {
        case '110':
        case '359':
        case '488':
        case '427':
        case '501':
        case '564':
        case '712':
        case '893':
        case '931':
          out.push(key)
          break
      }
    }
    return out
  },

  isAmbulance: (tuples: Tuple[]): boolean => {
    for (const t of tuples) {
      const k = `${t[0]}${t[1]}${t[2]}`
      if (k === '119' || k === '911' || k === '120' || k === '112') return true
    }
    return false
  },

  calcMods: (tuples: Tuple[]): number[] =>
    tuples.map(t => (t[0] + t[1] + t[2]) % 10),

  getStep: (score: Score): 'me' | 'kabu' | 'multi' => {
    const r = score.roll
    if (!r) return 'multi'
    if (r.name === 'pink_ribbon' || r.name === 'pinbasami' || r.name === 'me')
      return 'me'
    if (r.f === 'add') return 'kabu'
    return 'multi'
  },

  calcScores: (
    tuples: Tuple[],
    mods: number[],
    revolution: boolean
  ): Score[] => {
    const scores: Score[] = tuples.map((tuple, i) => ({
      id: ALPHABETS[i],
      eye: `${tuple[0]}${tuple[1]}${tuple[2]}`,
      tuple,
      mod: mods[i],
      won: false,
      roll: null,
    }))

    const tryTable = (table: Roll[]) => {
      tuples.forEach((tuple, i) => {
        const score = scores[i]
        const mod = mods[i]
        for (const roll of table) {
          if (score.won) break
          if (roll.judge(tuple, mod)) {
            score.won = true
            score.roll = roll
          }
        }
      })
    }

    tryTable(RollTableMulti)
    tryTable(RollTableMe)
    tryTable(RollTableKabu)

    let sum = 0

    // me ステップ
    for (const score of scores) {
      if (score.won && Rule.getStep(score) === 'me') {
        const gain = score.roll!.calcGain(sum, score.tuple, score.mod)
        sum += gain
        score.gain = gain
        score.sum = sum
      }
    }
    // kabu ステップ
    for (const score of scores) {
      if (score.won && Rule.getStep(score) === 'kabu') {
        const gain = score.roll!.calcGain(sum, score.tuple, score.mod)
        sum += gain
        score.gain = gain
        score.sum = sum
      }
    }

    if (sum === 0) sum = 1

    // multi ステップ (clamp ±9999, revolution は符号反転)
    for (const score of scores) {
      if (score.won && Rule.getStep(score) === 'multi') {
        let gain = score.roll!.calcGain(sum, score.tuple, score.mod)
        if (gain > 9999) gain = 9999
        else if (gain < -9999) gain = -9999
        if (revolution) gain *= -1
        sum = gain
        score.gain = gain
        score.sum = sum
      }
    }

    return scores
  },

  calcCurrentScores: (scores: Score[]): CurrentScores => {
    const wonOf = (step: 'me' | 'kabu' | 'multi') =>
      scores.filter(s => s.won && Rule.getStep(s) === step)

    const me_scores = wonOf('me')
    let me_sum = 0
    if (me_scores.length > 0) {
      me_sum = me_scores.reduce(
        (acc, s) => Math.max(acc, s.sum ?? 0),
        -Infinity
      )
    }

    const kabu_scores = wonOf('kabu')
    let kabu_sum = me_sum
    if (kabu_scores.length > 0) {
      kabu_sum = kabu_scores.reduce(
        (acc, s) => Math.max(acc, s.sum ?? 0),
        -Infinity
      )
    }

    const multi_scores = wonOf('multi')
    let multi_sum = kabu_sum
    if (multi_scores.length > 0) {
      multi_sum = multi_scores[multi_scores.length - 1].sum ?? kabu_sum
    }

    return [me_sum, kabu_sum, multi_sum, 0]
  },

  addComboScore: (
    current_scores: CurrentScores,
    i_combo: number
  ): CurrentScores => {
    let combo_sum = current_scores[2]
    if (i_combo >= 2) {
      combo_sum *= i_combo > 10 ? 10 : i_combo
      if (combo_sum > 9999) combo_sum = 9999
      else if (combo_sum < -9999) combo_sum = -9999
    }
    return [current_scores[0], current_scores[1], current_scores[2], combo_sum]
  },

  calcTotalScore: (
    total_score: number,
    current_scores: CurrentScores
  ): number => total_score + current_scores[3],

  isMultiWon: (scores: Score[]): boolean =>
    scores.some(s => s.won && s.roll?.f === 'multi'),

  isPinkRibbon: (scores: Score[]): boolean =>
    scores.some(s => s.roll?.name === 'pink_ribbon'),

  isTripleSeven: (scores: Score[]): boolean =>
    scores.some(s => s.roll?.name === 'triple_seven'),

  getTripleSevenEffect: (
    rollback_stock: number,
    stats: Stats
  ): TripleSevenEffect => {
    let ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    let ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    let ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    const r = Rule.random(0, 99)
    let nextStock = rollback_stock
    if (r < 5) {
      ring1_ns = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ring2_ns = ring1_ns.slice()
      ring3_ns = ring1_ns.slice()
      stats.triple_seven.all_1++
    } else if (r < 10) {
      ring1_ns = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
      ring2_ns = ring1_ns.slice()
      ring3_ns = ring1_ns.slice()
      stats.triple_seven.all_6++
    } else if (r < 15) {
      ring1_ns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      ring2_ns = ring1_ns.slice()
      ring3_ns = ring1_ns.slice()
      stats.triple_seven.triplets++
    } else if (r < 20) {
      ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      ring2_ns = ring1_ns.slice()
      ring3_ns = ring1_ns.slice()
      stats.triple_seven.triplets++
    } else if (r < 30) {
      const partial = (): number[] => [
        ...Rule.shuffle([0, 1, 2, 3, 4, 5, 6]),
        7,
        8,
        9,
      ]
      ring1_ns = partial()
      ring2_ns = partial()
      ring3_ns = partial()
      stats.triple_seven.others++
    } else if (r < 40) {
      ring1_ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
      ring2_ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
      ring3_ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
      stats.triple_seven.all_123++
    } else if (r < 50) {
      ring1_ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6])
      ring2_ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6])
      ring3_ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6])
      stats.triple_seven.all_456++
    } else {
      nextStock++
      if (nextStock > 3) nextStock = 1
    }

    return { ring1_ns, ring2_ns, ring3_ns, rollback_stock: nextStock, stats }
  },

  getNextSpeed: (speed: number, current_score: number): number => {
    let next = speed
    if (current_score < 0) {
      if (speed < 2) {
        // no change
      } else if (speed < 4) next -= 1
      else if (speed < 6) next -= 2
      else if (speed < 8) next -= 3
      else if (speed < 10) next -= 4
      else next -= 5
    } else if (current_score < 50) {
      if (speed < 2) next += 1
      else if (speed < 4) {
        // no change
      } else if (speed < 6) next -= 1
      else if (speed < 8) next -= 2
      else if (speed < 10) next -= 3
      else next -= 4
    } else if (current_score < 100) {
      if (speed < 2) next += 1
      else if (speed < 4) next += 1
      else if (speed < 6) {
        // no change
      } else if (speed < 8) next -= 1
      else if (speed < 10) next -= 2
      else next -= 3
    } else {
      if (speed < 2) next += 1
      else if (speed < 4) next += 1
      else if (speed < 6) next += 1
      else if (speed < 8) next += 1
      else if (speed < 10) next += 1
      // else: no change
    }
    return next
  },

  getTime: (rule: RuleId, i_second_1: number): number => {
    let left = 0
    switch (rule) {
      case 'rule_1_2943':
      case 'rule_1_8390':
      case 'rule_1_37654':
      case 'rule_2_2943':
      case 'rule_2_8390':
      case 'rule_2_37654':
        left = i_second_1
        return left < 0 ? 0 : left
      case 'rule_3_0409':
        left = 60 * 4 + 9 - i_second_1
        return left < 0 ? 0 : left
      case 'rule_3_2009':
        left = 60 * 20 + 9 - i_second_1
        return left < 0 ? 0 : left
      case 'rule_3_6819':
        left = 60 * 68 + 19 - i_second_1
        return left < 0 ? 0 : left
    }
  },

  isAchieved: (
    rule: RuleId,
    elapsed_time: number,
    total_score: number
  ): boolean => {
    switch (rule) {
      case 'rule_1_2943':
      case 'rule_2_2943':
        return total_score >= 2943
      case 'rule_1_8390':
      case 'rule_2_8390':
        return total_score >= 8390
      case 'rule_1_37654':
      case 'rule_2_37654':
        return total_score >= 37654
      case 'rule_3_0409':
        return elapsed_time >= (60 * 4 + 9) * 1000
      case 'rule_3_2009':
        return elapsed_time >= (60 * 20 + 9) * 1000
      case 'rule_3_6819':
        return elapsed_time >= (60 * 68 + 19) * 1000
    }
  },
}

export const newStats = (): Stats => ({
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
})
