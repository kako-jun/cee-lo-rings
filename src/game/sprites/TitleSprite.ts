import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

export class TitleSprite {
  private sprite: GameSprite

  constructor(ds: Scene) {
    this.sprite = makeSprite('bg_title').addChildTo(ds)
    this.sprite.x = 320
    this.sprite.y = 480
    this.sprite.alpha = 0
  }

  show(): void {
    this.sprite.tweener.fadeIn(200).play()
  }
  hide(): void {
    this.sprite.tweener.fadeOut(50).play()
  }
  remove(): void {
    this.sprite.remove()
  }
}
