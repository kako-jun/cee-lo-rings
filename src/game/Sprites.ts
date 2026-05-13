import { Assets, Sprite, Text, type Container, type TextStyle } from 'pixi.js'
import type { Score, GameStats, RuleType } from './rule'
import { Scene } from './Scene'
import type { MainScene } from './MainScene'

const DEG = Math.PI / 180

function addImage(
  parent: Container,
  x: number,
  y: number,
  key: string
): Sprite {
  const s = new Sprite(Assets.get(key))
  s.anchor.set(0.5)
  s.position.set(x, y)
  parent.addChild(s)
  return s
}

function setTexture(sprite: Sprite, key: string): void {
  sprite.texture = Assets.get(key)
}

function setDisplaySize(sprite: Sprite, w: number, h: number): void {
  sprite.width = w
  sprite.height = h
}

interface RingSprite extends Sprite {
  __n: number
  __initialY: number
  __index: number
}

interface RingPattern {
  top: { xRatio: number; widthRatio: number }
  bottom: { xRatio: number; widthRatio: number }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** RingSprites - rotating slot reels with quasi-3D perspective. */
export class RingSprites {
  private scene: MainScene
  private sprites: RingSprite[] = []
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

  private position: 'left' | 'center' | 'right'

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
    this.ringPattern = { ...this.ringPatternNew }
    this.ringPatternOld = { ...this.ringPattern }
  }

  redraw(ns: number[], color: string): void {
    this.ns = ns
    this.color = color

    this.sprites.forEach(s => s.destroy())
    this.sprites = []

    for (let i = 0; i < 40; i++) {
      const i2 = i % 10
      const n = ns[i2]

      let yOffset = 0
      if (i < 10) yOffset = -42 * 10 + 42 * i
      else if (i < 20) yOffset = 42 * (i - 10)
      else if (i < 30) yOffset = 42 * 10 + 42 * (i - 20)
      else yOffset = 42 * 20 + 42 * (i - 30)

      const sprite = addImage(
        this.scene,
        this.x,
        this.y + yOffset,
        `${color}_n_${n}`
      ) as RingSprite
      sprite.__n = n
      sprite.__initialY = this.y + yOffset
      sprite.__index = i
      sprite.alpha = 0

      this.sprites.push(sprite)
    }

    this.show()
  }

  rotate(speed: number): void {
    this.sprites.forEach((sprite, i) => {
      sprite.y -= speed
      const initialY = this.getInitialY(i)
      if (sprite.y <= initialY - 42 * 10) sprite.y = initialY
      this.transform(sprite)
    })
  }

  /**
   * Brake the reel. All sprite tweens run in parallel and resolve via
   * Promise.all so the caller is woken precisely when every tween finishes,
   * instead of guessing the timing with a delayedCall.
   */
  async brake(_speed: number): Promise<void> {
    const tweens: ReturnType<typeof this.scene.tween>[] = []
    this.sprites.forEach((sprite, i) => {
      const initialY = this.getInitialY(i)
      const dy = sprite.y - initialY
      const dn = Math.floor(dy / 42)
      const destY = initialY + 42 * dn
      const destDy = destY - sprite.y
      const duration = 0.01 * Math.abs(destDy) // seconds (was 10ms/px)
      const tween = this.scene.tween(sprite, {
        y: destY,
        duration,
        ease: 'expo.out',
        onUpdate: () => this.transform(sprite),
      })
      tweens.push(tween)
    })
    await Promise.all(
      tweens.map(t => new Promise<void>(r => t.eventCallback('onComplete', r)))
    )
  }

  stop(isZone: boolean): void {
    const startY = this.y
    const endY = this.y + 42 * 10

    this.eyes = []
    this.sprites.forEach(sprite => {
      if (sprite.y >= startY && sprite.y < endY) this.eyes.push(sprite.__n)
    })

    if (isZone) {
      switch (this.position) {
        case 'left':
          this.scene.audio.playSound('voice_chin')
          break
        case 'center':
          this.scene.audio.playSound('voice_chiro')
          break
        case 'right':
          this.scene.audio.playSound('voice_rin')
          break
      }
      this.basicAlpha = 0.5
      this.sprites.forEach(s => this.transform(s))
    } else {
      this.scene.audio.playSound('se_stop')
    }
  }

  changeOpacity(mode: 'normal' | 'light'): void {
    this.basicAlpha = mode === 'normal' ? 1 : 0.2
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
    if (i < 10) return this.y - 42 * 10 + 42 * i
    if (i < 20) return this.y + 42 * (i - 10)
    if (i < 30) return this.y + 42 * 10 + 42 * (i - 20)
    return this.y + 42 * 20 + 42 * (i - 30)
  }

  private transform(sprite: Sprite): void {
    this.ringPattern = this.calcRingPattern()

    if (sprite.y >= -40 && sprite.y <= 200) {
      const delta = (sprite.y + 40) / 240
      sprite.alpha = delta * this.basicAlpha
      sprite.x =
        this.x + (1 - delta) * (1 - delta) * 100 * this.ringPattern.top.xRatio
      sprite.width =
        42 * this.ringPattern.top.widthRatio -
        (42 * this.ringPattern.top.widthRatio - 42) * delta
    } else if (sprite.y >= 700 && sprite.y <= 1000) {
      const delta = (300 - (1000 - sprite.y)) / 300
      sprite.alpha = (1 - delta) * this.basicAlpha
      sprite.x = this.x + delta * delta * 100 * this.ringPattern.bottom.xRatio
      sprite.width = 42 + (42 * this.ringPattern.bottom.widthRatio - 42) * delta
    } else {
      sprite.alpha = this.basicAlpha
      sprite.x = this.x
      sprite.width = 42
    }
  }

  private calcRingPattern(): RingPattern {
    if (this.transformed) return this.ringPattern

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
    this.sprites.forEach(s => this.scene.tween(s, { alpha: 0, duration: 0.05 }))
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
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class BackgroundSprites {
  private scene: Scene
  private sprite: Sprite

  constructor(scene: Scene) {
    this.scene = scene
    const bgIndex = Math.floor(Math.random() * 37) + 1
    this.sprite = addImage(scene, 320, 480, `bg_${bgIndex}`)
    this.sprite.alpha = 0.3
    this.sprite.zIndex = -10
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
    setTexture(this.sprite, `bg_${n}`)
    setDisplaySize(this.sprite, 960 * 1.2, 960 * 1.2)
    this.sprite.alpha = 0
    this.scene.tween(this.sprite, { alpha: 1, duration: 0.5 })
  }

  private startAnime(): void {
    this.createRotationAnimation()
    const doScale = () => {
      this.scene.tween(this.sprite.scale, {
        x: 1.5,
        y: 1.5,
        duration: 40,
        ease: 'quad.inOut',
        onComplete: () => {
          this.scene.tween(this.sprite.scale, {
            x: 1,
            y: 1,
            duration: 80,
            ease: 'quad.inOut',
            onComplete: doScale,
          })
        },
      })
    }
    doScale()
    this.createPositionAnimation()
  }

  private createRotationAnimation(): void {
    const rotations = [
      { delta: -60, duration: 80 },
      { delta: 90, duration: 80 },
      { delta: 60, duration: 40 },
      { delta: -90, duration: 40 },
    ]
    const doRotation = (index: number) => {
      const rot = rotations[index]
      this.scene.tween(this.sprite, {
        rotation: `+=${rot.delta * DEG}`,
        duration: rot.duration,
        ease: 'quad.inOut',
        onComplete: () => doRotation((index + 1) % rotations.length),
      })
    }
    doRotation(0)
  }

  private createPositionAnimation(): void {
    const movements = [
      { dx: -50, dy: 0, d: 10 },
      { dx: 0, dy: -50, d: 10 },
      { dx: 50, dy: 0, d: 10 },
      { dx: 0, dy: 50, d: 10 },
    ]
    const doMove = (index: number) => {
      const m = movements[index]
      this.scene.tween(this.sprite, {
        x: `+=${m.dx}`,
        y: `+=${m.dy}`,
        duration: m.d,
        ease: 'quad.inOut',
        onComplete: () => doMove((index + 1) % movements.length),
      })
    }
    doMove(0)
  }

  remove(): void {
    this.sprite?.destroy()
  }
}

export class KanjiSprites {
  private scene: Scene
  private sprite: Sprite
  private currentIndex: number

  constructor(scene: Scene) {
    this.scene = scene
    this.currentIndex = Math.floor(Math.random() * 35) + 1
    this.sprite = addImage(scene, 0, 960, `kanji_${this.currentIndex}`)
    this.sprite.alpha = 0
    this.sprite.zIndex = -8
    this.startAnime()
  }

  private change(): void {
    this.currentIndex = Math.floor(Math.random() * 35) + 1
    setTexture(this.sprite, `kanji_${this.currentIndex}`)
  }

  private startAnime(): void {
    this.createRotationAnimation()
    const doScale = () => {
      this.scene.tween(this.sprite.scale, {
        x: 2,
        y: 2,
        duration: 20,
        ease: 'quad.inOut',
        onComplete: () => {
          this.scene.tween(this.sprite.scale, {
            x: 3,
            y: 3,
            duration: 20,
            ease: 'quad.inOut',
            onComplete: doScale,
          })
        },
      })
    }
    doScale()
    this.createPositionAnimation()
    this.createOpacityAnimation()
  }

  private createRotationAnimation(): void {
    const rots = [
      { angle: 360, duration: 100, ease: 'back.inOut' },
      { angle: -360, duration: 120, ease: 'back.inOut' },
    ]
    const doRot = (i: number) => {
      const r = rots[i]
      this.scene.tween(this.sprite, {
        rotation: `+=${r.angle * DEG}`,
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
      this.scene.tween(this.sprite, {
        x: `+=${m.x}`,
        y: `+=${m.y}`,
        duration: 14,
        ease: 'sine.inOut',
        onComplete: () => doMove((i + 1) % moves.length),
      })
    }
    doMove(0)
  }

  private createOpacityAnimation(): void {
    const seq = () => {
      this.scene.tween(this.sprite, {
        alpha: 0.5,
        duration: 4,
        ease: 'none',
        onComplete: () => {
          this.scene.tween(this.sprite, {
            alpha: 1,
            duration: 8,
            ease: 'none',
            onComplete: () => {
              this.scene.tween(this.sprite, {
                alpha: 0,
                duration: 8,
                ease: 'none',
                onComplete: () => {
                  this.change()
                  this.scene.delayedCall(4000, () => {
                    this.scene.tween(this.sprite, {
                      alpha: 1,
                      duration: 10,
                      ease: 'none',
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
    this.sprite?.destroy()
  }
}

export class MonSprites {
  private scene: Scene
  private sprite: Sprite
  private currentIndex: number

  constructor(scene: Scene) {
    this.scene = scene
    this.currentIndex = Math.floor(Math.random() * 14) + 1
    this.sprite = addImage(scene, 640, 0, `mon_${this.currentIndex}`)
    this.sprite.alpha = 0
    this.sprite.zIndex = -9
    this.startAnime()
  }

  private change(): void {
    this.currentIndex = Math.floor(Math.random() * 14) + 1
    setTexture(this.sprite, `mon_${this.currentIndex}`)
  }

  private startAnime(): void {
    this.createRotationAnimation()
    const doScale = () => {
      this.scene.tween(this.sprite.scale, {
        x: 1.5,
        y: 1.5,
        duration: 5,
        ease: 'quad.inOut',
        onComplete: () => {
          this.scene.tween(this.sprite.scale, {
            x: 1,
            y: 1,
            duration: 10,
            ease: 'quad.inOut',
            onComplete: doScale,
          })
        },
      })
    }
    doScale()
    this.createPositionAnimation()
    this.createOpacityAnimation()
  }

  private createRotationAnimation(): void {
    const rots = [
      { angle: 360, duration: 10, ease: 'elastic.inOut' },
      { angle: -360, duration: 10, ease: 'elastic.inOut' },
    ]
    const doRot = (i: number) => {
      const r = rots[i]
      this.scene.tween(this.sprite, {
        rotation: `+=${r.angle * DEG}`,
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
      this.scene.tween(this.sprite, {
        x: `+=${m.x}`,
        y: `+=${m.y}`,
        duration: 10,
        ease: 'sine.inOut',
        onComplete: () => doMove((i + 1) % moves.length),
      })
    }
    doMove(0)
  }

  private createOpacityAnimation(): void {
    const seq = () => {
      this.scene.tween(this.sprite, {
        alpha: 0.5,
        duration: 4,
        ease: 'none',
        onComplete: () => {
          this.scene.tween(this.sprite, {
            alpha: 1,
            duration: 8,
            ease: 'none',
            onComplete: () => {
              this.scene.tween(this.sprite, {
                alpha: 0,
                duration: 7,
                ease: 'none',
                onComplete: () => {
                  this.change()
                  this.scene.delayedCall(4000, () => {
                    this.scene.tween(this.sprite, {
                      alpha: 1,
                      duration: 10,
                      ease: 'none',
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
    this.sprite?.destroy()
  }
}

export class EffectSprites {
  private scene: Scene
  private sprites: Sprite[] = []

  constructor(scene: Scene) {
    this.scene = scene
    const a = addImage(scene, 320, 480, 'bg_bullet_time')
    a.alpha = 0
    this.sprites.push(a)
    const b = addImage(scene, 320, 480, 'bg_revolution')
    b.alpha = 0
    this.sprites.push(b)
    const c = addImage(scene, 320, 480, 'effect_hand')
    c.alpha = 0
    this.sprites.push(c)
    const d = addImage(scene, 320, 480, 'bg_triple_seven')
    setDisplaySize(d, 960 * 1.2, 960 * 1.2)
    d.alpha = 0
    this.sprites.push(d)
  }

  show(effect: string): void {
    switch (effect) {
      case 'bullet_time':
        this.scene.tween(this.sprites[0], { alpha: 1, duration: 0.2 })
        this.scene.tween(this.sprites[2], { alpha: 0.5, duration: 0.2 })
        this.scene.tween(this.sprites[2], {
          rotation: `+=${360 * DEG}`,
          duration: 29,
          ease: 'none',
        })
        break
      case 'revolution':
        this.scene.tween(this.sprites[1], { alpha: 1, duration: 0.2 })
        this.scene.tween(this.sprites[2], { alpha: 0.5, duration: 0.2 })
        this.scene.tween(this.sprites[2], {
          rotation: `+=${360 * DEG}`,
          duration: 29,
          ease: 'none',
        })
        break
      case 'triple_seven':
        this.scene.tween(this.sprites[3], { alpha: 0.2, duration: 0.2 })
        this.scene.tween(this.sprites[3], {
          rotation: `+=${360 * DEG}`,
          duration: 2,
          ease: 'none',
        })
        break
    }
  }

  hide(effect?: string): void {
    if (effect === 'triple_seven') {
      this.scene.tween(this.sprites[3], { alpha: 0, duration: 0.05 })
    } else if (!effect) {
      this.sprites.forEach(s =>
        this.scene.tween(s, { alpha: 0, duration: 0.05 })
      )
    }
  }

  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class LinesSprites {
  private scene: Scene
  private sprites: Sprite[] = []

  constructor(scene: Scene) {
    this.scene = scene
    const positions: [number, number, string][] = [
      [122, 450, 'line_v_1'],
      [164, 450, 'line_v_1'],
      [142, 278, 'line_h_1'],
      [142, 488, 'line_h_1'],
      [142, 320, 'line_h_2'],
      [142, 362, 'line_h_2'],
      [142, 404, 'line_h_2'],
      [142, 446, 'line_h_2'],
    ]
    positions.forEach(([x, y, key]) => {
      const s = addImage(scene, x, y, key)
      s.alpha = 0
      this.sprites.push(s)
    })
  }

  show(): void {
    this.sprites.forEach(s => this.scene.tween(s, { alpha: 1, duration: 0.2 }))
  }
  hide(): void {
    this.sprites.forEach(s => this.scene.tween(s, { alpha: 0, duration: 0.05 }))
  }
  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class GuidesSprites {
  private scene: Scene
  private reachSprites: Sprite[] = []
  private modSprites: Sprite[] = []

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 11; i++) {
      const a = String.fromCharCode(97 + i)
      const s = addImage(scene, x, y, `guide_reach_${a}`)
      s.alpha = 0
      this.reachSprites.push(s)
    }
    for (const key of ['guide_mod_a', 'guide_mod_f', 'guide_mod_i']) {
      const s = addImage(scene, x, y, key)
      s.alpha = 0
      this.modSprites.push(s)
    }
  }

  show(guide: string): void {
    if (guide >= 'a' && guide <= 'k') {
      this.scene.tween(this.reachSprites[guide.charCodeAt(0) - 97], {
        alpha: 1,
        duration: 0.2,
      })
    } else if (guide === 'mod') {
      this.scene.tween(this.modSprites[0], { alpha: 1, duration: 0.05 })
      this.scene.tween(this.modSprites[1], {
        alpha: 1,
        duration: 0.05,
        delay: 0.4,
      })
      this.scene.tween(this.modSprites[2], {
        alpha: 1,
        duration: 0.05,
        delay: 0.8,
      })
    }
  }

  hide(): void {
    this.reachSprites.forEach(s =>
      this.scene.tween(s, { alpha: 0, duration: 0.05 })
    )
    this.modSprites.forEach(s =>
      this.scene.tween(s, { alpha: 0, duration: 0.05 })
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
  private scene: MainScene
  private sprites: Sprite[] = []

  constructor(scene: MainScene, x: number, y: number) {
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
      const s = addImage(scene, sx, sy, 'mod_n_0')
      s.alpha = 0
      this.sprites.push(s)
    }
  }

  redraw(mods: number[]): void {
    this.sprites.forEach((s, i) => {
      setTexture(s, `mod_n_${mods[i]}`)
      s.alpha = 0
    })
    for (let i = 0; i <= 4; i++)
      this.scene.tween(this.sprites[i], { alpha: 1, duration: 0.05 })
    this.scene.audio.playSound('se_mod')

    for (let i = 5; i <= 7; i++)
      this.scene.tween(this.sprites[i], {
        alpha: 1,
        duration: 0.05,
        delay: 0.4,
      })
    this.scene.delayedCall(400, () => this.scene.audio.playSound('se_mod'))

    for (let i = 8; i <= 10; i++)
      this.scene.tween(this.sprites[i], {
        alpha: 1,
        duration: 0.05,
        delay: 0.8,
      })
    this.scene.delayedCall(800, () => this.scene.audio.playSound('se_mod'))
  }

  hide(): void {
    this.sprites.forEach(s => this.scene.tween(s, { alpha: 0, duration: 0.05 }))
  }
  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class AlphabetsSprites {
  private scene: Scene
  private spriteGroup: Sprite[][] = []
  private lineSprite: Sprite

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 11; i++) {
      const a = String.fromCharCode(97 + i)
      const yPos = y + 42 * i
      const s0 = addImage(scene, x, yPos, `alphabet_${a}`)
      s0.alpha = 0
      const s1 = addImage(scene, x + 28, yPos, 'dummy')
      setDisplaySize(s1, 35, 35)
      s1.alpha = 0
      const s2 = addImage(scene, x + 53, yPos, 'dummy')
      setDisplaySize(s2, 35, 35)
      s2.alpha = 0
      const s3 = addImage(scene, x + 78, yPos, 'dummy')
      setDisplaySize(s3, 35, 35)
      s3.alpha = 0
      const s4 = addImage(scene, x + 112, yPos, 'dummy')
      setDisplaySize(s4, 30, 30)
      s4.alpha = 0
      this.spriteGroup.push([s0, s1, s2, s3, s4])
    }
    this.lineSprite = addImage(scene, x + 140, y + 445, 'line_h_3')
    this.lineSprite.alpha = 0
  }

  redraw(tuples: number[][], mods: number[]): void {
    this.spriteGroup.forEach((sprites, i) => {
      sprites[0].alpha = 0
      setTexture(sprites[1], `gray_n_${tuples[i][0]}`)
      setDisplaySize(sprites[1], 35, 35)
      sprites[1].alpha = 0
      setTexture(sprites[2], `gray_n_${tuples[i][1]}`)
      setDisplaySize(sprites[2], 35, 35)
      sprites[2].alpha = 0
      setTexture(sprites[3], `gray_n_${tuples[i][2]}`)
      setDisplaySize(sprites[3], 35, 35)
      sprites[3].alpha = 0
      setTexture(sprites[4], `mod_n_${mods[i]}`)
      setDisplaySize(sprites[4], 30, 30)
      sprites[4].alpha = 0
    })
    this.lineSprite.alpha = 0
    this.spriteGroup.forEach(sprites =>
      sprites.forEach(s =>
        this.scene.tween(s, { alpha: 1, duration: 0.05, delay: 0.8 })
      )
    )
    this.scene.tween(this.lineSprite, {
      alpha: 1,
      duration: 0.05,
      delay: 0.8,
    })
  }

  hide(): void {
    this.spriteGroup.forEach(sprites =>
      sprites.forEach(s => this.scene.tween(s, { alpha: 0, duration: 0.05 }))
    )
    this.scene.tween(this.lineSprite, { alpha: 0, duration: 0.05 })
  }

  remove(): void {
    this.spriteGroup.forEach(sprites => sprites.forEach(s => s.destroy()))
    this.spriteGroup = []
    this.lineSprite?.destroy()
  }
}

export class ScoresSprites {
  private scene: Scene
  private spriteGroup: Sprite[][] = []

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 11; i++) {
      const s0 = addImage(scene, x, y + 42 * i, 'dummy')
      s0.alpha = 0
      const s1 = addImage(scene, x + 85, y + 42 * i, 'dummy')
      s1.alpha = 0
      this.spriteGroup.push([s0, s1])
    }
  }

  redraw(scores: Score[], revolution: boolean): void {
    this.spriteGroup.forEach((sprites, i) => {
      const score = scores[i]
      let rollImage = 'roll_buta'
      let oddsImage = 'dummy'
      if (score.won && typeof score.roll !== 'string') {
        rollImage = `roll_${score.roll.name}`
        let odds =
          score.roll.odds ||
          score.roll.calcGain(score.sum || 0, score.tuple, score.mod)
        if (score.roll.f === 'multi' && revolution) odds *= -1
        oddsImage = `odds_${score.roll.f}_${odds}`
      }
      setTexture(sprites[0], rollImage)
      sprites[0].alpha = 0
      setTexture(sprites[1], oddsImage)
      sprites[1].alpha = 0
    })

    this.spriteGroup.forEach((sprites, i) => {
      const score = scores[i]
      let delay = 1
      if (score.won && typeof score.roll !== 'string') {
        const step = getStep(score)
        if (step === 'me') delay = 0
        else if (step === 'kabu') delay = 0.5
      }
      this.scene.tween(sprites[0], { alpha: 1, duration: 0.05, delay })
      this.scene.tween(sprites[1], { alpha: 1, duration: 0.05, delay })
    })
  }

  hide(): void {
    this.spriteGroup.forEach(sprites =>
      sprites.forEach(s => this.scene.tween(s, { alpha: 0, duration: 0.05 }))
    )
  }

  remove(): void {
    this.spriteGroup.forEach(sprites => sprites.forEach(s => s.destroy()))
    this.spriteGroup = []
  }
}

export class ComboSprites {
  private scene: Scene
  private comboSprite: Sprite
  private textSprite: Sprite

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene
    this.comboSprite = addImage(scene, x + 39, y + 12, 'dummy')
    this.comboSprite.alpha = 0
    this.textSprite = addImage(scene, x, y, 'text_combo')
    this.textSprite.alpha = 0
  }

  redraw(iCombo: number): void {
    setTexture(this.comboSprite, `odds_multi_${Math.min(iCombo, 10)}`)
    this.comboSprite.alpha = 0
    this.textSprite.alpha = 0
    this.scene.tween(this.textSprite, {
      alpha: 1,
      duration: 0.05,
      delay: 1.5,
    })
    this.scene.tween(this.comboSprite, {
      alpha: 1,
      duration: 0.05,
      delay: 1.5,
    })
  }

  hide(): void {
    this.scene.tween(this.textSprite, { alpha: 0, duration: 0.05 })
    this.scene.tween(this.comboSprite, { alpha: 0, duration: 0.05 })
  }

  remove(): void {
    this.textSprite?.destroy()
    this.comboSprite?.destroy()
  }
}

export class CurrentScoreSprites {
  private scene: MainScene
  private meSprites: Sprite[] = []
  private kabuSprites: Sprite[] = []
  private multiSprites: Sprite[] = []
  private comboSprites: Sprite[] = []

  constructor(scene: MainScene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 8; i++) {
      const sx = x - 70 * 0.7 * (8 - i)
      const mk = (group: Sprite[]) => {
        const s = addImage(scene, sx, y, 'dummy')
        s.alpha = 0
        group.push(s)
      }
      mk(this.meSprites)
      mk(this.kabuSprites)
      mk(this.multiSprites)
      mk(this.comboSprites)
    }
  }

  redraw(currentScores: number[]): void {
    this.setDigits(this.meSprites, currentScores[0])
    this.setDigits(this.kabuSprites, currentScores[1])
    this.setDigits(this.multiSprites, currentScores[2])
    this.setDigits(this.comboSprites, currentScores[3])
    this.show(currentScores)
  }

  private setDigits(sprites: Sprite[], value: number): void {
    const digits = String(value).split('')
    const startI = 8 - digits.length
    sprites.forEach((s, i) => {
      if (i < startI) {
        setTexture(s, 'dummy')
      } else {
        setTexture(s, `fude_n_${digits[i - startI]}`)
        setDisplaySize(s, 70, 70)
        s.alpha = 0
      }
    })
  }

  private show(currentScores: number[]): void {
    const audio = this.scene.audio

    this.meSprites.forEach(s => {
      this.scene.tween(s, {
        alpha: 1,
        duration: 0.05,
        onComplete: () =>
          this.scene.delayedCall(500, () =>
            this.scene.tween(s, { alpha: 0, duration: 0.05 })
          ),
      })
    })

    if (currentScores[0] > 0) audio.playSound('se_win')
    else audio.playSound('se_buta')

    this.kabuSprites.forEach(s => {
      this.scene.tween(s, {
        alpha: 1,
        duration: 0.05,
        delay: 0.5,
        onComplete: () =>
          this.scene.delayedCall(500, () =>
            this.scene.tween(s, { alpha: 0, duration: 0.05 })
          ),
      })
    })

    if (currentScores[1] > currentScores[0]) {
      this.scene.delayedCall(500, () => audio.playSound('se_win'))
    } else {
      this.scene.delayedCall(500, () => audio.playSound('se_buta'))
    }

    if (currentScores[3] !== currentScores[2]) {
      this.multiSprites.forEach(s => {
        this.scene.tween(s, {
          alpha: 1,
          duration: 0.05,
          delay: 1,
          onComplete: () =>
            this.scene.delayedCall(500, () =>
              this.scene.tween(s, { alpha: 0, duration: 0.05 })
            ),
        })
      })
      this.comboSprites.forEach(s =>
        this.scene.tween(s, { alpha: 1, duration: 0.05, delay: 1.5 })
      )

      if (currentScores[2] > currentScores[1]) {
        this.scene.delayedCall(1000, () => audio.playSound('se_multi'))
      } else if (currentScores[2] === currentScores[1]) {
        this.scene.delayedCall(1000, () => audio.playSound('se_buta'))
      } else {
        this.scene.delayedCall(1000, () => audio.playSound('se_hifumi'))
      }

      this.scene.delayedCall(1500, () => audio.playSound('voice_combo'))
    } else {
      this.multiSprites.forEach(s =>
        this.scene.tween(s, { alpha: 1, duration: 0.05, delay: 1 })
      )

      if (currentScores[2] > currentScores[1]) {
        this.scene.delayedCall(1000, () => audio.playSound('se_multi'))
      } else if (currentScores[2] === currentScores[1]) {
        this.scene.delayedCall(1000, () => audio.playSound('se_buta'))
      } else {
        this.scene.delayedCall(1000, () => audio.playSound('se_hifumi'))
      }
    }
  }

  hide(): void {
    ;[
      this.meSprites,
      this.kabuSprites,
      this.multiSprites,
      this.comboSprites,
    ].forEach(g =>
      g.forEach(s => this.scene.tween(s, { alpha: 0, duration: 0.05 }))
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
  private scene: Scene
  private sprites: Sprite[] = []

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 8; i++) {
      const s = addImage(scene, x + 100 * 0.7 * i, y, 'dummy')
      s.alpha = 0
      this.sprites.push(s)
    }
  }

  redraw(totalScore: number): void {
    const digits = String(totalScore).split('')
    this.sprites.forEach((s, i) => {
      setTexture(s, i < digits.length ? `fude_n_${digits[i]}` : 'dummy')
      this.scene.tween(s, { alpha: 1, duration: 0.1 })
    })
  }

  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class TimeSprites {
  private scene: Scene
  private sprites: Sprite[] = []

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 8; i++) {
      const s = addImage(scene, x + 50 * 0.7 * i, y, 'dummy')
      s.alpha = 0
      this.sprites.push(s)
    }
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
        setTexture(sp, `fude_n_${digits[i]}`)
        setDisplaySize(sp, 50, 50)
      } else {
        setTexture(sp, 'dummy')
      }
      this.scene.tween(sp, { alpha: 1, duration: 0.1 })
    })
  }

  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class BetTimesSprites {
  private scene: Scene
  private sprites: Sprite[] = []

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene
    for (let i = 0; i < 8; i++) {
      const s = addImage(scene, x + 50 * 0.7 * i, y, 'dummy')
      s.alpha = 0
      this.sprites.push(s)
    }
  }

  redraw(betTimes: number): void {
    const digits = String(betTimes).split('')
    this.sprites.forEach((sp, i) => {
      if (i < digits.length) {
        setTexture(sp, `fude_n_${digits[i]}`)
        setDisplaySize(sp, 50, 50)
      } else {
        setTexture(sp, 'dummy')
      }
      this.scene.tween(sp, { alpha: 1, duration: 0.1 })
    })
  }

  remove(): void {
    this.sprites.forEach(s => s.destroy())
    this.sprites = []
  }
}

export class ResultSprites {
  private scene: Scene
  private bgSprite: Sprite
  private ruleSprite: Sprite
  private highScoreSprite: Sprite
  private scoreText: Text
  private timeText: Text
  private betTimesText: Text
  private rankText: Text
  private maxComboText: Text
  private maxGainText: Text
  private averageGainText: Text
  private rollTexts: Map<string, Text> = new Map()
  private zoneTexts: Map<string, Text> = new Map()
  private tripleSevenTexts: Map<string, Text> = new Map()
  private eggAmbulanceText: Text
  private buttonChangeRule: Sprite
  private buttonOneMore: Sprite
  private allElements: (Sprite | Text)[] = []

  constructor(scene: Scene) {
    this.scene = scene
    const style: Partial<TextStyle> = {
      fontSize: 21,
      fill: 0xffffff,
    }

    this.bgSprite = addImage(scene, 320, 480, 'bg_result')
    this.bgSprite.alpha = 0
    this.ruleSprite = addImage(scene, 320, 200, 'dummy')
    this.ruleSprite.alpha = 0
    this.highScoreSprite = addImage(scene, 550, 400, 'high_score')
    setDisplaySize(this.highScoreSprite, 400, 400)
    this.highScoreSprite.alpha = 0

    const mkText = (x: number, y: number): Text => {
      const t = new Text({ text: '', style })
      t.anchor.set(0, 0)
      t.position.set(x, y)
      t.alpha = 0
      scene.addChild(t)
      return t
    }

    this.scoreText = mkText(120, 280)
    this.timeText = mkText(320, 280)
    this.betTimesText = mkText(420, 280)
    this.rankText = mkText(320, 310)
    const ls1 = addImage(scene, 320, 320, 'line_h_3')
    ls1.alpha = 0
    this.maxComboText = mkText(120, 340)
    this.maxGainText = mkText(320, 340)
    this.averageGainText = mkText(420, 340)
    const ls2 = addImage(scene, 320, 360, 'line_h_3')
    ls2.alpha = 0

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
      this.rollTexts.set(n, mkText(200 + idx * 50, 380))
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
      this.rollTexts.set(n, mkText(200 + idx * 50, 410))
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
      this.rollTexts.set(n, mkText(200 + idx * 50, 440))
    )

    const ls3 = addImage(scene, 320, 470, 'line_h_3')
    ls3.alpha = 0
    this.zoneTexts.set('bullet_time', mkText(200, 490))
    this.zoneTexts.set('revolution', mkText(400, 490))
    ;['all_1', 'all_6', 'all_123', 'all_456'].forEach((n, i) =>
      this.tripleSevenTexts.set(n, mkText(200 + i * 100, 520))
    )
    ;['triplets', 'others', 'rollback'].forEach((n, i) =>
      this.tripleSevenTexts.set(n, mkText(200 + i * 100, 550))
    )
    this.eggAmbulanceText = mkText(500, 550)

    this.buttonChangeRule = addImage(scene, 170, 770, 'button_change_rule')
    this.buttonChangeRule.alpha = 0
    this.buttonChangeRule.eventMode = 'static'
    this.buttonChangeRule.cursor = 'pointer'

    this.buttonOneMore = addImage(scene, 320, 770, 'button_one_more')
    this.buttonOneMore.alpha = 0
    this.buttonOneMore.eventMode = 'static'
    this.buttonOneMore.cursor = 'pointer'

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
    setTexture(this.ruleSprite, rule)
    this.ruleSprite.alpha = 0
    this.scoreText.text = String(totalScore)

    const second = Math.floor(elapsedTime / 1000)
    const time = getTime(rule, second)
    const h = Math.floor(time / 3600)
    const m = Math.floor(time / 60) % 60
    const s = time % 60
    const ms = elapsedTime % 1000
    this.timeText.text =
      ('00' + h).slice(-2) +
      ':' +
      ('00' + m).slice(-2) +
      ':' +
      ('00' + s).slice(-2) +
      '.' +
      ('000' + ms).slice(-3)
    this.betTimesText.text = String(betTimes)
    this.maxComboText.text = String(stats.max_combo)
    this.maxGainText.text = String(stats.max_gain)
    this.averageGainText.text = String(
      Math.floor((totalScore / betTimes) * 10) / 10
    )

    for (const [n, t] of this.rollTexts) t.text = String(stats.roll[n] || 0)
    for (const [n, t] of this.zoneTexts) t.text = String(stats.zone[n] || 0)
    for (const [n, t] of this.tripleSevenTexts)
      t.text = String(stats.triple_seven[n] || 0)
    this.eggAmbulanceText.text = String(stats.egg.ambulance || 0)

    this.show(isHighScore)
  }

  private show(isHighScore: boolean): void {
    this.allElements.forEach(el =>
      this.scene.tween(el, { alpha: 1, duration: 0.2 })
    )
    if (isHighScore) {
      this.scene.tween(this.highScoreSprite, {
        rotation: -30 * DEG,
        duration: 1,
        ease: 'expo.out',
      })
      this.scene.tween(this.highScoreSprite.scale, {
        x: 0.5,
        y: 0.5,
        duration: 1,
        ease: 'expo.out',
      })
      this.scene.tween(this.highScoreSprite, {
        x: this.highScoreSprite.x - 100,
        y: this.highScoreSprite.y - 100,
        duration: 1,
        ease: 'expo.out',
      })
      this.scene.tween(this.highScoreSprite, {
        alpha: 0.8,
        duration: 1.2,
        ease: 'expo.out',
      })
    }
  }

  hide(): void {
    this.allElements.forEach(el =>
      this.scene.tween(el, { alpha: 0, duration: 0.05 })
    )
  }
  remove(): void {
    this.allElements.forEach(el => el.destroy())
    this.allElements = []
  }
  getButtonChangeRule(): Sprite {
    return this.buttonChangeRule
  }
  getButtonOneMore(): Sprite {
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
    case 'rule_2_2943':
      left = 2943 - iSecond1
      break
    case 'rule_1_8390':
    case 'rule_2_8390':
      left = 8390 - iSecond1
      break
    case 'rule_1_37654':
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
