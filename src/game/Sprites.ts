// Complete sprite classes ported from Phina.js to Phaser 3
// Original: phinajs/assets/js/sprites.js

import Phaser from 'phaser'
import type { MainScene } from './MainScene'
import type { Score, GameStats, RuleType } from './rule'

/**
 * RingSprites - Manages rotating ring/slot display
 * Original: Lines 911-1199 in sprites.js
 */
export class RingSprites {
  private scene: MainScene
  private sprites: Phaser.GameObjects.Image[] = []
  private x: number
  private y: number
  private basicAlpha: number = 1
  public eyes: number[] = []
  public ns: number[] = []
  public color: string = 'white'

  private iTransform: number = 0
  private transformed: boolean = false
  private ringPatternNew: RingPattern = {
    top: { xRatio: 0, widthRatio: 1 },
    bottom: { xRatio: 0, widthRatio: 1 },
  }
  private ringPattern: RingPattern
  private ringPatternOld: RingPattern

  constructor(
    scene: MainScene,
    x: number,
    y: number,
    position: 'left' | 'center' | 'right'
  ) {
    this.scene = scene
    this.x = x
    this.y = y
    void position
    this.ringPattern = { ...this.ringPatternNew }
    this.ringPatternOld = { ...this.ringPattern }
  }

  redraw(ns: number[], color: string): void {
    this.ns = ns
    this.color = color

    this.sprites.forEach(sprite => sprite.destroy())
    this.sprites = []

    for (let i = 0; i < 40; i++) {
      const i2 = i % 10
      const n = ns[i2]

      let yOffset = 0
      if (i < 10) {
        yOffset = -42 * 10 + 42 * i
      } else if (i < 20) {
        yOffset = 42 * (i - 10)
      } else if (i < 30) {
        yOffset = 42 * 10 + 42 * (i - 20)
      } else {
        yOffset = 42 * 20 + 42 * (i - 30)
      }

      const sprite = this.scene.add.image(
        this.x,
        this.y + yOffset,
        `${color}_n_${n}`
      )
      sprite.setData('n', n)
      sprite.setData('initialY', this.y + yOffset)
      sprite.setData('index', i)
      sprite.setAlpha(0)

      this.sprites.push(sprite)
    }

    this.show()
  }

  rotate(speed: number): void {
    this.sprites.forEach((sprite, i) => {
      sprite.y -= speed

      const initialY = this.getInitialY(i)
      if (sprite.y <= initialY - 42 * 10) {
        sprite.y = initialY
      }

      this.transform(sprite)
    })
  }

  brake(_speed: number, callback: () => void): void {
    let maxDuration = 0

    this.sprites.forEach((sprite, i) => {
      const initialY = this.getInitialY(i)
      const dy = sprite.y - initialY
      const dn = Math.floor(dy / 42)
      const destY = initialY + 42 * dn
      const destDy = destY - sprite.y
      const duration = 10 * Math.abs(destDy)

      maxDuration = Math.max(maxDuration, duration)

      this.scene.tweens.add({
        targets: sprite,
        y: destY,
        duration: duration,
        ease: 'Expo.easeOut',
        onUpdate: () => this.transform(sprite),
      })
    })

    if (callback) {
      this.scene.time.delayedCall(maxDuration, callback)
    }
  }

  stop(isZone: boolean): void {
    const startY = this.y
    const endY = this.y + 42 * 10

    this.eyes = []
    this.sprites.forEach(sprite => {
      if (sprite.y >= startY && sprite.y < endY) {
        this.eyes.push(sprite.getData('n'))
      }
    })

    if (isZone) {
      this.basicAlpha = 0.5
      this.sprites.forEach(sprite => this.transform(sprite))
    }
  }

  changeOpacity(mode: 'normal' | 'light'): void {
    if (mode === 'normal') {
      this.basicAlpha = 1
    } else {
      this.basicAlpha = 0.2
    }

    this.sprites.forEach(sprite => {
      if (sprite.y >= -40 && sprite.y <= 200) {
        const delta = (sprite.y + 40) / 240
        sprite.alpha = delta * this.basicAlpha
      } else if (sprite.y >= 700 && sprite.y <= 1000) {
        const delta = (300 - (1000 - sprite.y)) / 300
        sprite.alpha = (1 - delta) * this.basicAlpha
      } else {
        sprite.alpha = this.basicAlpha
      }
    })
  }

  changeRingPattern(): void {
    const ringPattern: RingPattern = {
      top: {
        xRatio: randomInt(-5, 5),
        widthRatio: randomInt(5, 30) / 10,
      },
      bottom: {
        xRatio: randomInt(-5, 5),
        widthRatio: randomInt(5, 30) / 10,
      },
    }

    this.iTransform = 0
    this.transformed = false

    this.ringPatternOld = { ...this.ringPattern }
    this.ringPatternNew = ringPattern
    this.ringPattern = this.calcRingPattern()
  }

  private getInitialY(i: number): number {
    if (i < 10) {
      return this.y - 42 * 10 + 42 * i
    } else if (i < 20) {
      return this.y + 42 * (i - 10)
    } else if (i < 30) {
      return this.y + 42 * 10 + 42 * (i - 20)
    } else {
      return this.y + 42 * 20 + 42 * (i - 30)
    }
  }

  private transform(sprite: Phaser.GameObjects.Image): void {
    this.ringPattern = this.calcRingPattern()

    if (sprite.y >= -40 && sprite.y <= 200) {
      const delta = (sprite.y + 40) / 240
      sprite.alpha = delta * this.basicAlpha
      sprite.x =
        this.x + (1 - delta) * (1 - delta) * 100 * this.ringPattern.top.xRatio
      sprite.displayWidth =
        42 * this.ringPattern.top.widthRatio -
        (42 * this.ringPattern.top.widthRatio - 42) * delta
    } else if (sprite.y >= 700 && sprite.y <= 1000) {
      const delta = (300 - (1000 - sprite.y)) / 300
      sprite.alpha = (1 - delta) * this.basicAlpha
      sprite.x = this.x + delta * delta * 100 * this.ringPattern.bottom.xRatio
      sprite.displayWidth =
        42 + (42 * this.ringPattern.bottom.widthRatio - 42) * delta
    } else {
      sprite.alpha = this.basicAlpha
      sprite.x = this.x
      sprite.displayWidth = 42
    }
  }

  private calcRingPattern(): RingPattern {
    if (this.transformed) {
      return this.ringPattern
    }

    this.iTransform++
    if (this.iTransform > 10000) {
      this.iTransform = 0
      this.transformed = true
      this.ringPatternOld = { ...this.ringPattern }
    }

    const deltaTopX =
      (this.ringPatternNew.top.xRatio - this.ringPatternOld.top.xRatio) / 10000
    const deltaTopWidth =
      (this.ringPatternNew.top.widthRatio -
        this.ringPatternOld.top.widthRatio) /
      10000
    const deltaBottomX =
      (this.ringPatternNew.bottom.xRatio - this.ringPatternOld.bottom.xRatio) /
      10000
    const deltaBottomWidth =
      (this.ringPatternNew.bottom.widthRatio -
        this.ringPatternOld.bottom.widthRatio) /
      10000

    return {
      top: {
        xRatio: this.ringPatternOld.top.xRatio + deltaTopX * this.iTransform,
        widthRatio:
          this.ringPatternOld.top.widthRatio + deltaTopWidth * this.iTransform,
      },
      bottom: {
        xRatio:
          this.ringPatternOld.bottom.xRatio + deltaBottomX * this.iTransform,
        widthRatio:
          this.ringPatternOld.bottom.widthRatio +
          deltaBottomWidth * this.iTransform,
      },
    }
  }

  hide(): void {
    this.sprites.forEach(sprite => {
      this.scene.tweens.add({ targets: sprite, alpha: 0, duration: 50 })
    })
  }

  show(): void {
    this.sprites.forEach(sprite => {
      if (sprite.y >= -40 && sprite.y <= 200) {
        const delta = (sprite.y + 40) / 240
        sprite.alpha = delta * this.basicAlpha
      } else if (sprite.y >= 700 && sprite.y <= 1000) {
        const delta = (300 - (1000 - sprite.y)) / 300
        sprite.alpha = (1 - delta) * this.basicAlpha
      } else {
        sprite.alpha = this.basicAlpha
      }
    })
  }

  remove(): void {
    this.sprites.forEach(sprite => sprite.destroy())
    this.sprites = []
  }
}

interface RingPattern {
  top: { xRatio: number; widthRatio: number }
  bottom: { xRatio: number; widthRatio: number }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class BackgroundSprites {
  private scene: Phaser.Scene
  private sprite: Phaser.GameObjects.Image

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    const bgIndex = Math.floor(Math.random() * 37) + 1
    this.sprite = scene.add.image(320, 480, `bg_${bgIndex}`)
    this.sprite.setAlpha(0.3)
    this.sprite.setDepth(-10)
    this.startAnime()
  }

  change(iScore1000: number, rule: string): void {
    let n = iScore1000 + 1
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
        case 'rule_3_0409':
        case 'rule_3_2009':
        case 'rule_3_6819':
          n = n % 37
          break
      }
    }
    this.sprite.setTexture(`bg_${n}`)
    this.sprite.setDisplaySize(960 * 1.2, 960 * 1.2)
    this.sprite.setAlpha(0)
    this.scene.tweens.add({ targets: this.sprite, alpha: 1, duration: 500 })
  }

  private startAnime(): void {
    this.createRotationAnimation()
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 40000,
      ease: 'Quad.easeInOut',
      yoyo: true,
      repeat: -1,
    })
    this.createPositionAnimation()
  }

  private createRotationAnimation(): void {
    const rotations = [
      { angle: -60, duration: 80000 },
      { angle: 30, duration: 80000 },
      { angle: 90, duration: 40000 },
      { angle: 0, duration: 40000 },
    ]
    const doRotation = (index: number) => {
      const rot = rotations[index]
      this.scene.tweens.add({
        targets: this.sprite,
        rotation: Phaser.Math.DegToRad(rot.angle),
        duration: rot.duration,
        ease: 'Quad.easeInOut',
        onComplete: () => doRotation((index + 1) % rotations.length),
      })
    }
    doRotation(0)
  }

  private createPositionAnimation(): void {
    const movements = [
      { x: 270, y: 480, d: 10000 },
      { x: 270, y: 430, d: 10000 },
      { x: 320, y: 430, d: 10000 },
      { x: 320, y: 480, d: 10000 },
    ]
    const doMove = (index: number) => {
      const m = movements[index]
      this.scene.tweens.add({
        targets: this.sprite,
        x: m.x,
        y: m.y,
        duration: m.d,
        ease: 'Quad.easeInOut',
        onComplete: () => doMove((index + 1) % movements.length),
      })
    }
    doMove(0)
  }

  remove(): void {
    if (this.sprite) this.sprite.destroy()
  }
}

export class KanjiSprites {
  private scene: Phaser.Scene
  private sprite: Phaser.GameObjects.Image
  private currentIndex: number

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.currentIndex = Math.floor(Math.random() * 35) + 1
    this.sprite = scene.add.image(320, 480, `kanji_${this.currentIndex}`)
    this.sprite.setAlpha(0.2)
    this.sprite.setDepth(-8)
    this.startAnime()
  }

  private change(): void {
    this.currentIndex = Math.floor(Math.random() * 35) + 1
    this.sprite.setTexture(`kanji_${this.currentIndex}`)
  }

  private startAnime(): void {
    this.createRotationAnimation()
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 2, to: 3 },
      scaleY: { from: 2, to: 3 },
      duration: 20000,
      ease: 'Quad.easeInOut',
      yoyo: true,
      repeat: -1,
    })
    this.createPositionAnimation()
    this.createOpacityAnimation()
  }

  private createRotationAnimation(): void {
    const rots = [
      { angle: 360, duration: 100000, ease: 'Back.easeInOut' },
      { angle: -360, duration: 120000, ease: 'Back.easeInOut' },
    ]
    const doRot = (i: number) => {
      const r = rots[i]
      this.scene.tweens.add({
        targets: this.sprite,
        rotation: `+=${Phaser.Math.DegToRad(r.angle)}`,
        duration: r.duration,
        ease: r.ease,
        onComplete: () => doRot((i + 1) % rots.length),
      })
    }
    doRot(0)
  }

  private createPositionAnimation(): void {
    const moves = [
      { x: 200, y: -100 },
      { x: -100, y: -200 },
      { x: 150, y: -100 },
      { x: -100, y: -200 },
      { x: 300, y: -300 },
      { x: -450, y: -200 },
      { x: 200, y: 100 },
      { x: -100, y: 200 },
      { x: 150, y: 100 },
      { x: -100, y: 200 },
      { x: 300, y: 300 },
      { x: -450, y: 200 },
    ]
    const doMove = (i: number) => {
      const m = moves[i]
      this.scene.tweens.add({
        targets: this.sprite,
        x: `+=${m.x}`,
        y: `+=${m.y}`,
        duration: 14000,
        ease: 'Sine.easeInOut',
        onComplete: () => doMove((i + 1) % moves.length),
      })
    }
    doMove(0)
  }

  private createOpacityAnimation(): void {
    const seq = () => {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.5,
        duration: 4000,
        ease: 'Linear',
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.sprite,
            alpha: 1,
            duration: 8000,
            ease: 'Linear',
            onComplete: () => {
              this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 8000,
                ease: 'Linear',
                onComplete: () => {
                  this.change()
                  this.scene.time.delayedCall(4000, () => {
                    this.scene.tweens.add({
                      targets: this.sprite,
                      alpha: 1,
                      duration: 10000,
                      ease: 'Linear',
                      onComplete: seq,
                    })
                  })
                },
              })
            },
          })
        },
      })
    }
    seq()
  }

  remove(): void {
    if (this.sprite) this.sprite.destroy()
  }
}

export class MonSprites {
  private scene: Phaser.Scene
  private sprite: Phaser.GameObjects.Image
  private currentIndex: number

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.currentIndex = Math.floor(Math.random() * 14) + 1
    this.sprite = scene.add.image(320, 480, `mon_${this.currentIndex}`)
    this.sprite.setAlpha(0.2)
    this.sprite.setDepth(-9)
    this.startAnime()
  }

  private change(): void {
    this.currentIndex = Math.floor(Math.random() * 14) + 1
    this.sprite.setTexture(`mon_${this.currentIndex}`)
  }

  private startAnime(): void {
    this.createRotationAnimation()
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 5000,
      ease: 'Quad.easeInOut',
      yoyo: true,
      repeat: -1,
    })
    this.createPositionAnimation()
    this.createOpacityAnimation()
  }

  private createRotationAnimation(): void {
    const rots = [
      { angle: 360, duration: 10000, ease: 'Elastic.easeInOut' },
      { angle: -360, duration: 10000, ease: 'Elastic.easeInOut' },
    ]
    const doRot = (i: number) => {
      const r = rots[i]
      this.scene.tweens.add({
        targets: this.sprite,
        rotation: `+=${Phaser.Math.DegToRad(r.angle)}`,
        duration: r.duration,
        ease: r.ease,
        onComplete: () => doRot((i + 1) % rots.length),
      })
    }
    doRot(0)
  }

  private createPositionAnimation(): void {
    const moves = [
      { x: -200, y: 100 },
      { x: 100, y: 200 },
      { x: -150, y: 100 },
      { x: 100, y: 200 },
      { x: -300, y: 300 },
      { x: 450, y: 200 },
      { x: -200, y: -100 },
      { x: 100, y: -200 },
      { x: -150, y: -100 },
      { x: 100, y: -200 },
      { x: -300, y: -300 },
      { x: 450, y: -200 },
    ]
    const doMove = (i: number) => {
      const m = moves[i]
      this.scene.tweens.add({
        targets: this.sprite,
        x: `+=${m.x}`,
        y: `+=${m.y}`,
        duration: 10000,
        ease: 'Sine.easeInOut',
        onComplete: () => doMove((i + 1) % moves.length),
      })
    }
    doMove(0)
  }

  private createOpacityAnimation(): void {
    const seq = () => {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.5,
        duration: 4000,
        ease: 'Linear',
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.sprite,
            alpha: 1,
            duration: 8000,
            ease: 'Linear',
            onComplete: () => {
              this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 7000,
                ease: 'Linear',
                onComplete: () => {
                  this.change()
                  this.scene.time.delayedCall(4000, () => {
                    this.scene.tweens.add({
                      targets: this.sprite,
                      alpha: 1,
                      duration: 10000,
                      ease: 'Linear',
                      onComplete: seq,
                    })
                  })
                },
              })
            },
          })
        },
      })
    }
    seq()
  }

  remove(): void {
    if (this.sprite) this.sprite.destroy()
  }
}

export class EffectSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.sprites.push(scene.add.image(320, 480, 'bg_bullet_time').setAlpha(0))
    this.sprites.push(scene.add.image(320, 480, 'bg_revolution').setAlpha(0))
    this.sprites.push(scene.add.image(320, 480, 'effect_hand').setAlpha(0))
    const s4 = scene.add.image(320, 480, 'bg_triple_seven')
    s4.setDisplaySize(960 * 1.2, 960 * 1.2).setAlpha(0)
    this.sprites.push(s4)
  }

  show(effect: string): void {
    switch (effect) {
      case 'bullet_time':
        this.scene.tweens.add({
          targets: this.sprites[0],
          alpha: 1,
          duration: 200,
        })
        this.scene.tweens.add({
          targets: this.sprites[2],
          alpha: 0.5,
          duration: 200,
        })
        this.scene.tweens.add({
          targets: this.sprites[2],
          rotation: `+=${Phaser.Math.DegToRad(360)}`,
          duration: 29000,
          ease: 'Linear',
        })
        break
      case 'revolution':
        this.scene.tweens.add({
          targets: this.sprites[1],
          alpha: 1,
          duration: 200,
        })
        this.scene.tweens.add({
          targets: this.sprites[2],
          alpha: 0.5,
          duration: 200,
        })
        this.scene.tweens.add({
          targets: this.sprites[2],
          rotation: `+=${Phaser.Math.DegToRad(360)}`,
          duration: 29000,
          ease: 'Linear',
        })
        break
      case 'triple_seven':
        this.scene.tweens.add({
          targets: this.sprites[3],
          alpha: 0.2,
          duration: 200,
        })
        this.scene.tweens.add({
          targets: this.sprites[3],
          rotation: `+=${Phaser.Math.DegToRad(360)}`,
          duration: 2000,
          ease: 'Linear',
        })
        break
    }
  }

  hide(effect?: string): void {
    if (effect === 'triple_seven') {
      this.scene.tweens.add({
        targets: this.sprites[3],
        alpha: 0,
        duration: 50,
      })
    } else if (!effect) {
      this.sprites.forEach(s =>
        this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
      )
    }
  }

  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class LinesSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.sprites.push(scene.add.image(122, 450, 'line_v_1').setAlpha(0))
    this.sprites.push(scene.add.image(164, 450, 'line_v_1').setAlpha(0))
    this.sprites.push(scene.add.image(142, 278, 'line_h_1').setAlpha(0))
    this.sprites.push(scene.add.image(142, 488, 'line_h_1').setAlpha(0))
    this.sprites.push(scene.add.image(142, 320, 'line_h_2').setAlpha(0))
    this.sprites.push(scene.add.image(142, 362, 'line_h_2').setAlpha(0))
    this.sprites.push(scene.add.image(142, 404, 'line_h_2').setAlpha(0))
    this.sprites.push(scene.add.image(142, 446, 'line_h_2').setAlpha(0))
  }

  show(): void {
    this.sprites.forEach(s =>
      this.scene.tweens.add({ targets: s, alpha: 1, duration: 200 })
    )
  }
  hide(): void {
    this.sprites.forEach(s =>
      this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
    )
  }
  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class GuidesSprites {
  private scene: Phaser.Scene
  private reachSprites: Phaser.GameObjects.Image[] = []
  private modSprites: Phaser.GameObjects.Image[] = []

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 11; i++) {
      const a = String.fromCharCode(97 + i)
      this.reachSprites.push(
        scene.add.image(x, y, `guide_reach_${a}`).setAlpha(0)
      )
    }
    this.modSprites.push(scene.add.image(x, y, 'guide_mod_a').setAlpha(0))
    this.modSprites.push(scene.add.image(x, y, 'guide_mod_f').setAlpha(0))
    this.modSprites.push(scene.add.image(x, y, 'guide_mod_i').setAlpha(0))
  }

  show(guide: string): void {
    if (guide >= 'a' && guide <= 'k') {
      this.scene.tweens.add({
        targets: this.reachSprites[guide.charCodeAt(0) - 97],
        alpha: 1,
        duration: 200,
      })
    } else if (guide === 'mod') {
      this.scene.tweens.add({
        targets: this.modSprites[0],
        alpha: 1,
        duration: 50,
      })
      this.scene.tweens.add({
        targets: this.modSprites[1],
        alpha: 1,
        duration: 50,
        delay: 400,
      })
      this.scene.tweens.add({
        targets: this.modSprites[2],
        alpha: 1,
        duration: 50,
        delay: 800,
      })
    }
  }

  hide(): void {
    this.reachSprites.forEach(s =>
      this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
    )
    this.modSprites.forEach(s =>
      this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
    )
  }

  remove(): void {
    this.reachSprites.forEach(s => s.destroy())
    this.modSprites.forEach(s => s.destroy())
    this.reachSprites = []
    this.modSprites = []
  }
}

export class ModsSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 11; i++) {
      let sx: number, sy: number
      if (i <= 4) {
        sx = x - 100
        sy = y - 82 + 42 * i
      } else if (i <= 7) {
        sx = x + 72
        sy = y - 128 + 47 * (i - 5)
      } else {
        sx = x + 72
        sy = y + 38 + 47 * (i - 8)
      }
      this.sprites.push(scene.add.image(sx, sy, 'mod_n_0').setAlpha(0))
    }
  }

  redraw(mods: number[]): void {
    this.sprites.forEach((s, i) => {
      s.setTexture(`mod_n_${mods[i]}`)
      s.setAlpha(0)
    })
    for (let i = 0; i <= 4; i++)
      this.scene.tweens.add({
        targets: this.sprites[i],
        alpha: 1,
        duration: 50,
      })
    for (let i = 5; i <= 7; i++)
      this.scene.tweens.add({
        targets: this.sprites[i],
        alpha: 1,
        duration: 50,
        delay: 400,
      })
    for (let i = 8; i <= 10; i++)
      this.scene.tweens.add({
        targets: this.sprites[i],
        alpha: 1,
        duration: 50,
        delay: 800,
      })
  }

  hide(): void {
    this.sprites.forEach(s =>
      this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
    )
  }
  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class AlphabetsSprites {
  private scene: Phaser.Scene
  private spriteGroup: Phaser.GameObjects.Image[][] = []
  private lineSprite: Phaser.GameObjects.Image

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 11; i++) {
      const a = String.fromCharCode(97 + i)
      const yPos = y + 42 * i
      this.spriteGroup.push([
        scene.add.image(x, yPos, `alphabet_${a}`).setAlpha(0),
        scene.add
          .image(x + 28, yPos, 'dummy')
          .setDisplaySize(35, 35)
          .setAlpha(0),
        scene.add
          .image(x + 53, yPos, 'dummy')
          .setDisplaySize(35, 35)
          .setAlpha(0),
        scene.add
          .image(x + 78, yPos, 'dummy')
          .setDisplaySize(35, 35)
          .setAlpha(0),
        scene.add
          .image(x + 112, yPos, 'dummy')
          .setDisplaySize(30, 30)
          .setAlpha(0),
      ])
    }
    this.lineSprite = scene.add.image(x + 140, y + 445, 'line_h_3').setAlpha(0)
  }

  redraw(tuples: number[][], mods: number[]): void {
    this.spriteGroup.forEach((sprites, i) => {
      sprites[0].setAlpha(0)
      sprites[1]
        .setTexture(`gray_n_${tuples[i][0]}`)
        .setDisplaySize(35, 35)
        .setAlpha(0)
      sprites[2]
        .setTexture(`gray_n_${tuples[i][1]}`)
        .setDisplaySize(35, 35)
        .setAlpha(0)
      sprites[3]
        .setTexture(`gray_n_${tuples[i][2]}`)
        .setDisplaySize(35, 35)
        .setAlpha(0)
      sprites[4]
        .setTexture(`mod_n_${mods[i]}`)
        .setDisplaySize(30, 30)
        .setAlpha(0)
    })
    this.lineSprite.setAlpha(0)
    this.spriteGroup.forEach(sprites =>
      sprites.forEach(s =>
        this.scene.tweens.add({
          targets: s,
          alpha: 1,
          duration: 50,
          delay: 800,
        })
      )
    )
    this.scene.tweens.add({
      targets: this.lineSprite,
      alpha: 1,
      duration: 50,
      delay: 800,
    })
  }

  hide(): void {
    this.spriteGroup.forEach(sprites =>
      sprites.forEach(s =>
        this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
      )
    )
    this.scene.tweens.add({ targets: this.lineSprite, alpha: 0, duration: 50 })
  }

  remove(): void {
    this.spriteGroup.forEach(sprites => sprites.forEach(s => s.destroy()))
    this.spriteGroup = []
    if (this.lineSprite) this.lineSprite.destroy()
  }
}

export class ScoresSprites {
  private scene: Phaser.Scene
  private spriteGroup: Phaser.GameObjects.Image[][] = []

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 11; i++) {
      this.spriteGroup.push([
        scene.add.image(x, y + 42 * i, 'dummy').setAlpha(0),
        scene.add.image(x + 85, y + 42 * i, 'dummy').setAlpha(0),
      ])
    }
  }

  redraw(scores: Score[], revolution: boolean): void {
    this.spriteGroup.forEach((sprites, i) => {
      const score = scores[i]
      let rollImage = 'roll_buta',
        oddsImage = 'dummy'
      if (score.won && typeof score.roll !== 'string') {
        rollImage = `roll_${score.roll.name}`
        let odds =
          score.roll.odds ||
          score.roll.calcGain(score.sum || 0, score.tuple, score.mod)
        if (score.roll.f === 'multi' && revolution) odds *= -1
        oddsImage = `odds_${score.roll.f}_${odds}`
      }
      sprites[0].setTexture(rollImage).setAlpha(0)
      sprites[1].setTexture(oddsImage).setAlpha(0)
    })

    this.spriteGroup.forEach((sprites, i) => {
      const score = scores[i]
      let delay = 1000
      if (score.won && typeof score.roll !== 'string') {
        const step = getStep(score)
        if (step === 'me') delay = 0
        else if (step === 'kabu') delay = 500
      }
      this.scene.tweens.add({
        targets: sprites[0],
        alpha: 1,
        duration: 50,
        delay,
      })
      this.scene.tweens.add({
        targets: sprites[1],
        alpha: 1,
        duration: 50,
        delay,
      })
    })
  }

  hide(): void {
    this.spriteGroup.forEach(sprites =>
      sprites.forEach(s =>
        this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
      )
    )
  }

  remove(): void {
    this.spriteGroup.forEach(sprites => sprites.forEach(s => s.destroy()))
    this.spriteGroup = []
  }
}

export class ComboSprites {
  private scene: Phaser.Scene
  private comboSprite: Phaser.GameObjects.Image
  private textSprite: Phaser.GameObjects.Image

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.comboSprite = scene.add.image(x + 39, y + 12, 'dummy').setAlpha(0)
    this.textSprite = scene.add.image(x, y, 'text_combo').setAlpha(0)
  }

  redraw(iCombo: number): void {
    this.comboSprite
      .setTexture(`odds_multi_${Math.min(iCombo, 10)}`)
      .setAlpha(0)
    this.textSprite.setAlpha(0)
    this.scene.tweens.add({
      targets: this.textSprite,
      alpha: 1,
      duration: 50,
      delay: 1500,
    })
    this.scene.tweens.add({
      targets: this.comboSprite,
      alpha: 1,
      duration: 50,
      delay: 1500,
    })
  }

  hide(): void {
    this.scene.tweens.add({ targets: this.textSprite, alpha: 0, duration: 50 })
    this.scene.tweens.add({ targets: this.comboSprite, alpha: 0, duration: 50 })
  }

  remove(): void {
    this.textSprite?.destroy()
    this.comboSprite?.destroy()
  }
}

export class CurrentScoreSprites {
  private scene: Phaser.Scene
  private meSprites: Phaser.GameObjects.Image[] = []
  private kabuSprites: Phaser.GameObjects.Image[] = []
  private multiSprites: Phaser.GameObjects.Image[] = []
  private comboSprites: Phaser.GameObjects.Image[] = []

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 8; i++) {
      const sx = x - 70 * 0.7 * (8 - i)
      this.meSprites.push(scene.add.image(sx, y, 'dummy').setAlpha(0))
      this.kabuSprites.push(scene.add.image(sx, y, 'dummy').setAlpha(0))
      this.multiSprites.push(scene.add.image(sx, y, 'dummy').setAlpha(0))
      this.comboSprites.push(scene.add.image(sx, y, 'dummy').setAlpha(0))
    }
  }

  redraw(currentScores: number[]): void {
    this.setDigits(this.meSprites, currentScores[0])
    this.setDigits(this.kabuSprites, currentScores[1])
    this.setDigits(this.multiSprites, currentScores[2])
    this.setDigits(this.comboSprites, currentScores[3])
    this.show(currentScores)
  }

  private setDigits(sprites: Phaser.GameObjects.Image[], value: number): void {
    const digits = String(value).split('')
    const startI = 8 - digits.length
    sprites.forEach((s, i) => {
      if (i < startI) {
        s.setTexture('dummy')
      } else {
        s.setTexture(`fude_n_${digits[i - startI]}`)
        s.setDisplaySize(70, 70)
        s.setAlpha(0)
      }
    })
  }

  private show(currentScores: number[]): void {
    this.meSprites.forEach(s => {
      this.scene.tweens.add({
        targets: s,
        alpha: 1,
        duration: 50,
        onComplete: () =>
          this.scene.time.delayedCall(500, () =>
            this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
          ),
      })
    })
    this.kabuSprites.forEach(s => {
      this.scene.tweens.add({
        targets: s,
        alpha: 1,
        duration: 50,
        delay: 500,
        onComplete: () =>
          this.scene.time.delayedCall(500, () =>
            this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
          ),
      })
    })
    if (currentScores[3] !== currentScores[2]) {
      this.multiSprites.forEach(s => {
        this.scene.tweens.add({
          targets: s,
          alpha: 1,
          duration: 50,
          delay: 1000,
          onComplete: () =>
            this.scene.time.delayedCall(500, () =>
              this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
            ),
        })
      })
      this.comboSprites.forEach(s =>
        this.scene.tweens.add({
          targets: s,
          alpha: 1,
          duration: 50,
          delay: 1500,
        })
      )
    } else {
      this.multiSprites.forEach(s =>
        this.scene.tweens.add({
          targets: s,
          alpha: 1,
          duration: 50,
          delay: 1000,
        })
      )
    }
  }

  hide(): void {
    ;[
      this.meSprites,
      this.kabuSprites,
      this.multiSprites,
      this.comboSprites,
    ].forEach(g =>
      g.forEach(s =>
        this.scene.tweens.add({ targets: s, alpha: 0, duration: 50 })
      )
    )
  }

  remove(): void {
    ;[
      this.meSprites,
      this.kabuSprites,
      this.multiSprites,
      this.comboSprites,
    ].forEach(g => g.forEach(s => s.destroy()))
    this.meSprites = []
    this.kabuSprites = []
    this.multiSprites = []
    this.comboSprites = []
  }
}

export class TotalScoreSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 8; i++)
      this.sprites.push(
        scene.add.image(x + 100 * 0.7 * i, y, 'dummy').setAlpha(0)
      )
  }

  redraw(totalScore: number): void {
    const digits = String(totalScore).split('')
    this.sprites.forEach((s, i) => {
      s.setTexture(i < digits.length ? `fude_n_${digits[i]}` : 'dummy')
      this.scene.tweens.add({ targets: s, alpha: 1, duration: 100 })
    })
  }

  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class TimeSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 8; i++)
      this.sprites.push(
        scene.add.image(x + 50 * 0.7 * i, y, 'dummy').setAlpha(0)
      )
  }

  redraw(time: number): void {
    const h = Math.floor(time / 3600)
    const m = Math.floor(time / 60) % 60
    const s = time % 60
    const str =
      ('00' + h).slice(-2) +
      'c' +
      ('00' + m).slice(-2) +
      'c' +
      ('00' + s).slice(-2)
    const digits = str.split('')
    this.sprites.forEach((sp, i) => {
      if (i < digits.length) {
        sp.setTexture(`fude_n_${digits[i]}`)
        sp.setDisplaySize(50, 50)
      } else sp.setTexture('dummy')
      this.scene.tweens.add({ targets: sp, alpha: 1, duration: 100 })
    })
  }

  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class BetTimesSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 8; i++)
      this.sprites.push(
        scene.add.image(x + 50 * 0.7 * i, y, 'dummy').setAlpha(0)
      )
  }

  redraw(betTimes: number): void {
    const digits = String(betTimes).split('')
    this.sprites.forEach((sp, i) => {
      if (i < digits.length) {
        sp.setTexture(`fude_n_${digits[i]}`)
        sp.setDisplaySize(50, 50)
      } else sp.setTexture('dummy')
      this.scene.tweens.add({ targets: sp, alpha: 1, duration: 100 })
    })
  }

  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class ResultSprites {
  private scene: Phaser.Scene
  private bgSprite: Phaser.GameObjects.Image
  private ruleSprite: Phaser.GameObjects.Image
  private highScoreSprite: Phaser.GameObjects.Image
  private scoreText: Phaser.GameObjects.Text
  private timeText: Phaser.GameObjects.Text
  private betTimesText: Phaser.GameObjects.Text
  private rankText: Phaser.GameObjects.Text
  private maxComboText: Phaser.GameObjects.Text
  private maxGainText: Phaser.GameObjects.Text
  private averageGainText: Phaser.GameObjects.Text
  private rollTexts: Map<string, Phaser.GameObjects.Text> = new Map()
  private zoneTexts: Map<string, Phaser.GameObjects.Text> = new Map()
  private tripleSevenTexts: Map<string, Phaser.GameObjects.Text> = new Map()
  private eggAmbulanceText: Phaser.GameObjects.Text
  private buttonChangeRule: Phaser.GameObjects.Image
  private buttonOneMore: Phaser.GameObjects.Image
  private allElements: (Phaser.GameObjects.Image | Phaser.GameObjects.Text)[] =
    []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    const ts: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '21px',
      color: '#ffffff',
    }

    this.bgSprite = scene.add.image(320, 480, 'bg_result').setAlpha(0)
    this.ruleSprite = scene.add.image(320, 200, 'dummy').setAlpha(0)
    this.highScoreSprite = scene.add
      .image(550, 400, 'high_score')
      .setDisplaySize(400, 400)
      .setAlpha(0)
    this.scoreText = scene.add.text(120, 280, '', ts).setAlpha(0)
    this.timeText = scene.add.text(320, 280, '', ts).setAlpha(0)
    this.betTimesText = scene.add.text(420, 280, '', ts).setAlpha(0)
    this.rankText = scene.add.text(320, 310, '', ts).setAlpha(0)
    const ls1 = scene.add.image(320, 320, 'line_h_3').setAlpha(0)
    this.maxComboText = scene.add.text(120, 340, '', ts).setAlpha(0)
    this.maxGainText = scene.add.text(320, 340, '', ts).setAlpha(0)
    this.averageGainText = scene.add.text(420, 340, '', ts).setAlpha(0)
    const ls2 = scene.add.image(320, 360, 'line_h_3').setAlpha(0)

    const rollNames1 = [
      'pinzoro',
      'arashikabu',
      'kemono',
      'triple_seven',
      'zorome',
      'shigoro',
      'hifumi',
    ]
    rollNames1.forEach((n, idx) =>
      this.rollTexts.set(
        n,
        scene.add.text(200 + idx * 50, 380, '', ts).setAlpha(0)
      )
    )
    const rollNames2 = [
      'pinbasami',
      'me',
      'pin',
      'nizou',
      'santa',
      'yotsuya',
      'goke',
    ]
    rollNames2.forEach((n, idx) =>
      this.rollTexts.set(
        n,
        scene.add.text(200 + idx * 50, 410, '', ts).setAlpha(0)
      )
    )
    const rollNames3 = [
      'roppou',
      'shichiken',
      'oicho',
      'kabu',
      'pink_ribbon',
      'buta',
    ]
    rollNames3.forEach((n, idx) =>
      this.rollTexts.set(
        n,
        scene.add.text(200 + idx * 50, 440, '', ts).setAlpha(0)
      )
    )

    const ls3 = scene.add.image(320, 470, 'line_h_3').setAlpha(0)
    this.zoneTexts.set(
      'bullet_time',
      scene.add.text(200, 490, '', ts).setAlpha(0)
    )
    this.zoneTexts.set(
      'revolution',
      scene.add.text(400, 490, '', ts).setAlpha(0)
    )
    ;['all_1', 'all_6', 'all_123', 'all_456'].forEach((n, i) =>
      this.tripleSevenTexts.set(
        n,
        scene.add.text(200 + i * 100, 520, '', ts).setAlpha(0)
      )
    )
    ;['triplets', 'others', 'rollback'].forEach((n, i) =>
      this.tripleSevenTexts.set(
        n,
        scene.add.text(200 + i * 100, 550, '', ts).setAlpha(0)
      )
    )
    this.eggAmbulanceText = scene.add.text(500, 550, '', ts).setAlpha(0)

    this.buttonChangeRule = scene.add
      .image(170, 770, 'button_change_rule')
      .setAlpha(0)
      .setInteractive()
    this.buttonOneMore = scene.add
      .image(320, 770, 'button_one_more')
      .setAlpha(0)
      .setInteractive()

    this.allElements = [
      this.bgSprite,
      this.ruleSprite,
      this.highScoreSprite,
      this.scoreText,
      this.timeText,
      this.betTimesText,
      this.rankText,
      ls1,
      this.maxComboText,
      this.maxGainText,
      this.averageGainText,
      ls2,
      ...this.rollTexts.values(),
      ls3,
      ...this.zoneTexts.values(),
      ...this.tripleSevenTexts.values(),
      this.eggAmbulanceText,
      this.buttonChangeRule,
      this.buttonOneMore,
    ]
  }

  redraw(
    rule: RuleType,
    elapsedTime: number,
    betTimes: number,
    totalScore: number,
    stats: GameStats,
    isHighScore: boolean
  ): void {
    this.ruleSprite.setTexture(rule).setAlpha(0)
    this.scoreText.setText(String(totalScore))

    const second = Math.floor(elapsedTime / 1000)
    const time = getTime(rule, second)
    const h = Math.floor(time / 3600),
      m = Math.floor(time / 60) % 60,
      s = time % 60,
      ms = elapsedTime % 1000
    this.timeText.setText(
      ('00' + h).slice(-2) +
        ':' +
        ('00' + m).slice(-2) +
        ':' +
        ('00' + s).slice(-2) +
        '.' +
        ('000' + ms).slice(-3)
    )
    this.betTimesText.setText(String(betTimes))
    this.maxComboText.setText(String(stats.max_combo))
    this.maxGainText.setText(String(stats.max_gain))
    this.averageGainText.setText(
      String(Math.floor((totalScore / betTimes) * 10) / 10)
    )

    for (const [n, t] of this.rollTexts) t.setText(String(stats.roll[n] || 0))
    for (const [n, t] of this.zoneTexts) t.setText(String(stats.zone[n] || 0))
    for (const [n, t] of this.tripleSevenTexts)
      t.setText(String(stats.triple_seven[n] || 0))
    this.eggAmbulanceText.setText(String(stats.egg.ambulance || 0))

    this.show(isHighScore)
  }

  private show(isHighScore: boolean): void {
    this.allElements.forEach(el =>
      this.scene.tweens.add({ targets: el, alpha: 1, duration: 200 })
    )
    if (isHighScore) {
      this.scene.tweens.add({
        targets: this.highScoreSprite,
        rotation: Phaser.Math.DegToRad(-30),
        duration: 1000,
        ease: 'Expo.easeOut',
      })
      this.scene.tweens.add({
        targets: this.highScoreSprite,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 1000,
        ease: 'Expo.easeOut',
      })
      this.scene.tweens.add({
        targets: this.highScoreSprite,
        x: this.highScoreSprite.x - 100,
        y: this.highScoreSprite.y - 100,
        duration: 1000,
        ease: 'Expo.easeOut',
      })
      this.scene.tweens.add({
        targets: this.highScoreSprite,
        alpha: 0.8,
        duration: 1200,
        ease: 'Expo.easeOut',
      })
    }
  }

  hide(): void {
    this.allElements.forEach(el =>
      this.scene.tweens.add({ targets: el, alpha: 0, duration: 50 })
    )
  }
  remove(): void {
    this.allElements.forEach(el => el.destroy())
    this.allElements = []
  }
  getButtonChangeRule(): Phaser.GameObjects.Image {
    return this.buttonChangeRule
  }
  getButtonOneMore(): Phaser.GameObjects.Image {
    return this.buttonOneMore
  }
}

function getStep(score: Score): 'me' | 'kabu' | 'multi' {
  if (typeof score.roll === 'string') return 'kabu'
  const roll = score.roll
  if (roll.f === 'add' && roll.name !== 'pink_ribbon') {
    const kabuRolls = [
      'pin',
      'nizou',
      'santa',
      'yotsuya',
      'goke',
      'roppou',
      'shichiken',
      'oicho',
      'kabu',
    ]
    return kabuRolls.includes(roll.name) ? 'kabu' : 'me'
  }
  return 'multi'
}

function getTime(rule: RuleType, iSecond1: number): number {
  let left = 0
  switch (rule) {
    case 'rule_1_2943':
      left = 2943 - iSecond1
      break
    case 'rule_1_8390':
      left = 8390 - iSecond1
      break
    case 'rule_1_37654':
      left = 37654 - iSecond1
      break
    case 'rule_2_2943':
      left = 2943 - iSecond1
      break
    case 'rule_2_8390':
      left = 8390 - iSecond1
      break
    case 'rule_2_37654':
      left = 37654 - iSecond1
      break
    case 'rule_3_0409':
    case 'rule_3_2009':
    case 'rule_3_6819':
      left = iSecond1
      break
  }
  return left < 0 ? 0 : left
}
