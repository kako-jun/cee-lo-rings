// Phina MonSprites (672-743行)
import { Scene } from '../Scene'
import { Rule } from '../rule'
import { GameSprite, makeSprite, Tweener } from '../pixi-sprite'

export class MonSprites {
  private sprite: GameSprite

  constructor(ds: Scene) {
    this.sprite = makeSprite('dummy').addChildTo(ds)
    this.sprite.x = 640
    this.sprite.y = 0
    this.sprite.alpha = 0
    this.startAnime()
  }

  private show(image: string): void {
    this.sprite.setImage(image)
  }

  change(): void {
    this.show('mon_' + Rule.random(1, 14))
  }

  remove(): void {
    this.sprite.remove()
  }

  private startAnime(): void {
    this.sprite.attach(
      Tweener()
        .by({ rotation: 360 }, 10000, 'easeInOutElastic')
        .by({ rotation: -360 }, 10000, 'easeInOutElastic')
        .setLoop(true)
    )
    this.sprite.attach(
      Tweener()
        .to({ scaleX: 1.5, scaleY: 1.5 }, 5000, 'easeInOutQuad')
        .to({ scaleX: 1, scaleY: 1 }, 10000, 'easeInOutQuad')
        .setLoop(true)
    )
    this.sprite.attach(
      Tweener()
        .by({ x: -200, y: 100 }, 10000, 'easeInOutSine')
        .by({ x: 100, y: 200 }, 10000, 'easeInOutSine')
        .by({ x: -150, y: 100 }, 10000, 'easeInOutSine')
        .by({ x: 100, y: 200 }, 10000, 'easeInOutSine')
        .by({ x: -300, y: 300 }, 10000, 'easeInOutSine')
        .by({ x: 450, y: 200 }, 10000, 'easeInOutSine')
        .by({ x: -200, y: -100 }, 10000, 'easeInOutSine')
        .by({ x: 100, y: -200 }, 10000, 'easeInOutSine')
        .by({ x: -150, y: -100 }, 10000, 'easeInOutSine')
        .by({ x: 100, y: -200 }, 10000, 'easeInOutSine')
        .by({ x: -300, y: -300 }, 10000, 'easeInOutSine')
        .by({ x: 450, y: -200 }, 10000, 'easeInOutSine')
        .setLoop(true)
    )
    this.sprite.attach(
      Tweener()
        .fade(0.5, 4000)
        .fade(1, 8000)
        .fade(0, 7000)
        .call(() => this.change())
        .wait(4000)
        .fade(1, 10000)
        .setLoop(true)
    )
  }
}
