import { Assets } from 'pixi.js'

const imageUrls = import.meta.glob(
  [
    '../assets/image/ring/*.png',
    '../assets/image/bg/*.png',
    '../assets/image/title/{bg_title,button_back,button_back_hover,button_info,button_info_hover,rule_1,rule_2,rule_3,rule_1_2943,rule_1_2943_hover,rule_1_8390,rule_1_8390_hover,rule_1_37654,rule_1_37654_hover,rule_2_2943,rule_2_2943_hover,rule_2_8390,rule_2_8390_hover,rule_2_37654,rule_2_37654_hover,rule_3_0409,rule_3_0409_hover,rule_3_2009,rule_3_2009_hover,rule_3_6819,rule_3_6819_hover}.png',
    '../assets/image/guide/*.png',
    '../assets/image/score/*.png',
    '../assets/image/effect/*.png',
    '../assets/image/kanji/*.png',
    '../assets/image/mon/*.png',
    '../assets/image/line/*.png',
    '../assets/image/mod/*.png',
    '../assets/image/result/*.png',
    '../assets/image/dummy.png',
  ],
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>

const audioUrls = import.meta.glob(
  ['../assets/bgm/*.ogg', '../assets/sound/*.ogg'],
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>

function pathToKey(path: string): string {
  return path
    .split('/')
    .pop()!
    .replace(/\.(png|ogg)$/, '')
}

const BGM_FILE_TO_KEY: Record<string, string> = {
  minimal_004: 'bgm_1',
  minimal_008: 'bgm_2',
  minimal_007: 'bgm_3',
  minimal_016: 'bgm_4',
  minimal2_001: 'bgm_result',
}

function audioPathToKey(path: string): string {
  const name = pathToKey(path)
  return BGM_FILE_TO_KEY[name] ?? name
}

export interface AudioAsset {
  key: string
  url: string
}

export function getImageAssets(): { alias: string; src: string }[] {
  return Object.entries(imageUrls).map(([path, url]) => ({
    alias: pathToKey(path),
    src: url,
  }))
}

export function getAudioAssets(): AudioAsset[] {
  return Object.entries(audioUrls).map(([path, url]) => ({
    key: audioPathToKey(path),
    url,
  }))
}

export async function loadImageAssets(
  onProgress?: (p: number) => void
): Promise<void> {
  const assets = getImageAssets()
  for (const a of assets) Assets.add({ alias: a.alias, src: a.src })
  await Assets.load(
    assets.map(a => a.alias),
    onProgress
  )
}
