// Roll types and tables for Tin! Tilo! Rings!

export interface Roll {
  name: string
  desc: string
  rule: string
  f: 'multi' | 'add'
  odds: number | null
  judge: (tuple: number[], mod: number) => boolean
  calcGain: (src: number, tuple: number[], mod: number) => number
  won?: boolean
}

export const RollTableMulti: Roll[] = [
  {
    name: 'pinzoro',
    desc: '111',
    rule: 'chinchirorin',
    f: 'multi',
    odds: 5,
    judge: (tuple, _mod) => {
      return tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] === 1
    },
    calcGain: (src, _tuple, _mod) => {
      return src * 5
    },
  },
  {
    name: 'arashikabu',
    desc: '333',
    rule: 'kabu',
    f: 'multi',
    odds: 5,
    judge: (tuple, _mod) => {
      return tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] === 3
    },
    calcGain: (src, _tuple, _mod) => {
      return src * 3
    },
  },
  {
    name: 'kemono',
    desc: '666',
    rule: 'imported',
    f: 'multi',
    odds: -6,
    judge: (tuple, _mod) => {
      return tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] === 6
    },
    calcGain: (src, _tuple, _mod) => {
      return src * -6
    },
  },
  {
    name: 'triple_seven',
    desc: '777',
    rule: 'imported',
    f: 'multi',
    odds: 3,
    judge: (tuple, _mod) => {
      return tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] === 7
    },
    calcGain: (src, _tuple, _mod) => {
      return src * 3
    },
  },
  {
    name: 'zorome',
    desc: '000, 222, 444, 555, 888, 999',
    rule: 'chinchirorin',
    f: 'multi',
    odds: 3,
    judge: (tuple, _mod) => {
      return (
        tuple[0] === tuple[1] &&
        tuple[1] === tuple[2] &&
        tuple[0] !== 1 &&
        tuple[0] !== 3 &&
        tuple[0] !== 6 &&
        tuple[0] !== 7
      )
    },
    calcGain: (src, _tuple, _mod) => {
      return src * 3
    },
  },
  {
    name: 'shigoro',
    desc: '456',
    rule: 'chinchirorin',
    f: 'multi',
    odds: 2,
    judge: (tuple, _mod) => {
      const sorted = [...tuple].sort((a, b) => a - b)
      return sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6
    },
    calcGain: (src, _tuple, _mod) => {
      return src * 2
    },
  },
  {
    name: 'hifumi',
    desc: '123',
    rule: 'chinchirorin',
    f: 'multi',
    odds: -2,
    judge: (tuple, _mod) => {
      const sorted = [...tuple].sort((a, b) => a - b)
      return sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3
    },
    calcGain: (src, _tuple, _mod) => {
      return src * -2
    },
  },
]

export const RollTableMe: Roll[] = [
  {
    name: 'pink_ribbon',
    desc: '101',
    rule: 'imported',
    f: 'add',
    odds: 10,
    judge: (tuple, _mod) => {
      return tuple[0] === 1 && tuple[1] === 0 && tuple[2] === 1
    },
    calcGain: (_src, _tuple, _mod) => {
      return 10
    },
  },
  {
    name: 'pinbasami',
    desc: '1X1',
    rule: 'kabu',
    f: 'add',
    odds: null,
    judge: (tuple, _mod) => {
      return tuple[0] === 1 && tuple[1] !== 1 && tuple[2] === 1
    },
    calcGain: (_src, tuple, _mod) => {
      return tuple[1]
    },
  },
  {
    name: 'me',
    desc: '',
    rule: 'chinchirorin',
    f: 'add',
    odds: null,
    judge: (tuple, _mod) => {
      const sorted = [...tuple].sort((a, b) => a - b)
      if (
        sorted[0] === sorted[1] &&
        sorted[1] !== sorted[2] &&
        sorted[2] >= 2
      ) {
        return true
      } else if (
        sorted[0] !== sorted[1] &&
        sorted[1] === sorted[2] &&
        sorted[0] >= 2
      ) {
        return true
      }
      return false
    },
    calcGain: (_src, tuple, _mod) => {
      const sorted = [...tuple].sort((a, b) => a - b)
      if (sorted[0] === sorted[1] && sorted[1] !== sorted[2]) {
        return sorted[2]
      } else if (sorted[0] !== sorted[1] && sorted[1] === sorted[2]) {
        return sorted[0]
      }
      return 0
    },
  },
]

export const RollTableKabu: Roll[] = [
  {
    name: 'pin',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 1,
    judge: (_tuple, mod) => mod === 1,
    calcGain: (_src, _tuple, _mod) => 1,
  },
  {
    name: 'nizou',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 2,
    judge: (_tuple, mod) => mod === 2,
    calcGain: (_src, _tuple, _mod) => 2,
  },
  {
    name: 'santa',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 3,
    judge: (_tuple, mod) => mod === 3,
    calcGain: (_src, _tuple, _mod) => 3,
  },
  {
    name: 'yotsuya',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 4,
    judge: (_tuple, mod) => mod === 4,
    calcGain: (_src, _tuple, _mod) => 4,
  },
  {
    name: 'goke',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 5,
    judge: (_tuple, mod) => mod === 5,
    calcGain: (_src, _tuple, _mod) => 5,
  },
  {
    name: 'roppou',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 6,
    judge: (_tuple, mod) => mod === 6,
    calcGain: (_src, _tuple, _mod) => 6,
  },
  {
    name: 'shichiken',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 7,
    judge: (_tuple, mod) => mod === 7,
    calcGain: (_src, _tuple, _mod) => 7,
  },
  {
    name: 'oicho',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 8,
    judge: (_tuple, mod) => mod === 8,
    calcGain: (_src, _tuple, _mod) => 8,
  },
  {
    name: 'kabu',
    desc: '',
    rule: 'kabu',
    f: 'add',
    odds: 9,
    judge: (_tuple, mod) => mod === 9,
    calcGain: (_src, _tuple, _mod) => 9,
  },
]
