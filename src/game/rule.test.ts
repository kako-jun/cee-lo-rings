// rule.ts / rolls.ts の数値計算ロジック回帰テスト。
// Phina 仕様 (rule.js / rolls.js) と一致していることを保証する。

import { describe, expect, it } from 'vitest'
import { Rule, Eyes, newStats, type CurrentScores } from './rule'
import { RollTableMulti, RollTableMe, RollTableKabu } from './rolls'

describe('役テーブル', () => {
  it('Multi/Me/Kabu の役数が Phina と一致する', () => {
    expect(RollTableMulti.map(r => r.name)).toEqual([
      'pinzoro',
      'arashikabu',
      'kemono',
      'triple_seven',
      'zorome',
      'shigoro',
      'hifumi',
    ])
    expect(RollTableMe.map(r => r.name)).toEqual([
      'pink_ribbon',
      'pinbasami',
      'me',
    ])
    expect(RollTableKabu.map(r => r.name)).toEqual([
      'pin',
      'nizou',
      'santa',
      'yotsuya',
      'goke',
      'roppou',
      'shichiken',
      'oicho',
      'kabu',
    ])
  })

  it('pinzoro [1,1,1] は 5 倍', () => {
    const pinzoro = RollTableMulti.find(r => r.name === 'pinzoro')!
    expect(pinzoro.judge([1, 1, 1], 3)).toBe(true)
    expect(pinzoro.calcGain(100, [1, 1, 1], 3)).toBe(500)
  })

  it('shigoro はソート後に [4,5,6] になれば成立する', () => {
    const shigoro = RollTableMulti.find(r => r.name === 'shigoro')!
    expect(shigoro.judge([6, 4, 5], 5)).toBe(true)
    expect(shigoro.judge([5, 6, 4], 5)).toBe(true)
    expect(shigoro.judge([3, 5, 6], 4)).toBe(false)
  })

  it('hifumi はソート後に [1,2,3]、calcGain は -2 倍', () => {
    const hifumi = RollTableMulti.find(r => r.name === 'hifumi')!
    expect(hifumi.judge([3, 1, 2], 6)).toBe(true)
    expect(hifumi.calcGain(100, [3, 1, 2], 6)).toBe(-200)
  })

  it('me は ペア + 残りが ≥2 で成立 (ソート不問)', () => {
    const me = RollTableMe.find(r => r.name === 'me')!
    expect(me.judge([2, 2, 5], 9)).toBe(true)
    expect(me.calcGain(0, [2, 2, 5], 9)).toBe(5)
    expect(me.judge([5, 2, 2], 9)).toBe(true)
    expect(me.calcGain(0, [5, 2, 2], 9)).toBe(5)
    // [1,1,2]: ソート後 [1,1,2]、s[0]=s[1]=1, s[2]=2≥2 で me 成立
    expect(me.judge([1, 1, 2], 4)).toBe(true)
    // [2,2,1]: ソート後 [1,2,2]、s[1]=s[2]=2, s[0]=1<2 で me 不成立
    expect(me.judge([2, 2, 1], 5)).toBe(false)
  })
})

describe('Rule.calcMods', () => {
  it('和の mod 10', () => {
    expect(Rule.calcMods([[1, 2, 3]])).toEqual([6])
    expect(Rule.calcMods([[7, 8, 9]])).toEqual([4])
    expect(Rule.calcMods([[5, 5, 5]])).toEqual([5])
  })
})

describe('Rule.getReaches', () => {
  const eyesA: Eyes = [1, 0, 0, 0, 0]
  const eyesB: Eyes = [1, 0, 0, 0, 0]

  it('a 列 [1,1] でリーチ', () => {
    expect(Rule.getReaches(eyesA, eyesB)).toContain('a')
  })

  it('全部 [4,5] のとき複数ライン成立', () => {
    const e: Eyes = [4, 4, 4, 4, 4]
    const f: Eyes = [5, 5, 5, 5, 5]
    expect(Rule.getReaches(e, f).length).toBeGreaterThan(0)
  })
})

describe('Rule.isAmbulance', () => {
  it('119/911/120/112 を検出', () => {
    expect(Rule.isAmbulance([[1, 1, 9]])).toBe(true)
    expect(Rule.isAmbulance([[9, 1, 1]])).toBe(true)
    expect(Rule.isAmbulance([[1, 2, 0]])).toBe(true)
    expect(Rule.isAmbulance([[1, 1, 2]])).toBe(true)
    expect(Rule.isAmbulance([[1, 2, 3]])).toBe(false)
  })
})

describe('Rule.getZoneRolls', () => {
  it('9 つのゾーン目を検出', () => {
    expect(Rule.getZoneRolls([[1, 1, 0]])).toEqual(['110'])
    expect(Rule.getZoneRolls([[3, 5, 9]])).toEqual(['359'])
    expect(Rule.getZoneRolls([[9, 3, 1]])).toEqual(['931'])
    expect(Rule.getZoneRolls([[1, 2, 3]])).toEqual([])
  })
})

describe('Rule.calcScores', () => {
  it('pinzoro [1,1,1] のみ成立で multi gain は src*5、最終 sum=5', () => {
    const tuples: [number, number, number][] = [
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const mods = Rule.calcMods(tuples)
    const scores = Rule.calcScores(tuples, mods, false)
    const multi = scores.find(s => s.roll?.name === 'pinzoro')!
    // sum=0 → 1 になってから *5
    expect(multi.gain).toBe(5)
  })

  it('revolution 中は multi の符号反転', () => {
    const tuples: [number, number, number][] = [
      [1, 1, 1], // pinzoro
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const mods = Rule.calcMods(tuples)
    const scores = Rule.calcScores(tuples, mods, true)
    const multi = scores.find(s => s.roll?.name === 'pinzoro')!
    expect(multi.gain).toBe(-5)
  })
})

describe('Rule.addComboScore', () => {
  it('combo<2 は変化なし', () => {
    const cs: CurrentScores = [10, 20, 30, 0]
    expect(Rule.addComboScore(cs, 0)).toEqual([10, 20, 30, 30])
  })

  it('combo=3 で combo_sum = multi*3', () => {
    const cs: CurrentScores = [10, 20, 30, 0]
    expect(Rule.addComboScore(cs, 3)).toEqual([10, 20, 30, 90])
  })

  it('combo>10 は 10 倍に丸める', () => {
    const cs: CurrentScores = [10, 20, 30, 0]
    expect(Rule.addComboScore(cs, 50)).toEqual([10, 20, 30, 300])
  })

  it('±9999 で clamp する', () => {
    const cs: CurrentScores = [10, 20, 5000, 0]
    expect(Rule.addComboScore(cs, 5)).toEqual([10, 20, 5000, 9999])
    const csNeg: CurrentScores = [10, 20, -5000, 0]
    expect(Rule.addComboScore(csNeg, 5)).toEqual([10, 20, -5000, -9999])
  })
})

describe('Rule.getNextSpeed', () => {
  it('current_score < 0 で speed が下がる', () => {
    expect(Rule.getNextSpeed(4, -100)).toBe(2) // -2
    expect(Rule.getNextSpeed(10, -100)).toBe(5) // -5
    expect(Rule.getNextSpeed(1, -100)).toBe(1) // no change
  })

  it('current_score >= 100 で speed が上がる (10 以上は no change)', () => {
    expect(Rule.getNextSpeed(4, 200)).toBe(5)
    expect(Rule.getNextSpeed(9, 200)).toBe(10)
    expect(Rule.getNextSpeed(10, 200)).toBe(10)
  })

  it('current_score < 50 でほぼ維持〜減速', () => {
    expect(Rule.getNextSpeed(3, 30)).toBe(3)
    expect(Rule.getNextSpeed(1, 30)).toBe(2)
  })
})

describe('Rule.getTime / isAchieved', () => {
  it('rule_3_0409 は (60*4+9) - i_second_1', () => {
    expect(Rule.getTime('rule_3_0409', 0)).toBe(60 * 4 + 9)
    expect(Rule.getTime('rule_3_0409', 60 * 4 + 9)).toBe(0)
    expect(Rule.getTime('rule_3_0409', 9999)).toBe(0)
  })

  it('rule_1_2943 は total_score>=2943 で達成', () => {
    expect(Rule.isAchieved('rule_1_2943', 0, 2942)).toBe(false)
    expect(Rule.isAchieved('rule_1_2943', 0, 2943)).toBe(true)
  })

  it('rule_3_0409 は elapsed >= (60*4+9)*1000 で達成', () => {
    expect(Rule.isAchieved('rule_3_0409', (60 * 4 + 9) * 1000 - 1, 0)).toBe(
      false
    )
    expect(Rule.isAchieved('rule_3_0409', (60 * 4 + 9) * 1000, 0)).toBe(true)
  })
})

describe('Rule.getTripleSevenEffect', () => {
  it('結果に必ず ring1_ns/2/3 が 10 要素配列で返る', () => {
    const stats = newStats()
    for (let i = 0; i < 50; i++) {
      const r = Rule.getTripleSevenEffect(0, stats)
      expect(r.ring1_ns).toHaveLength(10)
      expect(r.ring2_ns).toHaveLength(10)
      expect(r.ring3_ns).toHaveLength(10)
      expect(r.rollback_stock).toBeGreaterThanOrEqual(0)
      expect(r.rollback_stock).toBeLessThanOrEqual(3)
    }
  })

  it('rollback_stock=3 から rollback ヒットすると 1 に巻き戻る', () => {
    const stats = newStats()
    let stock = 3
    let saw_rollback_overflow = false
    for (let i = 0; i < 200; i++) {
      const r = Rule.getTripleSevenEffect(stock, stats)
      if (r.rollback_stock === 1 && stock === 3) {
        saw_rollback_overflow = true
        break
      }
      stock = r.rollback_stock
      if (stock !== 3) stock = 3
    }
    expect(saw_rollback_overflow).toBe(true)
  })
})
