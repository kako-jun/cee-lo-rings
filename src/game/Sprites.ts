// Complete sprite classes ported from Phina.js to Phaser 3
// Original: phinajs/assets/js/sprites.js

import Phaser from 'phaser'
import type { MainScene } from './MainScene'
import type { Score } from './rule'

/**
 * RingSprites - Manages rotating ring/slot display
 * Original: Lines 1024-1197 in sprites.js
 */
export class RingSprites {
  private scene: MainScene
  private sprites: Phaser.GameObjects.Image[] = []
  private x: number
  private y: number
  private position: 'left' | 'center' | 'right'
  private basicAlpha: number = 1
  public eyes: number[] = []

  constructor(
    scene: MainScene,
    x: number,
    y: number,
    position: 'left' | 'center' | 'right'
  ) {
    this.scene = scene
    this.x = x
    this.y = y
    this.position = position
  }

  redraw(ns: number[], color: string): void {
    // Remove old sprites
    this.sprites.forEach(sprite => sprite.destroy())
    this.sprites = []

    // Create 40 sprites for infinite scroll effect (4 sets of 10)
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

    // Adjust alpha for zone effect
    if (isZone) {
      this.basicAlpha = 0.5
      this.sprites.forEach(sprite => this.transform(sprite))
    }
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
    const ringPattern = this.calcRingPattern()

    // Top fade-in zone (-40 to 200)
    if (sprite.y >= -40 && sprite.y <= 200) {
      const delta = (sprite.y + 40) / 240
      sprite.alpha = delta * this.basicAlpha
      sprite.x =
        this.x + (1 - delta) * (1 - delta) * 100 * ringPattern.top.xRatio
      sprite.displayWidth =
        42 * ringPattern.top.widthRatio -
        (42 * ringPattern.top.widthRatio - 42) * delta
    }
    // Bottom fade-out zone (700 to 1000)
    else if (sprite.y >= 700 && sprite.y <= 1000) {
      const delta = (300 - (1000 - sprite.y)) / 300
      sprite.alpha = (1 - delta) * this.basicAlpha
      sprite.x = this.x + delta * delta * 100 * ringPattern.bottom.xRatio
      sprite.displayWidth =
        42 + (42 * ringPattern.bottom.widthRatio - 42) * delta
    }
    // Middle zone (normal)
    else {
      sprite.alpha = this.basicAlpha
      sprite.x = this.x
      sprite.displayWidth = 42
    }
  }

  private calcRingPattern(): {
    top: { xRatio: number; widthRatio: number }
    bottom: { xRatio: number; widthRatio: number }
  } {
    // Calculate perspective ratios based on ring position
    if (this.position === 'left') {
      return {
        top: { xRatio: -1, widthRatio: 0.5 },
        bottom: { xRatio: 1, widthRatio: 1.5 },
      }
    } else if (this.position === 'center') {
      return {
        top: { xRatio: 0, widthRatio: 0.7 },
        bottom: { xRatio: 0, widthRatio: 1.3 },
      }
    } else {
      // right
      return {
        top: { xRatio: 1, widthRatio: 0.5 },
        bottom: { xRatio: -1, widthRatio: 1.5 },
      }
    }
  }

  hide(): void {
    this.sprites.forEach(sprite => sprite.setAlpha(0))
  }

  show(): void {
    this.sprites.forEach(sprite => this.transform(sprite))
  }
}

/**
 * BackgroundSprites - Animated background with rotation, scale, position
 * Original: Lines 560-602 in sprites.js
 */
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

  private startAnime(): void {
    // Animation 1: Rotation oscillation
    this.createRotationAnimation()

    // Animation 2: Scale pulsing
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 40000,
      ease: 'Quad.easeInOut',
      yoyo: true,
      repeat: -1,
    })

    // Animation 3: Position movement (square pattern)
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
        onComplete: () => {
          doRotation((index + 1) % rotations.length)
        },
      })
    }
    doRotation(0)
  }

  private createPositionAnimation(): void {
    const baseX = 320
    const baseY = 480
    const movements = [
      { x: baseX - 50, y: baseY, duration: 10000 },
      { x: baseX - 50, y: baseY - 50, duration: 10000 },
      { x: baseX, y: baseY - 50, duration: 10000 },
      { x: baseX, y: baseY, duration: 10000 },
    ]

    const doMove = (index: number) => {
      const move = movements[index]
      this.scene.tweens.add({
        targets: this.sprite,
        x: move.x,
        y: move.y,
        duration: move.duration,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          doMove((index + 1) % movements.length)
        },
      })
    }
    doMove(0)
  }
}

/**
 * KanjiSprites - Japanese character decoration with complex animations
 * Original: Lines 604-681 in sprites.js
 */
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
    // Animation 1: Rotation with bounce
    this.createRotationAnimation()

    // Animation 2: Scale pulsing
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 2, to: 3 },
      scaleY: { from: 2, to: 3 },
      duration: 20000,
      ease: 'Quad.easeInOut',
      yoyo: true,
      repeat: -1,
    })

    // Animation 3: Complex position path
    this.createPositionAnimation()

    // Animation 4: Opacity with image change
    this.createOpacityAnimation()
  }

  private createRotationAnimation(): void {
    const rotations = [
      { angle: 360, duration: 100000, ease: 'Back.easeInOut' },
      { angle: -360, duration: 120000, ease: 'Back.easeInOut' },
    ]

    const doRotation = (index: number) => {
      const rot = rotations[index]
      this.scene.tweens.add({
        targets: this.sprite,
        rotation: `+=${Phaser.Math.DegToRad(rot.angle)}`,
        duration: rot.duration,
        ease: rot.ease,
        onComplete: () => {
          doRotation((index + 1) % rotations.length)
        },
      })
    }
    doRotation(0)
  }

  private createPositionAnimation(): void {
    const movements = [
      { x: 200, y: -100, duration: 14000 },
      { x: -100, y: -200, duration: 14000 },
      { x: 150, y: -100, duration: 14000 },
      { x: -100, y: -200, duration: 14000 },
      { x: 300, y: -300, duration: 14000 },
      { x: -450, y: -200, duration: 14000 },
      { x: 200, y: 100, duration: 14000 },
      { x: -100, y: 200, duration: 14000 },
      { x: 150, y: 100, duration: 14000 },
      { x: -100, y: 200, duration: 14000 },
      { x: 300, y: 300, duration: 14000 },
      { x: -450, y: 200, duration: 14000 },
    ]

    const doMove = (index: number) => {
      const move = movements[index]
      this.scene.tweens.add({
        targets: this.sprite,
        x: `+=${move.x}`,
        y: `+=${move.y}`,
        duration: move.duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          doMove((index + 1) % movements.length)
        },
      })
    }
    doMove(0)
  }

  private createOpacityAnimation(): void {
    const sequence = () => {
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
                      onComplete: sequence,
                    })
                  })
                },
              })
            },
          })
        },
      })
    }
    sequence()
  }
}

/**
 * MonSprites - Decorative emblem with elastic animations
 * Original: Lines 683-760 in sprites.js
 */
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
    // Animation 1: Rotation with elastic easing
    this.createRotationAnimation()

    // Animation 2: Scale pulsing
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 5000,
      ease: 'Quad.easeInOut',
      yoyo: true,
      repeat: -1,
    })

    // Animation 3: Position movement
    this.createPositionAnimation()

    // Animation 4: Opacity with image change
    this.createOpacityAnimation()
  }

  private createRotationAnimation(): void {
    const rotations = [
      { angle: 360, duration: 10000, ease: 'Elastic.easeInOut' },
      { angle: -360, duration: 10000, ease: 'Elastic.easeInOut' },
    ]

    const doRotation = (index: number) => {
      const rot = rotations[index]
      this.scene.tweens.add({
        targets: this.sprite,
        rotation: `+=${Phaser.Math.DegToRad(rot.angle)}`,
        duration: rot.duration,
        ease: rot.ease,
        onComplete: () => {
          doRotation((index + 1) % rotations.length)
        },
      })
    }
    doRotation(0)
  }

  private createPositionAnimation(): void {
    const movements = [
      { x: -200, y: 100, duration: 10000 },
      { x: 100, y: 200, duration: 10000 },
      { x: -150, y: 100, duration: 10000 },
      { x: 100, y: 200, duration: 10000 },
      { x: -300, y: 300, duration: 10000 },
      { x: 450, y: 200, duration: 10000 },
      { x: -200, y: -100, duration: 10000 },
      { x: 100, y: -200, duration: 10000 },
      { x: -150, y: -100, duration: 10000 },
      { x: 100, y: -200, duration: 10000 },
      { x: -300, y: -300, duration: 10000 },
      { x: 450, y: -200, duration: 10000 },
    ]

    const doMove = (index: number) => {
      const move = movements[index]
      this.scene.tweens.add({
        targets: this.sprite,
        x: `+=${move.x}`,
        y: `+=${move.y}`,
        duration: move.duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          doMove((index + 1) % movements.length)
        },
      })
    }
    doMove(0)
  }

  private createOpacityAnimation(): void {
    const sequence = () => {
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
                      onComplete: sequence,
                    })
                  })
                },
              })
            },
          })
        },
      })
    }
    sequence()
  }
}

/**
 * ScoresSprites - Display roll names and odds with staggered timing
 * Original: Lines 1573-1679 in sprites.js
 */
export class ScoresSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []
  private x: number
  private y: number

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.x = x
    this.y = y
  }

  show(scores: Score[]): void {
    // Clear previous sprites
    this.hide()

    let yOffset = 0
    scores.forEach(score => {
      if (typeof score.roll === 'string' || !score.roll.won) return

      const roll = score.roll

      // Determine step for timing based on rule
      // Kabu rolls: pin, nizou, santa, yotsuya, goke, roppou, shichiken, oicho, kabu
      // Me rolls: me, pinbasami
      const kabuRollNames = [
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

      let delay = 0
      if (roll.f === 'add' && roll.name !== 'pink_ribbon') {
        if (kabuRollNames.includes(roll.name)) {
          delay = 500 // kabu step
        } else {
          delay = 0 // me step
        }
      } else {
        delay = 1000 // multi step
      }

      // Roll name sprite
      const rollSprite = this.scene.add.image(
        this.x,
        this.y + yOffset,
        `roll_${roll.name}`
      )
      rollSprite.setAlpha(0)
      this.sprites.push(rollSprite)

      this.scene.tweens.add({
        targets: rollSprite,
        alpha: 1,
        duration: 50,
        delay: delay,
      })

      // Odds sprite
      const oddsType = roll.f === 'multi' ? 'multi' : 'add'
      const oddsValue = roll.odds || 0
      const oddsSprite = this.scene.add.image(
        this.x + 40,
        this.y + yOffset,
        `odds_${oddsType}_${oddsValue}`
      )
      oddsSprite.setAlpha(0)
      this.sprites.push(oddsSprite)

      this.scene.tweens.add({
        targets: oddsSprite,
        alpha: 1,
        duration: 50,
        delay: delay,
      })

      yOffset += 40
    })
  }

  hide(): void {
    this.sprites.forEach(sprite => sprite.destroy())
    this.sprites = []
  }
}

/**
 * CurrentScoreSprites - Display current scores with sequential fade animations
 * Original: Lines 1809-1956 in sprites.js
 */
export class CurrentScoreSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []
  private x: number
  private y: number

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.x = x
    this.y = y
  }

  show(currentScores: number[]): void {
    // Clear previous sprites
    this.hide()

    // Me score (currentScores[0])
    if (currentScores[0] > 0) {
      this.displayScore(currentScores[0], 0, 50, 500)
    }

    // Kabu score (currentScores[1])
    if (currentScores[1] > currentScores[0]) {
      this.displayScore(currentScores[1], 500, 50, 500)
    }

    // Multi score (currentScores[2])
    if (currentScores[2] > currentScores[1]) {
      if (currentScores[3] !== currentScores[2]) {
        // Has combo - fade out after 500ms
        this.displayScore(currentScores[2], 1000, 50, 500)
      } else {
        // No combo - stay visible
        this.displayScore(currentScores[2], 1000, 50, 0)
      }
    }

    // Combo score (currentScores[3]) - if different from multi
    if (currentScores[3] !== currentScores[2]) {
      this.displayScore(currentScores[3], 1500, 0, 0)
    }
  }

  private displayScore(
    score: number,
    delay: number,
    fadeInDuration: number,
    waitBeforeFadeOut: number
  ): void {
    const digits = score.toString().replace('-', '').split('')
    let xOffset = 0

    if (score < 0) {
      const minusSprite = this.scene.add.image(
        this.x + xOffset,
        this.y,
        'fude_n_-'
      )
      minusSprite.setAlpha(0)
      this.sprites.push(minusSprite)

      this.scene.tweens.add({
        targets: minusSprite,
        alpha: 1,
        duration: fadeInDuration,
        delay: delay,
        onComplete: () => {
          if (waitBeforeFadeOut > 0) {
            this.scene.time.delayedCall(waitBeforeFadeOut, () => {
              this.scene.tweens.add({
                targets: minusSprite,
                alpha: 0,
                duration: 50,
              })
            })
          }
        },
      })

      xOffset += 20
    }

    digits.forEach(digit => {
      const digitSprite = this.scene.add.image(
        this.x + xOffset,
        this.y,
        `fude_n_${digit}`
      )
      digitSprite.setAlpha(0)
      this.sprites.push(digitSprite)

      this.scene.tweens.add({
        targets: digitSprite,
        alpha: 1,
        duration: fadeInDuration,
        delay: delay,
        onComplete: () => {
          if (waitBeforeFadeOut > 0) {
            this.scene.time.delayedCall(waitBeforeFadeOut, () => {
              this.scene.tweens.add({
                targets: digitSprite,
                alpha: 0,
                duration: 50,
              })
            })
          }
        },
      })

      xOffset += 20
    })
  }

  hide(): void {
    this.sprites.forEach(sprite => sprite.destroy())
    this.sprites = []
  }
}

/**
 * TotalScoreSprites - Display total score with brush calligraphy digits
 * Original: Lines 2009-2022 in sprites.js
 */
export class TotalScoreSprites {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []
  private x: number
  private y: number

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.x = x
    this.y = y
  }

  redraw(totalScore: number): void {
    // Clear previous sprites
    this.sprites.forEach(sprite => sprite.destroy())
    this.sprites = []

    const digits = totalScore.toString().split('')
    let xOffset = -(digits.length * 20) / 2

    digits.forEach(digit => {
      const sprite = this.scene.add.image(
        this.x + xOffset,
        this.y,
        `fude_n_${digit}`
      )
      sprite.setAlpha(0)
      this.sprites.push(sprite)

      this.scene.tweens.add({
        targets: sprite,
        alpha: 1,
        duration: 100,
      })

      xOffset += 20
    })
  }
}
