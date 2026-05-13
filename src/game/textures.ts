import { Assets, Texture } from 'pixi.js'
import { Images } from './assets'

const cache = new Map<string, Texture>()

export const loadAllTextures = async (): Promise<void> => {
  const entries = Object.entries(Images)
  // dummy が必須 (Phina で空 sprite 配置時に使う)
  if (!entries.find(([k]) => k === 'dummy')) {
    throw new Error('dummy.png が見つかりません')
  }
  await Promise.all(
    entries.map(async ([name, url]) => {
      const tex = await Assets.load<Texture>(url)
      cache.set(name, tex)
    })
  )
}

export const getTexture = (name: string): Texture => {
  const t = cache.get(name)
  if (!t) {
    // dummy にフォールバック (Phina 互換、不在画像で落ちないように)
    const d = cache.get('dummy')
    if (d) return d
    throw new Error(`texture not found: ${name}`)
  }
  return t
}

export const hasTexture = (name: string): boolean => cache.has(name)
