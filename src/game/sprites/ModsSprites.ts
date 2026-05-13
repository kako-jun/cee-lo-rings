// Phina ModsSprites (1319-1415行) - 11 個の mod (剰余) 表示 + se_mod 二段階
import { Audio } from '../audio'
import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

export class ModsSprites {
  private sprites: GameSprite[] = []

  constructor(ds: Scene, x: number, y: number) {
    for (let i = 0; i < 11; i++) {
      const s = makeSprite('dummy').addChildTo(ds)
      if (i <= 4) {
        s.x = x - 100
        s.y = y - 82 + 42 * i
      } else if (i <= 7) {
        s.x = x + 72
        s.y = y - 128 + 47 * (i - 5)
      } else {
        s.x = x + 72
        s.y = y + 38 + 47 * (i - 8)
      }
      s.alpha = 0
      this.sprites.push(s)
    }
  }

  redraw(mods: number[]): void {
    this.sprites.forEach((s, i) => {
      s.setImage(`mod_n_${mods[i]}`)
      s.alpha = 0
    })
    this.show()
  }

  private show(): void {
    for (let i = 0; i < 5; i++) this.sprites[i].tweener.fadeIn(50).play()
    Audio.playSound('se_mod')
    for (let i = 5; i < 7; i++)
      this.sprites[i].tweener.wait(400).fadeIn(50).play()
    this.sprites[7].tweener
      .wait(400)
      .fadeIn(50)
      .call(() => Audio.playSound('se_mod'))
      .play()
    for (let i = 8; i < 10; i++)
      this.sprites[i].tweener.wait(800).fadeIn(50).play()
    this.sprites[10].tweener
      .wait(800)
      .fadeIn(50)
      .call(() => Audio.playSound('se_mod'))
      .play()
  }

  hide(): void {
    for (const s of this.sprites) s.tweener.fadeOut(50).play()
  }

  remove(): void {
    for (const s of this.sprites) s.remove()
    this.sprites = []
  }
}
