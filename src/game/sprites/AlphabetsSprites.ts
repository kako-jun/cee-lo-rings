// Phina AlphabetsSprites (1417-1553行) - スコア表の 11 行 (アルファベット + tuple + mod) + 区切り線
import { Scene } from '../Scene'
import { Tuple } from '../rolls'
import { GameSprite, makeSprite } from '../pixi-sprite'

const ALPHABETS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']

export class AlphabetsSprites {
  private sprite_group: GameSprite[][] = []
  private line_sprite: GameSprite

  constructor(ds: Scene, x: number, y: number) {
    for (let i = 0; i < 11; i++) {
      const a = ALPHABETS[i]
      const alphaS = makeSprite(`alphabet_${a}`).addChildTo(ds)
      alphaS.x = x
      alphaS.y = y + 42 * i
      alphaS.alpha = 0

      const ts1 = makeSprite('dummy').addChildTo(ds)
      ts1.x = x + 28
      ts1.y = y + 42 * i
      ts1.width = 35
      ts1.height = 35
      ts1.alpha = 0

      const ts2 = makeSprite('dummy').addChildTo(ds)
      ts2.x = x + 53
      ts2.y = y + 42 * i
      ts2.width = 35
      ts2.height = 35
      ts2.alpha = 0

      const ts3 = makeSprite('dummy').addChildTo(ds)
      ts3.x = x + 78
      ts3.y = y + 42 * i
      ts3.width = 35
      ts3.height = 35
      ts3.alpha = 0

      const modS = makeSprite('dummy').addChildTo(ds)
      modS.x = x + 112
      modS.y = y + 42 * i
      modS.width = 30
      modS.height = 30
      modS.alpha = 0

      this.sprite_group.push([alphaS, ts1, ts2, ts3, modS])
    }
    this.line_sprite = makeSprite('line_h_3').addChildTo(ds)
    this.line_sprite.x = x + 140
    this.line_sprite.y = y + 445
    this.line_sprite.alpha = 0
  }

  redraw(tuples: Tuple[], mods: number[]): void {
    this.sprite_group.forEach((sprites, i) => {
      const t = tuples[i]
      const m = mods[i]
      sprites[0].alpha = 0
      for (let j = 0; j < 3; j++) {
        sprites[j + 1].setImage(`gray_n_${t[j]}`)
        sprites[j + 1].width = 35
        sprites[j + 1].height = 35
        sprites[j + 1].alpha = 0
      }
      sprites[4].setImage(`mod_n_${m}`)
      sprites[4].width = 30
      sprites[4].height = 30
      sprites[4].alpha = 0
    })
    this.line_sprite.alpha = 0
    this.show()
  }

  private show(): void {
    for (const sprites of this.sprite_group) {
      for (const s of sprites) s.tweener.wait(800).fadeIn(50).play()
    }
    this.line_sprite.tweener.wait(800).fadeIn(50).play()
  }

  hide(): void {
    for (const sprites of this.sprite_group) {
      for (const s of sprites) s.tweener.fadeOut(50).play()
    }
    this.line_sprite.tweener.fadeOut(50).play()
  }

  remove(): void {
    for (const sprites of this.sprite_group) for (const s of sprites) s.remove()
    this.sprite_group = []
    this.line_sprite.remove()
  }
}
