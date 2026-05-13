// Phina の DisplayScene 相当の最小基底
// - Container を継承して 640x960 のシーンルートとして使う
// - update(deltaMs) を毎 tick 呼ぶ (App.ticker 経由)
// - exit({...}) で SceneManager に遷移を通知

import { Container } from 'pixi.js'

export interface SceneExitParam {
  rule?: string
  back?: boolean
}

export type SceneExitHandler = (param: SceneExitParam) => void

export class Scene extends Container {
  private exitHandler: SceneExitHandler | null = null

  setExitHandler(handler: SceneExitHandler): void {
    this.exitHandler = handler
  }

  exit(param: SceneExitParam = {}): void {
    this.exitHandler?.(param)
  }

  update(_deltaMs: number): void {
    // override
  }

  onClick(): void {
    // override
  }

  destroyScene(): void {
    this.removeChildren()
    this.destroy({ children: true })
  }
}
