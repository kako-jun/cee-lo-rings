import { Howl, Howler } from 'howler'
import { getAudioAssets } from './assets'

/**
 * Audio management for cee-lo-rings.
 * Behavior matches the original audio.js:
 * - `bgm_1`..`bgm_4` cycle as the main BGM
 * - `se_rotate` loops alongside the main BGM
 * - `bgm_result` stops everything when the game finishes
 */
export class AudioManager {
  private howls: Map<string, Howl> = new Map()
  private mainBgmKey: string | null = null
  private mainBgmId: number | null = null
  private seRotateId: number | null = null
  private resultBgmId: number | null = null
  private currentMainBgmId: string = 'bgm_1'
  private ready = false

  /** Build Howl instances for every asset; resolves once all are decoded. */
  async preload(onProgress?: (p: number) => void): Promise<void> {
    if (this.ready) return
    const assets = getAudioAssets()
    let loaded = 0
    await Promise.all(
      assets.map(
        ({ key, url }) =>
          new Promise<void>(resolve => {
            const howl = new Howl({
              src: [url],
              preload: true,
              onload: () => {
                loaded++
                onProgress?.(loaded / assets.length)
                resolve()
              },
              onloaderror: () => {
                loaded++
                onProgress?.(loaded / assets.length)
                resolve()
              },
            })
            this.howls.set(key, howl)
          })
      )
    )
    this.ready = true
  }

  /** Resume the WebAudio context after a user gesture (browser autoplay policy). */
  resumeContext(): void {
    if (Howler.ctx && Howler.ctx.state !== 'running') {
      void Howler.ctx.resume()
    }
  }

  playBGM(key: string, volume: number = 0.2): void {
    const howl = this.howls.get(key)
    if (!howl) return

    if (key === 'se_rotate') {
      if (this.seRotateId !== null) howl.stop(this.seRotateId)
      howl.loop(true)
      howl.volume(volume)
      this.seRotateId = howl.play()
      return
    }

    if (key === 'bgm_result') {
      this.stopAllBGM()
      howl.loop(true)
      howl.volume(volume)
      this.resultBgmId = howl.play()
      return
    }

    if (key.startsWith('bgm_')) {
      if (this.mainBgmKey && this.mainBgmId !== null) {
        const prev = this.howls.get(this.mainBgmKey)
        prev?.stop(this.mainBgmId)
      }
      howl.loop(true)
      howl.volume(volume)
      this.mainBgmId = howl.play()
      this.mainBgmKey = key
      this.currentMainBgmId = key
    }
  }

  stopBGM(key?: string): void {
    if (key === 'se_rotate') {
      if (this.seRotateId !== null) {
        this.howls.get('se_rotate')?.stop(this.seRotateId)
        this.seRotateId = null
      }
      return
    }
    if (key && this.mainBgmKey === key) {
      if (this.mainBgmId !== null) this.howls.get(key)?.stop(this.mainBgmId)
      this.mainBgmId = null
      this.mainBgmKey = null
      return
    }
    if (key === 'bgm_result') {
      if (this.resultBgmId !== null)
        this.howls.get('bgm_result')?.stop(this.resultBgmId)
      this.resultBgmId = null
      return
    }
    if (!key) this.stopAllBGM()
  }

  stopAllBGM(): void {
    if (this.mainBgmKey && this.mainBgmId !== null) {
      this.howls.get(this.mainBgmKey)?.stop(this.mainBgmId)
    }
    if (this.seRotateId !== null) {
      this.howls.get('se_rotate')?.stop(this.seRotateId)
    }
    if (this.resultBgmId !== null) {
      this.howls.get('bgm_result')?.stop(this.resultBgmId)
    }
    this.mainBgmKey = null
    this.mainBgmId = null
    this.seRotateId = null
    this.resultBgmId = null
  }

  /** One-shot SE / voice playback. */
  playSound(key: string, volume: number = 1): void {
    const howl = this.howls.get(key)
    if (!howl) return
    howl.loop(false)
    howl.volume(volume)
    howl.play()
  }

  changeBGM(): void {
    let n = parseInt(this.currentMainBgmId.split('_')[1], 10)
    n++
    if (n > 4) n = 1
    const id = `bgm_${n}`
    this.currentMainBgmId = id
    this.playBGM(id, 0.2)
  }

  changeBGMVolume(volume: number): void {
    if (this.mainBgmKey && this.mainBgmId !== null) {
      this.howls.get(this.mainBgmKey)?.volume(volume, this.mainBgmId)
    }
  }
}
