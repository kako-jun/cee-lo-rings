import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

const SLOTS = 8

export class TotalScoreSprites {
  private sprites: GameSprite[] = []

  constructor(ds: Scene, x: number, y: number) {
    for (let i = 0; i < SLOTS; i++) {
      const s = makeSprite('dummy').addChildTo(ds)
      s.x = x + 100 * 0.7 * i
      s.y = y
      s.alpha = 0
      this.sprites.push(s)
    }
  }

  redraw(total_score: number): void {
    const digits = String(total_score).split('')
    this.sprites.forEach((s, i) => {
      if (i < digits.length) s.setImage(`fude_n_${digits[i]}`)
      else s.setImage('dummy')
      s.tweener.fadeIn(100).play()
    })
  }

  remove(): void {
    for (const s of this.sprites) s.remove()
    this.sprites = []
  }
}
