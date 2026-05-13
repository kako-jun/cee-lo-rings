// SceneManager 相当。Phina の Scenes [{label,nextLabel}] を最小代替し、
// Title ⇄ Main の往復のみ扱う

import { Application } from 'pixi.js'
import { Scene, SceneExitParam } from './Scene'
import { InputBinder } from './input'
import { TitleScene } from './TitleScene'
import { MainScene } from './MainScene'

export const STAGE_WIDTH = 640
export const STAGE_HEIGHT = 960

export class App {
  app: Application
  private currentScene: Scene | null = null
  private input: InputBinder

  constructor(app: Application) {
    this.app = app
    this.input = new InputBinder(app)
    this.app.ticker.add(ticker => {
      this.currentScene?.update(ticker.deltaMS)
    })
  }

  startTitle(initial: SceneExitParam = {}): void {
    this.replaceScene(new TitleScene(this, initial))
  }

  startMain(rule: string): void {
    this.replaceScene(new MainScene(this, rule))
  }

  private replaceScene(scene: Scene): void {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene)
      this.currentScene.destroyScene()
    }
    this.currentScene = scene
    scene.setExitHandler(param => this.handleExit(scene, param))
    this.app.stage.addChild(scene)
    this.input.bindScene(scene)
  }

  private handleExit(from: Scene, param: SceneExitParam): void {
    if (from instanceof TitleScene) {
      if (param.rule) {
        this.startMain(param.rule)
      }
    } else if (from instanceof MainScene) {
      // back / one_more いずれの経路も Title 経由で MainScene 再起動
      this.startTitle({ back: param.back, rule: param.rule })
    }
  }
}
