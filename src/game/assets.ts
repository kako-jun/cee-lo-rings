// Phina constants.js の Assets / BGMs マップを Vite 上で再構築。
// import.meta.glob で URL を解決し、Phina と同じキー (例: bg_title, ring_white_n_5) で引けるようにする。
// glob はサブディレクトリ別に分離し、PNG のみ採用 (jpg は title/ 以下のごく一部のみ手動で追加可能)
// Bishamonten など Phina 参照外の大容量 jpg をバンドルしない。

const imageModules: Record<string, string> = {
  ...(import.meta.glob('../assets/image/bg/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/kanji/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/mon/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/ring/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/title/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/guide/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/mod/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/line/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/score/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/result/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/effect/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/image/dummy.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
}

const soundModules = import.meta.glob('../assets/sound/*.ogg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const bgmModules = import.meta.glob('../assets/bgm/*.ogg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const stripExt = (filename: string): string => filename.replace(/\.[^.]+$/, '')

const buildImageMap = (): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const [path, url] of Object.entries(imageModules)) {
    const m = path.match(/\.\.\/assets\/image\/(.+)$/)
    if (!m) continue
    const rel = m[1] // e.g. 'title/bg_title.png' / 'bg/bg_3.png'
    const slash = rel.indexOf('/')
    if (slash < 0) {
      out[stripExt(rel)] = url
      continue
    }
    const file = stripExt(rel.slice(slash + 1)) // 'bg_title'
    out[file] = url
  }
  return out
}

const buildSoundMap = (
  modules: Record<string, string>
): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const [path, url] of Object.entries(modules)) {
    const m = path.match(/\/([^/]+)\.ogg$/)
    if (!m) continue
    out[m[1]] = url
  }
  return out
}

export const Images: Record<string, string> = buildImageMap()
export const Sounds: Record<string, string> = buildSoundMap(soundModules)
export const BgmFiles: Record<string, string> = buildSoundMap(bgmModules)

export interface BgmDef {
  url: string
  length: number // ms — Phina との互換情報。Howler は loop 標準サポートだが getter として残す
  volume: number
}

export const BGMs: Record<string, BgmDef> = {
  bgm_1: { url: BgmFiles['minimal_004'], length: 28000, volume: 0.2 },
  bgm_2: { url: BgmFiles['minimal_008'], length: 28000, volume: 0.2 },
  bgm_3: { url: BgmFiles['minimal_007'], length: 28000, volume: 0.2 },
  bgm_4: { url: BgmFiles['minimal_016'], length: 14100, volume: 0.2 },
  bgm_result: { url: BgmFiles['minimal2_001'], length: 8000, volume: 0.1 },
}

// Phina で BGMs にぶら下がっていた se_rotate (2sec ループ) は別管理
export const RotateLoop = { url: Sounds['se_rotate'], length: 2000, volume: 1 }

export const ImageList = (): string[] => Object.values(Images)
export const SoundList = (): string[] => Object.values(Sounds)
export const BgmList = (): string[] => Object.values(BgmFiles)
