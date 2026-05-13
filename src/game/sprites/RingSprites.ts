// Phina RingSprites (911-1199行) - 3 リール (left/center/right) の核心
// 40 個の数字スプライトを縦に並べ、回転 (rotate) → 減速 (brake) → 停止 (stop) を行う
// transform() は y 位置に応じた alpha/x/width 補正 (上下端のフェード + 横幅変動)

import { Audio } from '../audio'
import { Scene } from '../Scene'
import { Rule } from '../rule'
import { GameSprite, makeSprite } from '../pixi-sprite'

export type RingAlign = 'left' | 'center' | 'right'

interface RingPattern {
  top: { x_ratio: number; width_ratio: number }
  bottom: { x_ratio: number; width_ratio: number }
}

export class RingSprites {
  private ds: Scene
  private x: number
  private y: number
  private align: RingAlign

  ns: number[] = []
  color: string = 'white'
  eyes: number[] = []

  private basic_alpha = 1
  private i_transform = 0
  private transformed = false

  private ring_pattern: RingPattern
  private ring_pattern_old: RingPattern
  private ring_pattern_new: RingPattern

  private sprites: GameSprite[] = []

  constructor(ds: Scene, x: number, y: number, align: RingAlign) {
    this.ds = ds
    this.x = x
    this.y = y
    this.align = align
    const initial: RingPattern = {
      top: { x_ratio: 0, width_ratio: 1 },
      bottom: { x_ratio: 0, width_ratio: 1 },
    }
    this.ring_pattern_new = initial
    this.ring_pattern = initial
    this.ring_pattern_old = initial
    this.calc()
  }

  private initialY(i: number): number {
    if (i < 10) return this.y - 42 * 10 + 42 * i
    if (i < 20) return this.y + 42 * (i - 10)
    if (i < 30) return this.y + 42 * 10 + 42 * (i - 20)
    return this.y + 42 * 20 + 42 * (i - 30)
  }

  private calc(): void {
    for (let i = 0; i < 40; i++) {
      const sprite = makeSprite('dummy').addChildTo(this.ds)
      sprite.x = this.x
      sprite.y = this.initialY(i)
      sprite.alpha = 0
      this.sprites.push(sprite)
    }
  }

  redraw(ns: number[], color: string): void {
    this.ns = ns
    this.color = color
    this.sprites.forEach((sprite, i) => {
      const i2 = i % 10
      const n = ns[i2]
      sprite.setImage(`${color}_n_${n}`)
      sprite.alpha = 0
      sprite.meta.my_n = n
    })
    this.show()
  }

  private edgeAlpha(sprite: GameSprite): number {
    if (sprite.y >= -40 && sprite.y <= 200) {
      const delta = (sprite.y + 40) / 240
      return delta * this.basic_alpha
    }
    if (sprite.y >= 700 && sprite.y <= 1000) {
      const delta = (300 - (1000 - sprite.y)) / 300
      return (1 - delta) * this.basic_alpha
    }
    return this.basic_alpha
  }

  show(): void {
    for (const sprite of this.sprites) sprite.alpha = this.edgeAlpha(sprite)
  }

  hide(): void {
    for (const sprite of this.sprites) sprite.tweener.fadeOut(50).play()
  }

  remove(): void {
    for (const sprite of this.sprites) sprite.remove()
    this.sprites = []
  }

  changeOpacity(opacity: 'normal' | 'light'): void {
    this.basic_alpha = opacity === 'normal' ? 1 : 0.2
    for (const sprite of this.sprites) sprite.alpha = this.edgeAlpha(sprite)
  }

  changeRingPattern(): void {
    const ring_pattern: RingPattern = {
      top: {
        x_ratio: Rule.random(-5, 5),
        width_ratio: Rule.random(5, 30) / 10,
      },
      bottom: {
        x_ratio: Rule.random(-5, 5),
        width_ratio: Rule.random(5, 30) / 10,
      },
    }
    this.i_transform = 0
    this.transformed = false
    this.ring_pattern_old = this.ring_pattern
    this.ring_pattern_new = ring_pattern
    this.ring_pattern = this.calcRingPattern()
  }

  private calcRingPattern(): RingPattern {
    if (this.transformed) return this.ring_pattern
    this.i_transform++
    if (this.i_transform > 10000) {
      this.i_transform = 0
      this.transformed = true
      this.ring_pattern_old = this.ring_pattern
    }
    const dt_x =
      (this.ring_pattern_new.top.x_ratio - this.ring_pattern_old.top.x_ratio) /
      10000
    const dt_w =
      (this.ring_pattern_new.top.width_ratio -
        this.ring_pattern_old.top.width_ratio) /
      10000
    const db_x =
      (this.ring_pattern_new.bottom.x_ratio -
        this.ring_pattern_old.bottom.x_ratio) /
      10000
    const db_w =
      (this.ring_pattern_new.bottom.width_ratio -
        this.ring_pattern_old.bottom.width_ratio) /
      10000
    return {
      top: {
        x_ratio: this.ring_pattern_old.top.x_ratio + dt_x * this.i_transform,
        width_ratio:
          this.ring_pattern_old.top.width_ratio + dt_w * this.i_transform,
      },
      bottom: {
        x_ratio: this.ring_pattern_old.bottom.x_ratio + db_x * this.i_transform,
        width_ratio:
          this.ring_pattern_old.bottom.width_ratio + db_w * this.i_transform,
      },
    }
  }

  private transform(sprite: GameSprite): void {
    this.ring_pattern = this.calcRingPattern()
    if (sprite.y >= -40 && sprite.y <= 200) {
      const delta = (sprite.y + 40) / 240
      sprite.alpha = delta * this.basic_alpha
      sprite.x =
        this.x + (1 - delta) * (1 - delta) * 100 * this.ring_pattern.top.x_ratio
      sprite.width =
        42 * this.ring_pattern.top.width_ratio -
        (42 * this.ring_pattern.top.width_ratio - 42) * delta
    } else if (sprite.y >= 700 && sprite.y <= 1000) {
      const delta = (300 - (1000 - sprite.y)) / 300
      sprite.alpha = (1 - delta) * this.basic_alpha
      sprite.x = this.x + delta * delta * 100 * this.ring_pattern.bottom.x_ratio
      sprite.width =
        42 + (42 * this.ring_pattern.bottom.width_ratio - 42) * delta
    } else {
      sprite.alpha = this.basic_alpha
      sprite.x = this.x
      sprite.width = 42
    }
  }

  rotate(speed: number): void {
    this.sprites.forEach((sprite, i) => {
      sprite.y -= speed
      const init_y = this.initialY(i)
      if (sprite.y <= init_y - 42 * 10) sprite.y = init_y
      this.transform(sprite)
    })
  }

  brake(_speed: number, cb: () => void): void {
    let dt = 0
    this.sprites.forEach((sprite, i) => {
      const init_y = this.initialY(i)
      const dy = sprite.y - init_y
      const dn = Math.floor(dy / 42)
      const dest_y = init_y + 42 * dn
      const dest_dy = dest_y - sprite.y
      dt = 10 * Math.abs(dest_dy)
      sprite.tweener.by({ y: dest_dy }, dt, 'easeOutExpo').play()
      this.transform(sprite)
    })
    // Phina の `setTimeout(cb(), dt)` は cb() を即時実行している。
    // UX の体感差を出さないため Phina に倣って即時実行する。
    void dt
    cb?.()
  }

  stop(zone: boolean): void {
    const start_y = this.y
    const end_y = this.y + 42 * 10
    this.eyes = []
    for (const sprite of this.sprites) {
      if (sprite.y >= start_y && sprite.y < end_y) {
        const eye = sprite.meta.my_n as number
        this.eyes.push(eye)
      }
    }
    if (zone) {
      switch (this.align) {
        case 'left':
          Audio.playSound('voice_chin')
          break
        case 'center':
          Audio.playSound('voice_chiro')
          break
        case 'right':
          Audio.playSound('voice_rin')
          break
      }
    } else {
      Audio.playSound('se_stop')
    }
  }
}
