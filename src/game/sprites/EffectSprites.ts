// Phina EffectSprites (745-829行)
import { Scene } from '../Scene'
import { GameSprite, makeSprite, Tweener } from '../pixi-sprite'

export type EffectKind = 'bullet_time' | 'revolution' | 'triple_seven'

export class EffectSprites {
  private sprites: GameSprite[]

  constructor(ds: Scene) {
    this.sprites = []
    const s1 = makeSprite('bg_bullet_time').addChildTo(ds)
    s1.x = 320
    s1.y = 480
    s1.alpha = 0
    this.sprites.push(s1)

    const s2 = makeSprite('bg_revolution').addChildTo(ds)
    s2.x = 320
    s2.y = 480
    s2.alpha = 0
    this.sprites.push(s2)

    const s3 = makeSprite('effect_hand').addChildTo(ds)
    s3.x = 320
    s3.y = 480
    s3.alpha = 0
    this.sprites.push(s3)

    const s4 = makeSprite('bg_triple_seven').addChildTo(ds)
    s4.x = 320
    s4.y = 480
    s4.width = 960 * 1.2
    s4.height = 960 * 1.2
    s4.alpha = 0
    this.sprites.push(s4)
  }

  show(effect: EffectKind): void {
    switch (effect) {
      case 'bullet_time':
        this.sprites[0].tweener.fadeIn(200).play()
        this.sprites[2].tweener
          .fade(0.5, 200)
          .by({ rotation: 360 }, 29000, 'linear')
          .play()
        break
      case 'revolution':
        this.sprites[1].tweener.fadeIn(200).play()
        this.sprites[2].tweener
          .fade(0.5, 200)
          .by({ rotation: 360 }, 29000, 'linear')
          .play()
        break
      case 'triple_seven':
        this.sprites[3].attach(Tweener().fade(0.2, 200))
        this.sprites[3].attach(Tweener().by({ rotation: 360 }, 2000, 'linear'))
        break
    }
  }

  hide(effect?: EffectKind): void {
    if (effect === 'triple_seven') {
      this.sprites[3].tweener.fadeOut(50).play()
    } else if (!effect) {
      for (const s of this.sprites) s.tweener.fadeOut(50).play()
    }
  }

  remove(): void {
    for (const s of this.sprites) s.remove()
    this.sprites = []
  }
}
