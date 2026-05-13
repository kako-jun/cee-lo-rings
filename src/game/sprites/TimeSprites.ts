import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

const SLOTS = 8

export class TimeSprites {
  private sprites: GameSprite[] = []

  constructor(ds: Scene, x: number, y: number) {
    for (let i = 0; i < SLOTS; i++) {
      const s = makeSprite('dummy').addChildTo(ds)
      s.x = x + 50 * 0.7 * i
      s.y = y
      s.alpha = 0
      this.sprites.push(s)
    }
  }

  redraw(time: number): void {
    const h = Math.floor(time / 60 / 60)
    const m = Math.floor(time / 60) % 60
    const s = time % 60
    const pad = (n: number): string => ('00' + n).slice(-2)
    const time_str = `${pad(h)}c${pad(m)}c${pad(s)}`
    const digits = time_str.split('')
    this.sprites.forEach((sprite, i) => {
      if (i < digits.length) {
        sprite.setImage(`fude_n_${digits[i]}`)
        sprite.width = 50
        sprite.height = 50
      } else {
        sprite.setImage('dummy')
      }
      sprite.tweener.fadeIn(100).play()
    })
  }

  remove(): void {
    for (const s of this.sprites) s.remove()
    this.sprites = []
  }
}
