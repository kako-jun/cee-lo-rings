// Phina 版 rolls.js から TypeScript に再構築 (line-by-line 翻訳ではなく仕様準拠)
// RollTableMulti / RollTableMe / RollTableKabu の判定式は Phina に厳密一致

export type Tuple = [number, number, number]

export type RollFamily = 'multi' | 'add'

export interface Roll {
  name: string
  desc: string
  rule: string
  f: RollFamily
  odds: number | null
  judge: (tuple: Tuple, mod: number) => boolean
  calcGain: (src: number, tuple: Tuple, mod: number) => number
}

const sortedAsc = (tuple: Tuple): Tuple => {
  const a = tuple.slice() as Tuple
  a.sort((x, y) => x - y)
  return a
}

export const RollTableMulti: Roll[] = [
  {
    name: 'pinzoro',
    desc: '111',
    rule: 'chinchirorin',
    f: 'multi',
    odds: 5,
    judge: t => t[0] === t[1] && t[1] === t[2] && t[0] === 1,
    calcGain: src => src * 5,
  },
  {
    name: 'arashikabu',
    desc: '333',
    rule: 'kabu',
    f: 'multi',
    odds: 5,
    judge: t => t[0] === t[1] && t[1] === t[2] && t[0] === 3,
    calcGain: src => src * 3,
  },
  {
    name: 'kemono',
    desc: '666',
    rule: 'imported',
    f: 'multi',
    odds: -6,
    judge: t => t[0] === t[1] && t[1] === t[2] && t[0] === 6,
    calcGain: src => src * -6,
  },
  {
    name: 'triple_seven',
    desc: '777',
    rule: 'imported',
    f: 'multi',
    odds: 3,
    judge: t => t[0] === t[1] && t[1] === t[2] && t[0] === 7,
    calcGain: src => src * 3,
  },
  {
    name: 'zorome',
    desc: '000, 222, 444, 555, 888, 999',
    rule: 'chinchirorin',
    f: 'multi',
    odds: 3,
    judge: t => t[0] === t[1] && t[1] === t[2] && t[0] !== 1 && t[0] !== 3,
    calcGain: src => src * 3,
  },
  {
    name: 'shigoro',
    desc: '456',
    rule: 'chinchirorin',
    f: 'multi',
    odds: 2,
    judge: t => {
      const s = sortedAsc(t)
      return s[0] === 4 && s[1] === 5 && s[2] === 6
    },
    calcGain: src => src * 2,
  },
  {
    name: 'hifumi',
    desc: '',
    rule: 'chinchirorin',
    f: 'multi',
    odds: -2,
    judge: t => {
      const s = sortedAsc(t)
      return s[0] === 1 && s[1] === 2 && s[2] === 3
    },
    calcGain: src => src * -2,
  },
]

export const RollTableMe: Roll[] = [
  {
    name: 'pink_ribbon',
    desc: '101',
    rule: 'imported',
    f: 'add',
    odds: 10,
    judge: t => t[0] === 1 && t[1] === 0 && t[2] === 1,
    calcGain: () => 10,
  },
  {
    name: 'pinbasami',
    desc: '1X1',
    rule: 'kabu',
    f: 'add',
    odds: null,
    judge: t => t[0] === 1 && t[1] !== 1 && t[2] === 1,
    calcGain: (_src, t) => t[1],
  },
  {
    name: 'me',
    desc: '',
    rule: 'chinchirorin',
    f: 'add',
    odds: null,
    judge: t => {
      const s = sortedAsc(t)
      if (s[0] === s[1] && s[1] !== s[2] && s[2] >= 2) return true
      if (s[0] !== s[1] && s[1] === s[2] && s[0] >= 2) return true
      return false
    },
    calcGain: (_src, t) => {
      const s = sortedAsc(t)
      if (s[0] === s[1] && s[1] !== s[2]) return s[2]
      return s[0]
    },
  },
]

const kabuFactory = (name: string, modValue: number): Roll => ({
  name,
  desc: '',
  rule: 'kabu',
  f: 'add',
  odds: modValue,
  judge: (_t, mod) => mod === modValue,
  calcGain: () => modValue,
})

export const RollTableKabu: Roll[] = [
  kabuFactory('pin', 1),
  kabuFactory('nizou', 2),
  kabuFactory('santa', 3),
  kabuFactory('yotsuya', 4),
  kabuFactory('goke', 5),
  kabuFactory('roppou', 6),
  kabuFactory('shichiken', 7),
  kabuFactory('oicho', 8),
  kabuFactory('kabu', 9),
]
