// Main Game Scene for Tin! Tilo! Rings!
// Complete port from Phina.js version
import Phaser from 'phaser'
import { Rule, RuleType, type Score } from './rule'
import { type Roll } from './rolls'
import { AudioManager } from './AudioManager'
import {
  RingSprites,
  BackgroundSprites,
  KanjiSprites,
  MonSprites,
  ScoresSprites,
  CurrentScoreSprites,
  TotalScoreSprites,
} from './Sprites'

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

  // Ring sprites - using new sprite classes
  private ringSprites1!: RingSprites
  private ringSprites2!: RingSprites
  private ringSprites3!: RingSprites

  // Decorative sprites
  private backgroundSprites!: BackgroundSprites
  private kanjiSprites!: KanjiSprites
  private monSprites!: MonSprites

  // Score display sprites
  private scoresSprites!: ScoresSprites
  private currentScoreSprites!: CurrentScoreSprites
  private totalScoreSprites!: TotalScoreSprites

  // UI elements
  private totalScoreText!: Phaser.GameObjects.Text
  private timeText!: Phaser.GameObjects.Text
  private betTimesText!: Phaser.GameObjects.Text

  // Background
  private bgSprite!: Phaser.GameObjects.Image
  private bgIndex: number = 0

  // Guide sprites
  private guideSprites: Map<string, Phaser.GameObjects.Image> = new Map()

  // Score display sprites
  private scoreImages: Phaser.GameObjects.Image[] = []
  private comboImages: Phaser.GameObjects.Image[] = []
  private currentScoreImages: Phaser.GameObjects.Image[] = []

  // Effect sprites
  private effectSprite: Phaser.GameObjects.Image | null = null

  // Scores for current round
  private currentScores: number[] = []
  private tuples: number[][] = []
  private mods: number[] = []

  // Rollback for triple seven
  private rollbackStock: number = 0

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

    // Load score roll images
    const rollNames = [
      'pinzoro',
      'arashikabu',
      'kemono',
      'triple_seven',
      'zorome',
      'shigoro',
      'hifumi',
      'pinbasami',
      'me',
      'pin',
      'nizou',
      'santa',
      'yotsuya',
      'goke',
      'roppou',
      'shichiken',
      'oicho',
      'kabu',
      'pink_ribbon',
    ]
    rollNames.forEach(name => {
      this.load.image(`roll_${name}`, `assets/image/score/roll_${name}.png`)
    })

    // Load odds images
    for (let i = 1; i <= 10; i++) {
      this.load.image(`odds_add_${i}`, `assets/image/score/odds_add_${i}.png`)
      this.load.image(
        `odds_multi_${i}`,
        `assets/image/score/odds_multi_${i}.png`
      )
    }
    for (let i = 1; i <= 10; i++) {
      this.load.image(`odds_add_-${i}`, `assets/image/score/odds_add_-${i}.png`)
      this.load.image(
        `odds_multi_-${i}`,
        `assets/image/score/odds_multi_-${i}.png`
      )
    }

    // Load number images
    for (let i = 0; i <= 9; i++) {
      this.load.image(`fude_n_${i}`, `assets/image/score/fude_n_${i}.png`)
    }
    this.load.image('fude_n_-', 'assets/image/score/fude_n_-.png')
    this.load.image('fude_n_c', 'assets/image/score/fude_n_c.png')
    this.load.image('text_combo', 'assets/image/score/text_combo.png')

    // Load alphabet images for line indicators
    for (let i = 0; i < 11; i++) {
      const letter = String.fromCharCode(97 + i) // a-k
      this.load.image(
        `alphabet_${letter}`,
        `assets/image/score/alphabet_${letter}.png`
      )
    }

    // Load effects
    this.load.image('bg_bullet_time', 'assets/image/effect/bg_bullet_time.png')
    this.load.image('bg_revolution', 'assets/image/effect/bg_revolution.png')
    this.load.image(
      'bg_triple_seven',
      'assets/image/effect/bg_triple_seven.png'
    )
    this.load.image('effect_hand', 'assets/image/effect/effect_hand.png')

    // Load kanji images (decorative Japanese characters)
    for (let i = 1; i <= 35; i++) {
      this.load.image(`kanji_${i}`, `assets/image/kanji/kanji_${i}.png`)
    }

    // Load mon images (decorative emblems)
    for (let i = 1; i <= 14; i++) {
      this.load.image(`mon_${i}`, `assets/image/mon/mon_${i}.png`)
    }

    // Load line images (visual separators)
    this.load.image('line_h_1', 'assets/image/line/line_h_1.png')
    this.load.image('line_h_2', 'assets/image/line/line_h_2.png')
    this.load.image('line_h_3', 'assets/image/line/line_h_3.png')
    this.load.image('line_v_1', 'assets/image/line/line_v_1.png')

    // Load mod value images
    for (let i = 0; i <= 9; i++) {
      this.load.image(`mod_n_${i}`, `assets/image/mod/mod_n_${i}.png`)
    }

    // Load dummy image (used for placeholder)
    this.load.image('dummy', 'assets/image/dummy.png')
  }

  create(): void {
    const { width, height } = this.cameras.main

    // Set background color
    this.cameras.main.setBackgroundColor('#732121')

    // Create decorative sprites (background animations)
    this.backgroundSprites = new BackgroundSprites(this)
    this.kanjiSprites = new KanjiSprites(this)
    this.monSprites = new MonSprites(this)

    // Create ring sprites
    this.ringSprites1 = new RingSprites(this, 100, 300, 'left')
    this.ringSprites2 = new RingSprites(this, 142, 300, 'center')
    this.ringSprites3 = new RingSprites(this, 184, 300, 'right')

    // Create score display sprites
    this.scoresSprites = new ScoresSprites(this, 520, 300)
    this.currentScoreSprites = new CurrentScoreSprites(this, 520, 790)
    this.totalScoreSprites = new TotalScoreSprites(this, 245, 925)

    // Create back button
    this.backButton = this.add.image(34, 30, 'button_back')
    this.backButton.setAlpha(0.5)
    this.backButton.setInteractive({ useHandCursor: true })
    this.backButton.setDepth(100)

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

    // UI Text
    this.totalScoreText = this.add
      .text(245, 925, `スコア: ${this.total_score}`, {
        fontSize: '24px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setDepth(10)

    this.timeText = this.add
      .text(245, 17, `時間: 0`, {
        fontSize: '20px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setDepth(10)

    this.betTimesText = this.add
      .text(245, 60, `回数: 0`, {
        fontSize: '20px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setDepth(10)

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
        // Change BGM every minute
        this.audio.changeBGM()
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

    // Play start and rotation sounds
    this.audio.playSound('se_start')
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
    // Stop rotation sound when braking last ring
    this.audio.playSound('se_stop')

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

    // Show reach guides
    reaches.forEach(reach => {
      this.showGuide(`reach_${reach}`)
    })

    // Play reach voice
    if (reaches.length > 0) {
      this.audio.playSound('voice_reach')
    }

    // Check zone reaches (special numbers that trigger zones)
    if (!this.bullet_time && !this.revolution) {
      const zoneReaches = Rule.getZoneReaches(this.ring1_eyes, this.ring2_eyes)
      if (zoneReaches.length > 0) {
        this.audio.playSound('se_zone_reach')
      }
    }
  }

  private showGuide(guideKey: string): void {
    const guide = this.add.image(155, 382, `guide_${guideKey}`)
    guide.setAlpha(0)
    this.guideSprites.set(guideKey, guide)

    this.tweens.add({
      targets: guide,
      alpha: 1,
      duration: 200,
    })
  }

  private hideGuides(): void {
    this.guideSprites.forEach(guide => {
      this.tweens.add({
        targets: guide,
        alpha: 0,
        duration: 100,
        onComplete: () => guide.destroy(),
      })
    })
    this.guideSprites.clear()
  }

  private calculateScores(): void {
    this.hideGuides()

    this.tuples = Rule.calcTuples(
      this.ring1_eyes,
      this.ring2_eyes,
      this.ring3_eyes
    )

    // Check for zone triggers
    if (this.zone_seconds <= 0) {
      const zoneRolls = Rule.getZoneRolls(this.tuples)
      if (zoneRolls.length > 0) {
        // Will start zone after this round
        zoneRolls.forEach(roll => {
          this.audio.playSound(`voice_zone_${roll}`)
        })
        this.time.delayedCall(2000, () => {
          this.startZone()
        })
      }
    }

    // Check for ambulance (time penalty easter egg)
    if (Rule.isAmbulance(this.tuples)) {
      this.elapsed_time -= 10 * 1000
      this.audio.playSound('se_ambulance')
      this.stats.egg.ambulance++
    }

    this.mods = Rule.calcMods(this.tuples)
    this.mode = 'showing_mods'

    // Show mods and calculate scores
    this.time.delayedCall(300, () => {
      this.showMods()

      this.time.delayedCall(1400, () => {
        const scores = Rule.calcScores(this.tuples, this.mods, this.revolution)

        // Check for rollback (triple seven effect)
        let rollback = false
        if (this.rollbackStock > 0) {
          const reaches = Rule.getReaches(this.ring1_eyes, this.ring2_eyes)
          if (reaches.length > 0 && !Rule.isMultiWon(scores)) {
            rollback = true
          }
        }

        if (rollback) {
          this.doRollback()
        } else {
          this.showScoresAndFinish(scores)
        }
      })
    })
  }

  private showMods(): void {
    // Show guide for mods
    this.showGuide('mod_a')
    this.showGuide('mod_f')
    this.showGuide('mod_i')

    // Show mod values (would need proper positioning for each)
    // For now, simplified
  }

  private doRollback(): void {
    this.rollbackStock--
    this.hideGuides()

    // Show triple seven effect
    this.showEffect('triple_seven')
    this.time.delayedCall(1000, () => {
      this.hideEffect()
    })

    this.audio.playSound('voice_rollback')
    this.stats.triple_seven.rollback++

    // Redraw ring 3 with yellow if stock remains
    if (this.rollbackStock === 0) {
      this.ring3_color = this.ring1_color
    }

    // Re-spin ring 3
    this.mode = 'rotate_1'
  }

  private showScoresAndFinish(scores: Score[]): void {
    // Update stats
    scores.forEach(score => {
      const roll = score.roll as Roll
      if (roll.won) {
        this.stats.roll[roll.name as keyof typeof this.stats.roll]++
      } else {
        this.stats.roll.buta++
      }
    })

    const currentScores = Rule.calcCurrentScores(scores)
    this.currentScores = currentScores

    if (currentScores[2] >= 100) {
      this.i_combo++
      this.stats.max_combo = Math.max(this.stats.max_combo, this.i_combo)
    } else {
      this.i_combo = 0
    }

    const finalScores = Rule.addComboScore(currentScores, this.i_combo)
    this.total_score = Rule.calcTotalScore(this.total_score, finalScores)
    this.stats.max_gain = Math.max(this.stats.max_gain, finalScores[3])

    this.mode = 'showing_scores'

    // Display scores
    this.displayScores(scores, this.i_combo, finalScores)

    const wait = finalScores[3] !== finalScores[2] ? 1500 : 1000

    this.time.delayedCall(wait, () => {
      this.totalScoreText.setText(`スコア: ${this.total_score}`)
      this.mode = 'shown_scores'

      if (Rule.isAchieved(this.rule, this.elapsed_time, this.total_score)) {
        this.finishGame()
      }
    })
  }

  private displayScores(
    scores: Score[],
    combo: number,
    finalScores: number[]
  ): void {
    // Clear previous score images
    this.scoreImages.forEach(img => img.destroy())
    this.scoreImages = []
    this.comboImages.forEach(img => img.destroy())
    this.comboImages = []
    this.currentScoreImages.forEach(img => img.destroy())
    this.currentScoreImages = []

    // Display roll names and odds
    let yOffset = 300
    scores.forEach(score => {
      const roll = score.roll as Roll
      if (roll.won) {
        const rollImage = this.add.image(520, yOffset, `roll_${roll.name}`)
        rollImage.setAlpha(0)
        this.scoreImages.push(rollImage)

        this.tweens.add({
          targets: rollImage,
          alpha: 1,
          duration: 200,
        })

        // Show odds
        const oddsType = roll.f === 'multi' ? 'multi' : 'add'
        const oddsValue = roll.odds || 0
        const oddsImage = this.add.image(
          560,
          yOffset,
          `odds_${oddsType}_${oddsValue}`
        )
        oddsImage.setAlpha(0)
        this.scoreImages.push(oddsImage)

        this.tweens.add({
          targets: oddsImage,
          alpha: 1,
          duration: 200,
        })

        yOffset += 40
      }
    })

    // Display combo
    if (combo >= 2) {
      const comboText = this.add.image(350, 783, 'text_combo')
      comboText.setAlpha(0)
      this.comboImages.push(comboText)

      this.tweens.add({
        targets: comboText,
        alpha: 1,
        duration: 200,
      })

      // Display combo number
      const comboDigits = combo.toString().split('')
      let xOffset = 370
      comboDigits.forEach(digit => {
        const digitImage = this.add.image(xOffset, 783, `fude_n_${digit}`)
        digitImage.setAlpha(0)
        this.comboImages.push(digitImage)

        this.tweens.add({
          targets: digitImage,
          alpha: 1,
          duration: 200,
        })

        xOffset += 20
      })
    }

    // Display current score
    this.displayNumber(finalScores[3], 520, 790)
  }

  private displayNumber(num: number, x: number, y: number): void {
    const digits = num.toString().replace('-', '').split('')
    let xOffset = x

    if (num < 0) {
      const minusImage = this.add.image(xOffset, y, 'fude_n_-')
      minusImage.setAlpha(0)
      this.currentScoreImages.push(minusImage)

      this.tweens.add({
        targets: minusImage,
        alpha: 1,
        duration: 200,
      })

      xOffset += 20
    }

    digits.forEach(digit => {
      const digitImage = this.add.image(xOffset, y, `fude_n_${digit}`)
      digitImage.setAlpha(0)
      this.currentScoreImages.push(digitImage)

      this.tweens.add({
        targets: digitImage,
        alpha: 1,
        duration: 200,
      })

      xOffset += 20
    })
  }

  private startZone(): void {
    this.zone_seconds = 30
    this.audio.changeBGMVolume(0.1) // Lower BGM volume during zone

    // Randomly choose bullet time or revolution
    if (Math.random() > 0.5) {
      this.bullet_time = true
      this.speed = 2
      this.showEffect('bullet_time')
      this.audio.playSound('se_start_bullet_time')
      this.audio.playSound('voice_bullet_time')
      this.stats.zone.bullet_time++
    } else {
      this.revolution = true
      this.showEffect('revolution')
      this.audio.playSound('se_start_revolution')
      this.audio.playSound('voice_revolution')
      this.stats.zone.revolution++
    }
  }

  private finishZone(): void {
    this.zone_seconds = 0
    this.audio.changeBGMVolume(0.2) // Restore BGM volume

    if (this.bullet_time) {
      this.speed = 4
      this.audio.playSound('se_speed_up')
    }

    if (this.revolution) {
      this.audio.playSound('se_finish_revolution')
    }

    this.bullet_time = false
    this.revolution = false
    this.hideEffect()
  }

  private showEffect(effectType: string): void {
    if (this.effectSprite) {
      this.effectSprite.destroy()
    }

    this.effectSprite = this.add.image(320, 480, `bg_${effectType}`)
    this.effectSprite.setAlpha(0)
    this.effectSprite.setDepth(-1) // Behind everything else

    this.tweens.add({
      targets: this.effectSprite,
      alpha: 0.5,
      duration: 500,
    })
  }

  private hideEffect(): void {
    if (this.effectSprite) {
      this.tweens.add({
        targets: this.effectSprite,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          if (this.effectSprite) {
            this.effectSprite.destroy()
            this.effectSprite = null
          }
        },
      })
    }
  }

  private finishGame(): void {
    this.audio.stopBGM()
    this.audio.playBGM('bgm_result', 0.1)
    this.mode = 'shown_result'

    // Clear game elements
    this.hideGuides()
    this.scoreImages.forEach(img => img.destroy())
    this.comboImages.forEach(img => img.destroy())
    this.currentScoreImages.forEach(img => img.destroy())

    // Show result overlay
    const resultBg = this.add.rectangle(320, 480, 640, 960, 0x000000, 0.8)
    resultBg.setDepth(100)

    const resultText = this.add.text(320, 200, 'GAME CLEAR!', {
      fontSize: '48px',
      color: '#FFD700',
      fontStyle: 'bold',
    })
    resultText.setOrigin(0.5)
    resultText.setDepth(101)

    const statsText = this.add.text(
      320,
      300,
      `ルール: ${this.rule}
時間: ${Math.floor(this.elapsed_time / 1000)}秒
回数: ${this.bet_times}回
スコア: ${this.total_score}

最大コンボ: ${this.stats.max_combo}
最大獲得: ${this.stats.max_gain}
バレットタイム: ${this.stats.zone.bullet_time}回
レボリューション: ${this.stats.zone.revolution}回

クリックでタイトルへ`,
      {
        fontSize: '24px',
        color: '#FFFFFF',
        align: 'left',
      }
    )
    statsText.setOrigin(0.5)
    statsText.setDepth(101)

    // Return to title on click
    this.input.once('pointerdown', () => {
      this.scene.start('TitleScene', { back: true })
    })
  }

  private prepareNextSpin(): void {
    // Clear score displays
    this.hideGuides()
    this.scoreImages.forEach(img => img.destroy())
    this.scoreImages = []
    this.comboImages.forEach(img => img.destroy())
    this.comboImages = []
    this.currentScoreImages.forEach(img => img.destroy())
    this.currentScoreImages = []

    // Adjust speed based on current score (if not in bullet time)
    if (!this.bullet_time && this.currentScores.length > 0) {
      const currentScore = this.currentScores[3]
      const oldSpeed = this.speed
      this.speed = Rule.getNextSpeed(this.speed, currentScore)

      if (this.speed > oldSpeed) {
        this.audio.playSound('se_speed_up')
      } else if (this.speed < oldSpeed) {
        this.audio.playSound('se_speed_down')
      }
    }

    // Finish zone if time is up
    if (this.zone_seconds <= 0 && (this.bullet_time || this.revolution)) {
      this.finishZone()
    }

    // Determine ring color
    let color = 'white'
    if (this.currentScores.length > 0) {
      // Check if pink ribbon was won
      const scores = Rule.calcScores(this.tuples, this.mods, this.revolution)
      if (Rule.isPinkRibbon(scores)) {
        color = 'pink'
      }

      // Check for triple seven
      if (Rule.isTripleSeven(scores)) {
        this.showEffect('triple_seven')
        this.time.delayedCall(1000, () => {
          this.hideEffect()
        })

        this.audio.playSound('voice_triple_seven')

        const effect = Rule.getTripleSevenEffect(this.rollbackStock, this.stats)
        this.ring1_ns = effect.ring1_ns
        this.ring2_ns = effect.ring2_ns
        this.ring3_ns = effect.ring3_ns
        this.rollbackStock = effect.rollback_stock
        // Update stats from effect (merge the records)
        Object.assign(this.stats.roll, effect.stats.roll)
        Object.assign(this.stats.zone, effect.stats.zone)
        Object.assign(this.stats.triple_seven, effect.stats.triple_seven)
        Object.assign(this.stats.egg, effect.stats.egg)
        this.stats.max_combo = effect.stats.max_combo
        this.stats.max_gain = effect.stats.max_gain

        this.ring1_color = color
        this.ring2_color = color
        this.ring3_color = this.rollbackStock > 0 ? 'yellow' : color
      } else {
        // Normal shuffle
        this.ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        this.ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        this.ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

        this.ring1_color = color
        this.ring2_color = color
        this.ring3_color = color
      }
    } else {
      // First spin
      this.ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      this.ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      this.ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    }

    this.redrawRing(this.ring1Sprites, this.ring1_ns, this.ring1_color)
    this.redrawRing(this.ring2Sprites, this.ring2_ns, this.ring2_color)
    this.redrawRing(this.ring3Sprites, this.ring3_ns, this.ring3_color)

    // Change background every 1000 points
    const newBgIndex = Math.floor(this.total_score / 1000)
    if (newBgIndex !== this.bgIndex && newBgIndex >= 0) {
      this.bgIndex = newBgIndex
      const bgNum = (this.bgIndex % 37) + 1
      this.bgSprite.setTexture(`bg_${bgNum}`)
    }

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
