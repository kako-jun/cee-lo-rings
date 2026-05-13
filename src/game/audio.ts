// Phina audio.js の Audio オブジェクトを Howler に置換
// playBGM は Howler 標準の loop:true で再生 (Phina の手動 setTimeout ループは不要)
// SoundManager.playMusic("xxx", null, false) は単発再生 (= playSound)

import { Howl } from 'howler'
import { BGMs, RotateLoop, Sounds } from './assets'

const bgmHowls = new Map<string, Howl>()
const seHowls = new Map<string, Howl>()
const playingBgmIds = new Set<string>()
let currentBgmId = 'bgm_1'

const ensureBgm = (id: string): Howl | null => {
  let h = bgmHowls.get(id)
  if (h) return h
  if (id === 'se_rotate') {
    h = new Howl({
      src: [RotateLoop.url],
      loop: true,
      volume: RotateLoop.volume,
    })
  } else {
    const def = BGMs[id]
    if (!def) return null
    h = new Howl({ src: [def.url], loop: true, volume: def.volume })
  }
  bgmHowls.set(id, h)
  return h
}

const ensureSe = (id: string): Howl | null => {
  let h = seHowls.get(id)
  if (h) return h
  const url = Sounds[id]
  if (!url) return null
  h = new Howl({ src: [url], loop: false, volume: 1 })
  seHowls.set(id, h)
  return h
}

export const Audio = {
  playBGM: (id: string): void => {
    if (id.startsWith('bgm')) {
      Audio.stopBGM('bgm_1')
      Audio.stopBGM('bgm_2')
      Audio.stopBGM('bgm_3')
      Audio.stopBGM('bgm_4')
      currentBgmId = id
    }
    const h = ensureBgm(id)
    if (!h) return
    if (id.startsWith('bgm')) {
      const def = BGMs[id]
      if (def) h.volume(def.volume)
    }
    if (!h.playing()) h.play()
    playingBgmIds.add(id)
  },

  stopBGM: (id: string): void => {
    const h = bgmHowls.get(id)
    if (h) {
      h.stop()
      playingBgmIds.delete(id)
    }
  },

  stopAllBGM: (): void => {
    for (const id of [
      'bgm_1',
      'bgm_2',
      'bgm_3',
      'bgm_4',
      'bgm_result',
      'se_rotate',
    ]) {
      Audio.stopBGM(id)
    }
  },

  changeBGM: (): void => {
    // bgm_result 再生中など bgm_N 系でない場合は循環対象外 (NaN ガード)
    const parsed = Number(currentBgmId.split('_')[1])
    if (!Number.isFinite(parsed)) return
    let n = parsed + 1
    if (n > 4) n = 1
    Audio.playBGM('bgm_' + n)
  },

  changeBGMVolume: (volume: number): void => {
    for (const id of ['bgm_1', 'bgm_2', 'bgm_3', 'bgm_4']) {
      const def = BGMs[id]
      if (def) def.volume = volume
      const h = bgmHowls.get(id)
      if (h) h.volume(volume)
    }
  },

  playSound: (id: string): void => {
    const h = ensureSe(id)
    if (!h) return
    h.stop() // Phina の audio.play() は currentTime=0 リセット相当 (頭から再生)
    h.play()
  },
}
