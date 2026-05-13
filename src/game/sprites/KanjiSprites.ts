// Phina KanjiSprites (597-670行)
import { Scene } from '../Scene'
import { Rule } from '../rule'
import { GameSprite, makeSprite, Tweener } from '../pixi-sprite'

export class KanjiSprites {
  private sprite: GameSprite

  constructor(ds: Scene) {
    this.sprite = makeSprite('dummy').addChildTo(ds)
    this.sprite.x = 0
    this.sprite.y = 960
    this.sprite.alpha = 0
    this.startAnime()
  }

  private show(image: string): void {
    this.sprite.setImage(image)
    this.sprite.width = 150 * 2
    this.sprite.height = 150 * 2
  }

  change(): void {
    this.show('kanji_' + Rule.random(1, 35))
  }

  remove(): void {
    this.sprite.remove()
  }

  private startAnime(): void {
    this.sprite.attach(
      Tweener()
        .by({ rotation: 360 }, 100000, 'easeInOutBack')
        .by({ rotation: -360 }, 120000, 'easeInOutBack')
        .setLoop(true)
    )
    this.sprite.attach(
      Tweener()
        .to({ scaleX: 2, scaleY: 2 }, 20000, 'easeInOutQuad')
        .to({ scaleX: 3, scaleY: 3 }, 20000, 'easeInOutQuad')
        .setLoop(true)
    )
    this.sprite.attach(
      Tweener()
        .by({ x: 200, y: -100 }, 14000, 'easeInOutSine')
        .by({ x: -100, y: -200 }, 14000, 'easeInOutSine')
        .by({ x: 150, y: -100 }, 14000, 'easeInOutSine')
        .by({ x: -100, y: -200 }, 14000, 'easeInOutSine')
        .by({ x: 300, y: -300 }, 14000, 'easeInOutSine')
        .by({ x: -450, y: -200 }, 14000, 'easeInOutSine')
        .by({ x: 200, y: 100 }, 14000, 'easeInOutSine')
        .by({ x: -100, y: 200 }, 14000, 'easeInOutSine')
        .by({ x: 150, y: 100 }, 14000, 'easeInOutSine')
        .by({ x: -100, y: 200 }, 14000, 'easeInOutSine')
        .by({ x: 300, y: 300 }, 14000, 'easeInOutSine')
        .by({ x: -450, y: 200 }, 14000, 'easeInOutSine')
        .setLoop(true)
    )
    this.sprite.attach(
      Tweener()
        .fade(0.5, 4000)
        .fade(1, 8000)
        .fade(0, 8000)
        .call(() => this.change())
        .wait(4000)
        .fade(1, 10000)
        .setLoop(true)
    )
  }
}
