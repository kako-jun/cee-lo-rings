// pointer + Space キー入力を「シーンの onClick」に変換
// Phina の MainScene では key.getKey('space') を 200ms デバウンスしているので踏襲
// 個別のスプライト (button) は自前で eventMode='static' + onpointerdown を持つので、
// この入力ハンドラは「画面のどこか」をクリックした扱い (button をクリックしても発火する点も Phina 互換)

import { Application } from 'pixi.js'
import { Scene } from './Scene'

const KEY_DEBOUNCE_MS = 200

export class InputBinder {
  private app: Application
  private scene: Scene | null = null
  private keyWait = false
  private keyDownHandler = (ev: KeyboardEvent) => {
    if (ev.code !== 'Space') return
    if (this.keyWait) return
    this.keyWait = true
    setTimeout(() => {
      this.keyWait = false
    }, KEY_DEBOUNCE_MS)
    this.scene?.onClick()
  }
  private pointerHandler = () => {
    this.scene?.onClick()
  }

  constructor(app: Application) {
    this.app = app
    window.addEventListener('keydown', this.keyDownHandler)
    // canvas 上のクリックを scene.onClick に。stage の eventMode を有効化。
    this.app.stage.eventMode = 'static'
    this.app.stage.on('pointerdown', this.pointerHandler)
  }

  bindScene(scene: Scene | null): void {
    this.scene = scene
  }

  destroy(): void {
    window.removeEventListener('keydown', this.keyDownHandler)
    this.app.stage.off('pointerdown', this.pointerHandler)
  }
}
