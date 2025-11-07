// Main Game Scene for Tin! Tilo! Rings!
import Phaser from 'phaser'
import { Rule, RuleType } from './rule'
import { AudioManager } from './AudioManager'

type GameMode =
  | 'first'
  | 'ready'
  | 'rotate_3'
  | 'braking_3'
  | 'braked_3'
  | 'rotate_2'
  | 'braking_2'
  | 'braked_2'
  | 'rotate_1'
  | 'braking_1'
  | 'braked_1'
  | 'showing_mods'
  | 'showing_scores'
  | 'shown_scores'
  | 'shown_result'

export class MainScene extends Phaser.Scene {
  private mode: GameMode = 'first'
  private rule: RuleType = 'rule_1_2943'
  private elapsed_time: number = 0
  private bet_times: number = 0
  private total_score: number = 0
  private audio!: AudioManager
  private backButton!: Phaser.GameObjects.Image
  private preventClick = false

  private speed: number = 4

  private i_combo: number = 0
  private i_second_1: number = 0
  private i_minute_1: number = 0

  private zone_seconds: number = 0
  private bullet_time: boolean = false
  private revolution: boolean = false

  // Ring sprites
  private ring1Sprites: Phaser.GameObjects.Image[] = []
  private ring2Sprites: Phaser.GameObjects.Image[] = []
  private ring3Sprites: Phaser.GameObjects.Image[] = []

  private ring1_ns: number[] = []
  private ring2_ns: number[] = []
  private ring3_ns: number[] = []

  private ring1_eyes: number[] = []
  private ring2_eyes: number[] = []
  private ring3_eyes: number[] = []

  private ring1_color: string = 'white'
  private ring2_color: string = 'white'
  private ring3_color: string = 'white'

  // UI elements
  private totalScoreText!: Phaser.GameObjects.Text
  private timeText!: Phaser.GameObjects.Text
  private betTimesText!: Phaser.GameObjects.Text

  // Background
  private bgSprite!: Phaser.GameObjects.Image

  // Stats
  private stats = {
    max_combo: 0,
    max_gain: 0,
    roll: {
      pinzoro: 0,
      arashikabu: 0,
      kemono: 0,
      triple_seven: 0,
      zorome: 0,
      shigoro: 0,
      hifumi: 0,
      pinbasami: 0,
      me: 0,
      pin: 0,
      nizou: 0,
      santa: 0,
      yotsuya: 0,
      goke: 0,
      roppou: 0,
      shichiken: 0,
      oicho: 0,
      kabu: 0,
      pink_ribbon: 0,
      buta: 0,
    },
    zone: {
      bullet_time: 0,
      revolution: 0,
    },
    triple_seven: {
      all_1: 0,
      all_6: 0,
      all_123: 0,
      all_456: 0,
      triplets: 0,
      others: 0,
      rollback: 0,
    },
    egg: {
      ambulance: 0,
    },
  }

  constructor() {
    super({ key: 'MainScene' })
  }

  init(data: { rule?: string }): void {
    // Get rule from title scene
    if (data.rule) {
      this.rule = data.rule as RuleType
    }
  }

  preload(): void {
    // Initialize audio manager
    this.audio = new AudioManager(this)
    this.audio.preload()

    // Load all ring images
    for (const color of ['white', 'yellow', 'pink', 'gray']) {
      for (let i = 0; i < 10; i++) {
        this.load.image(
          `${color}_n_${i}`,
          `assets/image/ring/${color}_n_${i}.png`
        )
      }
    }

    // Load background images
    for (let i = 1; i <= 37; i++) {
      this.load.image(`bg_${i}`, `assets/image/bg/bg_${i}.png`)
    }

    // Load button images
    this.load.image('button_back', 'assets/image/title/button_back.png')
    this.load.image(
      'button_back_hover',
      'assets/image/title/button_back_hover.png'
    )

    // Load guide images
    for (let i = 0; i < 11; i++) {
      const alphabet = String.fromCharCode(97 + i)
      this.load.image(
        `guide_reach_${alphabet}`,
        `assets/image/guide/guide_reach_${alphabet}.png`
      )
    }

    this.load.image('guide_mod_a', 'assets/image/guide/guide_mod_a.png')
    this.load.image('guide_mod_f', 'assets/image/guide/guide_mod_f.png')
    this.load.image('guide_mod_i', 'assets/image/guide/guide_mod_i.png')

    // Load score images
    this.load.image('roll_pinzoro', 'assets/image/score/roll_pinzoro.png')
    this.load.image('roll_arashikabu', 'assets/image/score/roll_arashikabu.png')
    // ... more score images

    // Load effects
    this.load.image('bg_bullet_time', 'assets/image/effect/bg_bullet_time.png')
    this.load.image('bg_revolution', 'assets/image/effect/bg_revolution.png')
    this.load.image(
      'bg_triple_seven',
      'assets/image/effect/bg_triple_seven.png'
    )
    this.load.image('effect_hand', 'assets/image/effect/effect_hand.png')
  }

  create(): void {
    const { width, height } = this.cameras.main

    // Background
    this.bgSprite = this.add.image(width / 2, height / 2, 'bg_1')
    this.bgSprite.setDisplaySize(width, height)
    this.bgSprite.setAlpha(0.3)

    // Create back button
    this.backButton = this.add.image(34, 30, 'button_back')
    this.backButton.setAlpha(0.5)
    this.backButton.setInteractive({ useHandCursor: true })

    this.backButton.on('pointerover', () => {
      if (this.mode === 'first' || this.mode === 'ready') return
      this.backButton.setTexture('button_back_hover')
      this.audio.playSound('voice_back')
    })

    this.backButton.on('pointerout', () => {
      this.backButton.setTexture('button_back')
    })

    this.backButton.on('pointerdown', () => {
      if (this.mode === 'first' || this.mode === 'ready') return
      if (this.preventClick) return

      this.preventClick = true
      this.audio.stopBGM()

      // Return to title scene
      this.scene.start('TitleScene', { back: true })
    })

    // Create rings
    this.createRings()

    // UI Text
    this.totalScoreText = this.add
      .text(245, 925, `スコア: ${this.total_score}`, {
        fontSize: '24px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)

    this.timeText = this.add
      .text(245, 17, `時間: 0`, {
        fontSize: '20px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)

    this.betTimesText = this.add
      .text(245, 60, `回数: 0`, {
        fontSize: '20px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)

    // Input
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.preventClick) {
        this.changeMode()
      }
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore clicks on back button
      if (
        !this.preventClick &&
        !Phaser.Geom.Rectangle.Contains(
          this.backButton.getBounds(),
          pointer.x,
          pointer.y
        )
      ) {
        this.changeMode()
      }
    })

    // Start game
    this.time.delayedCall(1000, () => {
      // Play BGM
      this.audio.playBGM('bgm_1', 0.2)
      this.changeMode()
    })
  }

  private createRings(): void {
    const positions = [
      { x: 100, y: 300 },
      { x: 142, y: 300 },
      { x: 184, y: 300 },
    ]

    // Initialize ring values
    this.ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    this.ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    this.ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    // Create ring sprites (40 sprites per ring for infinite scroll effect)
    for (let i = 0; i < 40; i++) {
      const i2 = i % 10
      const n1 = this.ring1_ns[i2]
      const n2 = this.ring2_ns[i2]
      const n3 = this.ring3_ns[i2]

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

      const sprite1 = this.add.image(
        positions[0].x,
        positions[0].y + yOffset,
        `white_n_${n1}`
      )
      sprite1.setData('n', n1)
      sprite1.setData('initialY', positions[0].y + yOffset)
      sprite1.setAlpha(0)
      this.ring1Sprites.push(sprite1)

      const sprite2 = this.add.image(
        positions[1].x,
        positions[1].y + yOffset,
        `white_n_${n2}`
      )
      sprite2.setData('n', n2)
      sprite2.setData('initialY', positions[1].y + yOffset)
      sprite2.setAlpha(0)
      this.ring2Sprites.push(sprite2)

      const sprite3 = this.add.image(
        positions[2].x,
        positions[2].y + yOffset,
        `white_n_${n3}`
      )
      sprite3.setData('n', n3)
      sprite3.setData('initialY', positions[2].y + yOffset)
      sprite3.setAlpha(0)
      this.ring3Sprites.push(sprite3)
    }
  }

  update(_time: number, delta: number): void {
    // Update elapsed time
    if (!['first', 'ready', 'shown_result'].includes(this.mode)) {
      this.elapsed_time += delta

      const second = Math.floor(this.elapsed_time / 1000)
      const iSecond1 = Math.floor(second)
      if (iSecond1 !== this.i_second_1) {
        this.i_second_1 = iSecond1
        this.timeText.setText(
          `時間: ${Rule.getTime(this.rule, this.i_second_1)}`
        )

        if (this.bullet_time || this.revolution) {
          if (this.zone_seconds > 0) {
            this.zone_seconds--
            // TODO: Implement zone finish
          }
        }
      }

      const iMinute1 = Math.floor(second / 60)
      if (iMinute1 > this.i_minute_1) {
        this.i_minute_1 = iMinute1
        // TODO: Implement BGM change
      }
    }

    // Update ring rotations
    switch (this.mode) {
      case 'rotate_3':
        this.rotateRing(this.ring1Sprites, this.speed)
        this.rotateRing(this.ring2Sprites, this.speed + 1)
        this.rotateRing(this.ring3Sprites, this.speed + 2)
        break
      case 'braking_3':
        this.rotateRing(this.ring2Sprites, this.speed + 1)
        this.rotateRing(this.ring3Sprites, this.speed + 2)
        break
      case 'rotate_2':
        this.rotateRing(this.ring2Sprites, this.speed)
        this.rotateRing(this.ring3Sprites, this.speed + 1)
        break
      case 'braking_2':
        this.rotateRing(this.ring3Sprites, this.speed + 1)
        break
      case 'rotate_1':
        this.rotateRing(this.ring3Sprites, this.speed)
        break
    }
  }

  private rotateRing(sprites: Phaser.GameObjects.Image[], speed: number): void {
    sprites.forEach(sprite => {
      sprite.y -= speed

      const initialY = sprite.getData('initialY')
      if (sprite.y <= initialY - 42 * 10) {
        sprite.y = initialY
      }

      this.updateRingSprite(sprite)
    })
  }

  private updateRingSprite(sprite: Phaser.GameObjects.Image): void {
    // Update alpha based on Y position for fade effect
    if (sprite.y >= -40 && sprite.y <= 200) {
      const delta = (sprite.y + 40) / 240
      sprite.setAlpha(delta)
    } else if (sprite.y >= 700 && sprite.y <= 1000) {
      const delta = (300 - (1000 - sprite.y)) / 300
      sprite.setAlpha(1 - delta)
    } else {
      sprite.setAlpha(1)
    }
  }

  private changeMode(): void {
    switch (this.mode) {
      case 'first':
        this.startReady()
        break
      case 'ready':
        this.startRotation()
        break
      case 'rotate_3':
        this.brakeRing1()
        break
      case 'braked_3':
        this.mode = 'rotate_2'
        break
      case 'rotate_2':
        this.brakeRing2()
        break
      case 'braked_2':
        this.checkReach()
        this.mode = 'rotate_1'
        break
      case 'rotate_1':
        this.brakeRing3()
        break
      case 'braked_1':
        this.calculateScores()
        break
      case 'shown_scores':
        this.prepareNextSpin()
        break
    }
  }

  private startReady(): void {
    this.ring1Sprites.forEach(sprite => sprite.setAlpha(1))
    this.ring2Sprites.forEach(sprite => sprite.setAlpha(1))
    this.ring3Sprites.forEach(sprite => sprite.setAlpha(1))

    // Play ready voices (3, 2, 1)
    this.time.delayedCall(500, () => {
      this.audio.playSound('voice_ready_3')
      this.time.delayedCall(700, () => {
        this.audio.playSound('voice_ready_2')
        this.time.delayedCall(700, () => {
          this.audio.playSound('voice_ready_1')
          this.time.delayedCall(700, () => {
            this.mode = 'ready'
            this.changeMode()
          })
        })
      })
    })
  }

  private startRotation(): void {
    this.elapsed_time = 0
    this.bet_times++
    this.betTimesText.setText(`回数: ${this.bet_times}`)
    this.mode = 'rotate_3'

    // Play rotation sound
    this.audio.playSound('se_rotate', 0.3)
  }

  private brakeRing1(): void {
    this.mode = 'braking_3'
    this.time.delayedCall(500, () => {
      this.stopRing(this.ring1Sprites)
      this.mode = 'braked_3'
      this.changeMode()
    })
  }

  private brakeRing2(): void {
    this.mode = 'braking_2'
    this.time.delayedCall(500, () => {
      this.stopRing(this.ring2Sprites)
      this.mode = 'braked_2'
      this.changeMode()
    })
  }

  private brakeRing3(): void {
    this.mode = 'braking_1'
    this.time.delayedCall(500, () => {
      this.stopRing(this.ring3Sprites)
      this.mode = 'braked_1'
      this.changeMode()
    })
  }

  private stopRing(sprites: Phaser.GameObjects.Image[]): void {
    const startY = 300
    const endY = 300 + 42 * 10

    const eyes: number[] = []
    sprites.forEach(sprite => {
      if (sprite.y >= startY && sprite.y < endY) {
        eyes.push(sprite.getData('n'))
      }
    })

    if (sprites === this.ring1Sprites) {
      this.ring1_eyes = eyes
    } else if (sprites === this.ring2Sprites) {
      this.ring2_eyes = eyes
    } else if (sprites === this.ring3Sprites) {
      this.ring3_eyes = eyes
    }
  }

  private checkReach(): void {
    const reaches = Rule.getReaches(this.ring1_eyes, this.ring2_eyes)
    if (reaches.length > 0) {
      console.log('Reach!', reaches)
    }
  }

  private calculateScores(): void {
    const tuples = Rule.calcTuples(
      this.ring1_eyes,
      this.ring2_eyes,
      this.ring3_eyes
    )
    const mods = Rule.calcMods(tuples)
    const scores = Rule.calcScores(tuples, mods, this.revolution)

    const currentScores = Rule.calcCurrentScores(scores)

    if (currentScores[2] >= 100) {
      this.i_combo++
      this.stats.max_combo = Math.max(this.stats.max_combo, this.i_combo)
    } else {
      this.i_combo = 0
    }

    const finalScores = Rule.addComboScore(currentScores, this.i_combo)
    this.total_score = Rule.calcTotalScore(this.total_score, finalScores)

    this.totalScoreText.setText(`スコア: ${this.total_score}`)

    this.mode = 'showing_scores'
    this.time.delayedCall(1500, () => {
      this.mode = 'shown_scores'
      if (Rule.isAchieved(this.rule, this.elapsed_time, this.total_score)) {
        this.mode = 'shown_result'
        console.log('Game finished!')
      }
    })
  }

  private prepareNextSpin(): void {
    // Prepare for next spin
    this.ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    this.ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    this.ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    this.redrawRing(this.ring1Sprites, this.ring1_ns, this.ring1_color)
    this.redrawRing(this.ring2Sprites, this.ring2_ns, this.ring2_color)
    this.redrawRing(this.ring3Sprites, this.ring3_ns, this.ring3_color)

    this.startRotation()
  }

  private redrawRing(
    sprites: Phaser.GameObjects.Image[],
    ns: number[],
    color: string
  ): void {
    sprites.forEach((sprite, i) => {
      const i2 = i % 10
      const n = ns[i2]
      sprite.setTexture(`${color}_n_${n}`)
      sprite.setData('n', n)
    })
  }
}
