// Phina title.js (TitleScene) を Pixi で再現
// - param.rule あり: 500ms 後に exit({rule}) (=rule 直再開)
// - param.back: 即 RulesSprite を表示 (戻り経路)
// - その他: TitleSprite 表示 → click で RulesSprite 表示

import { Scene, SceneExitParam } from './Scene'
import { Audio } from './audio'
import { TitleSprite } from './sprites/TitleSprite'
import { RulesSprite } from './sprites/RulesSprite'
import { InfoSprite } from './sprites/InfoSprite'
import type { App } from './App'

export class TitleScene extends Scene {
  mode: string = 'first'
  prevent_click = false
  private titleSprite: TitleSprite | null = null
  private rulesSprite: RulesSprite | null = null
  private infoSprite: InfoSprite | null = null

  constructor(_app: App, param: SceneExitParam) {
    super()

    if (param.rule) {
      setTimeout(() => {
        this.exit({ rule: param.rule })
      }, 500)
      return
    }

    this.titleSprite = new TitleSprite(this)
    this.titleSprite.show()

    if (param.back) {
      setTimeout(() => {
        this.infoSprite = new InfoSprite(this, 606, 30)
        this.infoSprite.show()
        this.rulesSprite = new RulesSprite(this, 120, 480)
        this.rulesSprite.show()
        this.mode = 'select_rule'
      }, 500)
    } else {
      setTimeout(() => {
        Audio.playSound('voice_chin')
        setTimeout(() => {
          Audio.playSound('voice_chiro')
          setTimeout(() => {
            Audio.playSound('voice_rin')
          }, 600)
        }, 600)
      }, 500)
    }
  }

  override onClick(): void {
    if (this.mode === 'first') {
      this.infoSprite = new InfoSprite(this, 606, 30)
      this.infoSprite.show()
      this.rulesSprite = new RulesSprite(this, 120, 480)
      this.rulesSprite.show()
      this.mode = 'select_rule'
    }
  }
}
