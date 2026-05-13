// Phina sprites.js BackgroundSprites (518-595行) を再現
// dummy → bg_N に差し替え + 3 つの永続アニメ (rotation / scale / x,y)

import { Scene } from '../Scene'
import { GameSprite, makeSprite, Tweener } from '../pixi-sprite'

export class BackgroundSprites {
  private sprite: GameSprite

  constructor(ds: Scene) {
    this.sprite = makeSprite('dummy').addChildTo(ds)
    this.sprite.x = 320
    this.sprite.y = 480
    this.sprite.alpha = 0
    this.startAnime()
  }

  private show(image: string): void {
    this.sprite.setImage(image)
    this.sprite.width = 960 * 1.2
    this.sprite.height = 960 * 1.2
    this.sprite.alpha = 0
    this.sprite.tweener.fadeIn(500).play()
  }

  change(i_score_1000: number, rule: string): void {
    let n = i_score_1000 + 1
    if (n > 37) {
      switch (rule) {
        case 'rule_1_2943':
        case 'rule_1_8390':
        case 'rule_1_37654':
        case 'rule_2_2943':
        case 'rule_2_8390':
        case 'rule_2_37654':
          n = 37
          break
        default:
          n = n % 37
          break
      }
    }
    this.show('bg_' + n)
  }

  remove(): void {
    this.sprite.remove()
  }

  private startAnime(): void {
    this.sprite.attach(
      Tweener()
        .by({ rotation: -60 }, 80000, 'easeInOutQuad')
        .by({ rotation: 90 }, 80000, 'easeInOutQuad')
        .by({ rotation: 60 }, 40000, 'easeInOutQuad')
        .by({ rotation: -90 }, 40000, 'easeInOutQuad')
        .setLoop(true)
    )
    this.sprite.attach(
      Tweener()
        .to({ scaleX: 1.5, scaleY: 1.5 }, 40000, 'easeInOutQuad')
        .to({ scaleX: 1, scaleY: 1 }, 80000, 'easeInOutQuad')
        .setLoop(true)
    )
    this.sprite.attach(
      Tweener()
        .by({ x: -50, y: 0 }, 10000, 'easeInOutQuad')
        .by({ x: 0, y: -50 }, 10000, 'easeInOutQuad')
        .by({ x: 50, y: 0 }, 10000, 'easeInOutQuad')
        .by({ x: 0, y: 50 }, 10000, 'easeInOutQuad')
        .setLoop(true)
    )
  }
}
