// Game rules for Tin! Tilo! Rings!
import { Roll, RollTableMulti, RollTableMe, RollTableKabu } from './rolls'

export type RuleType =
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
  tuple: number[]
  mod: number
  won: boolean
  roll: Roll | string
  gain?: number
  sum?: number
}

export interface GameStats {
  max_combo: number
  max_gain: number
  roll: Record<string, number>
  zone: Record<string, number>
  triple_seven: Record<string, number>
  egg: Record<string, number>
}

export interface TripleSevenEffect {
  ring1_ns: number[]
  ring2_ns: number[]
  ring3_ns: number[]
  rollback_stock: number
  stats: GameStats
}

export const Rule = {
  shuffle: (array: number[]): number[] => {
    const arr = [...array]
    let n = arr.length
    while (n) {
      const i = Math.floor(Math.random() * n--)
      const t = arr[n]
      arr[n] = arr[i]
      arr[i] = t
    }
    return arr
  },

  getReaches: (eyes1: number[], eyes2: number[]): string[] => {
    const reaches: string[] = []

    for (let i = 0; i < 11; i++) {
      const alphabet = String.fromCharCode(97 + i)
      let eye1 = 0
      let eye2 = 0

      switch (alphabet) {
        case 'a':
          eye1 = eyes1[0]
          eye2 = eyes2[0]
          break
        case 'b':
          eye1 = eyes1[1]
          eye2 = eyes2[1]
          break
        case 'c':
          eye1 = eyes1[2]
          eye2 = eyes2[2]
          break
        case 'd':
          eye1 = eyes1[3]
          eye2 = eyes2[3]
          break
        case 'e':
          eye1 = eyes1[4]
          eye2 = eyes2[4]
          break
        case 'f':
          eye1 = eyes1[2]
          eye2 = eyes2[1]
          break
        case 'g':
          eye1 = eyes1[3]
          eye2 = eyes2[2]
          break
        case 'h':
          eye1 = eyes1[4]
          eye2 = eyes2[3]
          break
        case 'i':
          eye1 = eyes1[0]
          eye2 = eyes2[1]
          break
        case 'j':
          eye1 = eyes1[1]
          eye2 = eyes2[2]
          break
        case 'k':
          eye1 = eyes1[2]
          eye2 = eyes2[3]
          break
      }

      const reachPairs = [
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

      if (reachPairs.some(pair => eye1 === pair[0] && eye2 === pair[1])) {
        reaches.push(alphabet)
      }
    }

    return reaches
  },

  getZoneReaches: (eyes1: number[], eyes2: number[]): string[] => {
    const reaches: string[] = []

    for (let i = 0; i < 11; i++) {
      const alphabet = String.fromCharCode(97 + i)
      let eye1 = 0
      let eye2 = 0

      switch (alphabet) {
        case 'a':
          eye1 = eyes1[0]
          eye2 = eyes2[0]
          break
        case 'b':
          eye1 = eyes1[1]
          eye2 = eyes2[1]
          break
        case 'c':
          eye1 = eyes1[2]
          eye2 = eyes2[2]
          break
        case 'd':
          eye1 = eyes1[3]
          eye2 = eyes2[3]
          break
        case 'e':
          eye1 = eyes1[4]
          eye2 = eyes2[4]
          break
        case 'f':
          eye1 = eyes1[2]
          eye2 = eyes2[1]
          break
        case 'g':
          eye1 = eyes1[3]
          eye2 = eyes2[2]
          break
        case 'h':
          eye1 = eyes1[4]
          eye2 = eyes2[3]
          break
        case 'i':
          eye1 = eyes1[0]
          eye2 = eyes2[1]
          break
        case 'j':
          eye1 = eyes1[1]
          eye2 = eyes2[2]
          break
        case 'k':
          eye1 = eyes1[2]
          eye2 = eyes2[3]
          break
      }

      if (eye1 === 1 && eye2 === 1) {
        reaches.push('110')
      } else if (eye1 === 3 && eye2 === 5) {
        reaches.push('359')
      } else if (eye1 === 4 && eye2 === 2) {
        reaches.push('427')
      } else if (eye1 === 4 && eye2 === 8) {
        reaches.push('488')
      } else if (eye1 === 5 && eye2 === 0) {
        reaches.push('501')
      } else if (eye1 === 5 && eye2 === 6) {
        reaches.push('564')
      } else if (eye1 === 7 && eye2 === 1) {
        reaches.push('712')
      } else if (eye1 === 8 && eye2 === 9) {
        reaches.push('893')
      } else if (eye1 === 9 && eye2 === 3) {
        reaches.push('931')
      }
    }

    return reaches
  },

  calcTuples: (
    eyes1: number[],
    eyes2: number[],
    eyes3: number[]
  ): number[][] => {
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

  getZoneRolls: (tuples: number[][]): string[] => {
    const rolls: string[] = []

    tuples.forEach(tuple => {
      if (tuple[0] === 1 && tuple[1] === 1 && tuple[2] === 0) {
        rolls.push('110')
      } else if (tuple[0] === 3 && tuple[1] === 5 && tuple[2] === 9) {
        rolls.push('359')
      } else if (tuple[0] === 4 && tuple[1] === 8 && tuple[2] === 8) {
        rolls.push('488')
      } else if (tuple[0] === 4 && tuple[1] === 2 && tuple[2] === 7) {
        rolls.push('427')
      } else if (tuple[0] === 5 && tuple[1] === 0 && tuple[2] === 1) {
        rolls.push('501')
      } else if (tuple[0] === 5 && tuple[1] === 6 && tuple[2] === 4) {
        rolls.push('564')
      } else if (tuple[0] === 7 && tuple[1] === 1 && tuple[2] === 2) {
        rolls.push('712')
      } else if (tuple[0] === 8 && tuple[1] === 9 && tuple[2] === 3) {
        rolls.push('893')
      } else if (tuple[0] === 9 && tuple[1] === 3 && tuple[2] === 1) {
        rolls.push('931')
      }
    })

    return rolls
  },

  isAmbulance: (tuples: number[][]): boolean => {
    return tuples.some(tuple => {
      const eye = `${tuple[0]}${tuple[1]}${tuple[2]}`
      return eye === '119' || eye === '911' || eye === '120' || eye === '112'
    })
  },

  calcMods: (tuples: number[][]): number[] => {
    return tuples.map(tuple => (tuple[0] + tuple[1] + tuple[2]) % 10)
  },

  calcScores: (
    tuples: number[][],
    mods: number[],
    revolution: boolean
  ): Score[] => {
    const scores: Score[] = []

    for (let i = 0; i < 11; i++) {
      scores.push({
        id: String.fromCharCode(97 + i),
        eye: `${tuples[i][0]}${tuples[i][1]}${tuples[i][2]}`,
        tuple: tuples[i],
        mod: mods[i],
        won: false,
        roll: '',
      })
    }

    // Multi rolls
    tuples.forEach((tuple, i) => {
      const score = scores[i]
      const mod = mods[i]

      RollTableMulti.forEach(roll => {
        if (!score.won) {
          if (roll.judge(tuple, mod)) {
            score.won = true
            score.roll = roll
          }
        }
      })
    })

    // Me rolls
    tuples.forEach((tuple, i) => {
      const score = scores[i]
      const mod = mods[i]

      RollTableMe.forEach(roll => {
        if (!score.won) {
          if (roll.judge(tuple, mod)) {
            score.won = true
            score.roll = roll
          }
        }
      })
    })

    // Kabu rolls
    tuples.forEach((tuple, i) => {
      const score = scores[i]
      const mod = mods[i]

      RollTableKabu.forEach(roll => {
        if (!score.won) {
          if (roll.judge(tuple, mod)) {
            score.won = true
            score.roll = roll
          }
        }
      })
    })

    // Calculate gains
    let sum = 0

    // Me step
    scores.forEach(score => {
      if (score.won && typeof score.roll !== 'string') {
        if (Rule.getStep(score) === 'me') {
          const gain = score.roll.calcGain(sum, score.tuple, score.mod)
          sum += gain
          score.gain = gain
          score.sum = sum
        }
      }
    })

    // Kabu step
    scores.forEach(score => {
      if (score.won && typeof score.roll !== 'string') {
        if (Rule.getStep(score) === 'kabu') {
          const gain = score.roll.calcGain(sum, score.tuple, score.mod)
          sum += gain
          score.gain = gain
          score.sum = sum
        }
      }
    })

    if (sum === 0) {
      sum = 1
    }

    // Multi step
    scores.forEach(score => {
      if (score.won && typeof score.roll !== 'string') {
        if (Rule.getStep(score) === 'multi') {
          let gain = score.roll.calcGain(sum, score.tuple, score.mod)

          if (gain > 9999) {
            gain = 9999
          } else if (gain < -9999) {
            gain = -9999
          }

          if (revolution) {
            gain *= -1
          }

          sum = gain
          score.gain = gain
          score.sum = sum
        }
      }
    })

    return scores
  },

  calcCurrentScores: (scores: Score[]): number[] => {
    const meScores = scores.filter(score => {
      if (score.won && typeof score.roll !== 'string') {
        return Rule.getStep(score) === 'me'
      }
      return false
    })

    let meSum = 0
    if (meScores.length > 0) {
      meSum = Math.max(...meScores.map(score => score.sum || 0))
    }

    const kabuScores = scores.filter(score => {
      if (score.won && typeof score.roll !== 'string') {
        return Rule.getStep(score) === 'kabu'
      }
      return false
    })

    let kabuSum = meSum
    if (kabuScores.length > 0) {
      kabuSum = Math.max(...kabuScores.map(score => score.sum || 0))
    }

    const multiScores = scores.filter(score => {
      if (score.won && typeof score.roll !== 'string') {
        return Rule.getStep(score) === 'multi'
      }
      return false
    })

    let multiSum = kabuSum
    if (multiScores.length > 0) {
      multiSum = multiScores[multiScores.length - 1].sum || 0
    }

    return [meSum, kabuSum, multiSum, 0]
  },

  addComboScore: (currentScores: number[], iCombo: number): number[] => {
    let comboSum = currentScores[2]
    if (iCombo >= 2) {
      if (iCombo > 10) {
        comboSum *= 10
      } else {
        comboSum *= iCombo
      }

      if (comboSum > 9999) {
        comboSum = 9999
      } else if (comboSum < -9999) {
        comboSum = -9999
      }
    }

    return [currentScores[0], currentScores[1], currentScores[2], comboSum]
  },

  calcTotalScore: (totalScore: number, currentScores: number[]): number => {
    return totalScore + currentScores[3]
  },

  isMultiWon: (scores: Score[]): boolean => {
    return scores.some(score => {
      if (score.won && typeof score.roll !== 'string') {
        return score.roll.f === 'multi'
      }
      return false
    })
  },

  isTripleSeven: (scores: Score[]): boolean => {
    return scores.some(score => {
      if (typeof score.roll !== 'string') {
        return score.roll.name === 'triple_seven'
      }
      return false
    })
  },

  getTripleSevenEffect: (
    rollbackStock: number,
    stats: GameStats
  ): TripleSevenEffect => {
    let ring1Ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    let ring2Ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    let ring3Ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    const r = Math.floor(Math.random() * 100)

    if (r < 5) {
      // 5%
      ring1Ns = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ring2Ns = ring1Ns
      ring3Ns = ring1Ns
      stats.triple_seven.all_1++
    } else if (r < 10) {
      // 5%
      ring1Ns = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
      ring2Ns = ring1Ns
      ring3Ns = ring1Ns
      stats.triple_seven.all_6++
    } else if (r < 15) {
      // 5%
      ring1Ns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      ring2Ns = ring1Ns
      ring3Ns = ring1Ns
      stats.triple_seven.triplets++
    } else if (r < 20) {
      // 5%
      ring1Ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      ring2Ns = ring1Ns
      ring3Ns = ring1Ns
      stats.triple_seven.triplets++
    } else if (r < 30) {
      // 10%
      ring1Ns = [...Rule.shuffle([0, 1, 2, 3, 4, 5, 6]), 7, 8, 9]
      ring2Ns = [...Rule.shuffle([0, 1, 2, 3, 4, 5, 6]), 7, 8, 9]
      ring3Ns = [...Rule.shuffle([0, 1, 2, 3, 4, 5, 6]), 7, 8, 9]
      stats.triple_seven.others++
    } else if (r < 40) {
      // 10%
      ring1Ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
      ring2Ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
      ring3Ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
      stats.triple_seven.all_123++
    } else if (r < 50) {
      // 10%
      ring1Ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6])
      ring2Ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6])
      ring3Ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6])
      stats.triple_seven.all_456++
    } else {
      // 50%
      rollbackStock++
      if (rollbackStock > 3) {
        rollbackStock = 1
      }
    }

    return {
      ring1_ns: ring1Ns,
      ring2_ns: ring2Ns,
      ring3_ns: ring3Ns,
      rollback_stock: rollbackStock,
      stats: stats,
    }
  },

  isPinkRibbon: (scores: Score[]): boolean => {
    return scores.some(score => {
      if (typeof score.roll !== 'string') {
        return score.roll.name === 'pink_ribbon'
      }
      return false
    })
  },

  getStep: (score: Score): 'me' | 'kabu' | 'multi' => {
    if (typeof score.roll === 'string') {
      return 'kabu'
    }

    if (
      score.roll.name === 'pink_ribbon' ||
      score.roll.name === 'pinbasami' ||
      score.roll.name === 'me'
    ) {
      return 'me'
    } else if (score.roll.f === 'add') {
      return 'kabu'
    } else {
      return 'multi'
    }
  },

  getNextSpeed: (speed: number, currentScore: number): number => {
    let nextSpeed = speed

    if (currentScore < 0) {
      // -∞ - -1
      if (speed < 2) {
        // no change
      } else if (speed >= 2 && speed < 4) {
        nextSpeed--
      } else if (speed >= 4 && speed < 6) {
        nextSpeed -= 2
      } else if (speed >= 6 && speed < 8) {
        nextSpeed -= 3
      } else if (speed >= 8 && speed < 10) {
        nextSpeed -= 4
      } else if (speed >= 10) {
        nextSpeed -= 5
      }
    } else if (currentScore < 50) {
      // 0 - 49
      if (speed < 2) {
        nextSpeed++
      } else if (speed >= 2 && speed < 4) {
        // no change
      } else if (speed >= 4 && speed < 6) {
        nextSpeed--
      } else if (speed >= 6 && speed < 8) {
        nextSpeed -= 2
      } else if (speed >= 8 && speed < 10) {
        nextSpeed -= 3
      } else if (speed >= 10) {
        nextSpeed -= 4
      }
    } else if (currentScore < 100) {
      // 50 - 99
      if (speed < 2) {
        nextSpeed++
      } else if (speed >= 2 && speed < 4) {
        nextSpeed++
      } else if (speed >= 4 && speed < 6) {
        // no change
      } else if (speed >= 6 && speed < 8) {
        nextSpeed--
      } else if (speed >= 8 && speed < 10) {
        nextSpeed -= 2
      } else if (speed >= 10) {
        nextSpeed -= 3
      }
    } else if (currentScore >= 100) {
      // 100 - ∞
      if (speed < 2) {
        nextSpeed++
      } else if (speed >= 2 && speed < 4) {
        nextSpeed++
      } else if (speed >= 4 && speed < 6) {
        nextSpeed++
      } else if (speed >= 6 && speed < 8) {
        nextSpeed++
      } else if (speed >= 8 && speed < 10) {
        nextSpeed++
      } else if (speed >= 10) {
        // no change
      }
    }

    return nextSpeed
  },

  getTime: (rule: RuleType, iSecond1: number): number => {
    let left = 0

    switch (rule) {
      case 'rule_1_2943':
      case 'rule_1_8390':
      case 'rule_1_37654':
      case 'rule_2_2943':
      case 'rule_2_8390':
      case 'rule_2_37654':
        left = iSecond1
        if (left < 0) {
          left = 0
        }
        return left
      case 'rule_3_0409':
        left = 60 * 4 + 9 - iSecond1
        if (left < 0) {
          left = 0
        }
        return left
      case 'rule_3_2009':
        left = 60 * 20 + 9 - iSecond1
        if (left < 0) {
          left = 0
        }
        return left
      case 'rule_3_6819':
        left = 60 * 68 + 19 - iSecond1
        if (left < 0) {
          left = 0
        }
        return left
    }

    return 0
  },

  isAchieved: (
    rule: RuleType,
    elapsedTime: number,
    totalScore: number
  ): boolean => {
    switch (rule) {
      case 'rule_1_2943':
      case 'rule_2_2943':
        if (totalScore >= 2943) {
          return true
        }
        break
      case 'rule_1_8390':
      case 'rule_2_8390':
        if (totalScore >= 8390) {
          return true
        }
        break
      case 'rule_1_37654':
      case 'rule_2_37654':
        if (totalScore >= 37654) {
          return true
        }
        break
      case 'rule_3_0409':
        if (elapsedTime >= (60 * 4 + 9) * 1000) {
          return true
        }
        break
      case 'rule_3_2009':
        if (elapsedTime >= (60 * 20 + 9) * 1000) {
          return true
        }
        break
      case 'rule_3_6819':
        if (elapsedTime >= (60 * 68 + 19) * 1000) {
          return true
        }
        break
    }

    return false
  },
}
