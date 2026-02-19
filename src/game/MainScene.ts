// Main Game Scene for Tin! Tilo! Rings!
// Complete port from Phina.js version
import Phaser from 'phaser'
import { Rule, RuleType, type Score, type GameStats } from './rule'
import { AudioManager } from './AudioManager'
import {
  RingSprites,
  BackgroundSprites,
  KanjiSprites,
  MonSprites,
  ScoresSprites,
  CurrentScoreSprites,
  TotalScoreSprites,
  LinesSprites,
  GuidesSprites,
  ModsSprites,
  AlphabetsSprites,
  ComboSprites,
  EffectSprites,
  BetTimesSprites,
  TimeSprites,
  ResultSprites,
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
  | 'input_name'

export class MainScene extends Phaser.Scene {
  private mode: GameMode = 'first'
  private rule: RuleType = 'rule_1_2943'
  private elapsed_time: number = 0
  private bet_times: number = 0
  private total_score: number = 0
  private audio!: AudioManager
  private backButton!: Phaser.GameObjects.Image
  private preventClick = false
  private keyWait = false

  private speed: number = 4
  private speed_bk: number = 4

  private i_combo: number = 0
  private i_score_1000: number = 0
  private i_second_1: number = 0
  private i_minute_1: number = 0

  private reserve_change_BGM: boolean = false
  private reserve_start_zone: boolean = false
  private reserve_finish_zone: boolean = false
  private zone_seconds: number = 0
  private bullet_time: boolean = false
  private revolution: boolean = false
  private rollback_stock: number = 0

  // Ring sprites
  private ringSprites1!: RingSprites
  private ringSprites2!: RingSprites
  private ringSprites3!: RingSprites

  // Decorative sprites
  private backgroundSprites!: BackgroundSprites

  // Score display sprites
  private scoresSprites!: ScoresSprites
  private currentScoreSprites!: CurrentScoreSprites
  private totalScoreSprites!: TotalScoreSprites

  // Sprite classes for UI elements
  private linesSprites!: LinesSprites
  private guidesSprites!: GuidesSprites
  private modsSprites!: ModsSprites
  private alphabetsSprites!: AlphabetsSprites
  private comboSprites!: ComboSprites
  private effectSprites!: EffectSprites
  private betTimesSprites!: BetTimesSprites
  private timeSprites!: TimeSprites
  private resultSprites!: ResultSprites

  // Scores for current round
  private scores: Score[] = []
  private current_scores: number[] = []
  private tuples: number[][] = []
  private mods: number[] = []

  // Stats
  private stats: GameStats = {
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
    if (data.rule) {
      this.rule = data.rule as RuleType
    }
  }

  preload(): void {
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
    this.load.image('roll_buta', 'assets/image/score/roll_buta.png')

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

    // Load kanji images
    for (let i = 1; i <= 35; i++) {
      this.load.image(`kanji_${i}`, `assets/image/kanji/kanji_${i}.png`)
    }

    // Load mon images
    for (let i = 1; i <= 14; i++) {
      this.load.image(`mon_${i}`, `assets/image/mon/mon_${i}.png`)
    }

    // Load line images
    this.load.image('line_h_1', 'assets/image/line/line_h_1.png')
    this.load.image('line_h_2', 'assets/image/line/line_h_2.png')
    this.load.image('line_h_3', 'assets/image/line/line_h_3.png')
    this.load.image('line_v_1', 'assets/image/line/line_v_1.png')

    // Load mod value images
    for (let i = 0; i <= 9; i++) {
      this.load.image(`mod_n_${i}`, `assets/image/mod/mod_n_${i}.png`)
    }

    // Load result images
    this.load.image('bg_result', 'assets/image/result/bg_result.png')
    this.load.image('high_score', 'assets/image/result/high_score.png')
    this.load.image(
      'button_change_rule',
      'assets/image/result/button_change_rule.png'
    )
    this.load.image(
      'button_one_more',
      'assets/image/result/button_one_more.png'
    )
    this.load.image('button_send', 'assets/image/result/button_send.png')
    this.load.image('button_ranking', 'assets/image/result/button_ranking.png')
    this.load.image(
      'button_change_rule_hover',
      'assets/image/result/button_change_rule_hover.png'
    )
    this.load.image(
      'button_one_more_hover',
      'assets/image/result/button_one_more_hover.png'
    )
    this.load.image(
      'button_send_hover',
      'assets/image/result/button_send_hover.png'
    )
    this.load.image(
      'button_ranking_hover',
      'assets/image/result/button_ranking_hover.png'
    )

    // Load rule images (used in ResultSprites)
    const ruleNames = [
      'rule_1_2943',
      'rule_1_8390',
      'rule_1_37654',
      'rule_2_2943',
      'rule_2_8390',
      'rule_2_37654',
      'rule_3_0409',
      'rule_3_2009',
      'rule_3_6819',
    ]
    ruleNames.forEach(name => {
      this.load.image(name, `assets/image/title/${name}.png`)
    })

    // Load dummy image
    this.load.image('dummy', 'assets/image/dummy.png')
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#732121')

    // Create decorative sprites (kanji/mon are self-animated, just need to exist)
    this.backgroundSprites = new BackgroundSprites(this)
    new KanjiSprites(this)
    new MonSprites(this)
    this.backgroundSprites.change(0, this.rule)

    // Create ring sprites
    this.ringSprites1 = new RingSprites(this, 100, 300, 'left')
    this.ringSprites2 = new RingSprites(this, 142, 300, 'center')
    this.ringSprites3 = new RingSprites(this, 184, 300, 'right')

    // Create score display sprites
    this.scoresSprites = new ScoresSprites(this, 520, 300)
    this.currentScoreSprites = new CurrentScoreSprites(this, 645, 790)
    this.totalScoreSprites = new TotalScoreSprites(this, 245, 925)

    // Create UI sprite classes
    this.linesSprites = new LinesSprites(this)
    this.guidesSprites = new GuidesSprites(this, 155, 382)
    this.modsSprites = new ModsSprites(this, 155, 382)
    this.alphabetsSprites = new AlphabetsSprites(this, 335, 300)
    this.comboSprites = new ComboSprites(this, 350, 783)
    this.effectSprites = new EffectSprites(this)
    this.betTimesSprites = new BetTimesSprites(this, 245, 60)
    this.timeSprites = new TimeSprites(this, 245, 17)
    this.resultSprites = new ResultSprites(this)

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
      this.scene.start('TitleScene', { back: true })
    })

    // Keyboard input - matches original's keydown handling with key_wait debounce
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.keyWait) {
        this.keyWait = true
        this.time.delayedCall(200, () => {
          this.keyWait = false
        })
        this.changeMode()
      }
    })

    // Mouse/touch input - matches original's onclick with mode filtering
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.preventClick) return

      // Ignore clicks on back button
      if (
        Phaser.Geom.Rectangle.Contains(
          this.backButton.getBounds(),
          pointer.x,
          pointer.y
        )
      ) {
        return
      }

      // Original onclick filtering: these modes ignore clicks
      switch (this.mode) {
        case 'first':
        case 'ready':
        case 'braking_3':
        case 'braked_3':
        case 'braking_2':
        case 'braked_2':
        case 'braking_1':
        case 'braked_1':
        case 'showing_mods':
        case 'showing_scores':
        case 'shown_result':
        case 'input_name':
          return
      }

      this.changeMode()
    })

    // Start game after 1 second delay (matches original)
    // NOTE: BGM is NOT started here. It starts at ready->rotate_3 transition.
    this.time.delayedCall(1000, () => {
      this.changeMode()
    })
  }

  update(_time: number, delta: number): void {
    // Update elapsed time - matches original's update switch
    switch (this.mode) {
      case 'first':
      case 'ready':
      case 'shown_result':
      case 'input_name':
        break
      default: {
        this.elapsed_time += delta

        const second = Math.floor(this.elapsed_time / 1000)
        const iSecond1 = Math.floor(second)
        if (iSecond1 !== this.i_second_1) {
          this.i_second_1 = iSecond1

          // Update time display
          const timeValue = Rule.getTime(this.rule, this.i_second_1)

          this.timeSprites.redraw(timeValue)

          // Zone countdown
          if (this.bullet_time || this.revolution) {
            if (this.zone_seconds > 0) {
              this.zone_seconds--

              if (this.zone_seconds <= 0) {
                this.reserve_finish_zone = true
              }
            }
          }
        }

        const iMinute1 = Math.floor(second / 60)
        if (iMinute1 > this.i_minute_1) {
          this.i_minute_1 = iMinute1
          this.reserve_change_BGM = true
        }
        break
      }
    }

    // Update ring rotations - matches original's second switch
    switch (this.mode) {
      case 'rotate_3':
        this.ringSprites1.rotate(this.speed)
        this.ringSprites2.rotate(this.speed + 1)
        this.ringSprites3.rotate(this.speed + 2)
        break
      case 'braking_3':
        this.ringSprites2.rotate(this.speed + 1)
        this.ringSprites3.rotate(this.speed + 2)
        break
      case 'rotate_2':
        this.ringSprites2.rotate(this.speed)
        this.ringSprites3.rotate(this.speed + 1)
        break
      case 'braking_2':
        this.ringSprites3.rotate(this.speed + 1)
        break
      case 'rotate_1':
        this.ringSprites3.rotate(this.speed)
        break
    }

    // NOTE: Zone finish is handled via reserve_finish_zone flag in shown_scores,
    // NOT by checking zone_seconds in update(). This prevents duplicate calls.
  }

  /**
   * Central state machine - matches original changeMode() exactly.
   * All state transitions go through here.
   */
  private changeMode(): void {
    switch (this.mode) {
      case 'first':
        this.onFirst()
        break
      case 'ready':
        this.onReady()
        break
      case 'rotate_3':
        this.mode = 'braking_3'
        this.onBraking3()
        break
      case 'braking_3':
        // Already braking, ignore
        break
      case 'braked_3':
        this.onBraked3()
        break
      case 'rotate_2':
        this.mode = 'braking_2'
        this.onBraking2()
        break
      case 'braking_2':
        break
      case 'braked_2':
        this.onBraked2()
        break
      case 'rotate_1':
        this.onRotate1Stop()
        break
      case 'braking_1':
        break
      case 'braked_1':
        this.onBraked1()
        break
      case 'showing_mods':
        break
      case 'showing_scores':
        break
      case 'shown_scores':
        this.onShownScores()
        break
      case 'shown_result':
        break
      case 'input_name':
        break
    }
  }

  /**
   * first -> ready sequence
   * Original: case "first" in changeMode (lines 239-275)
   */
  private onFirst(): void {
    // Show UI elements
    // this.infoSprite.show()
    // this.backSprite.show()
    this.linesSprites.show()

    // Initialize rings with random numbers
    const ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    this.ringSprites1.redraw(ring1_ns, 'white')
    this.ringSprites2.redraw(ring2_ns, 'white')
    this.ringSprites3.redraw(ring3_ns, 'white')

    this.ringSprites1.show()
    this.ringSprites2.show()
    this.ringSprites3.show()

    // Show total score and time
    this.totalScoreSprites.redraw(this.total_score)

    const timeValue = Rule.getTime(this.rule, this.i_second_1)
    this.timeSprites.redraw(timeValue)

    // Show bet times for rule_2 variants
    switch (this.rule) {
      case 'rule_2_2943':
      case 'rule_2_8390':
      case 'rule_2_37654':
        this.betTimesSprites.redraw(this.bet_times)
        break
    }

    // Play ready voices: 1 -> 2 -> 3 (matching original timing exactly)
    // Original: 500ms -> voice_ready_1 -> 1700ms -> voice_ready_2 -> 1300ms -> voice_ready_3 -> 700ms -> ready
    this.time.delayedCall(500, () => {
      this.audio.playSound('voice_ready_1')
      this.time.delayedCall(1700, () => {
        this.audio.playSound('voice_ready_2')
        this.time.delayedCall(1300, () => {
          this.audio.playSound('voice_ready_3')
          this.time.delayedCall(700, () => {
            this.mode = 'ready'
            this.changeMode()
          })
        })
      })
    })
  }

  /**
   * ready -> rotate_3
   * Original: case "ready" in changeMode (lines 276-295)
   * This is where BGM starts!
   */
  private onReady(): void {
    this.elapsed_time = 0
    this.audio.playBGM('bgm_1', 0.2)

    // Set opacity: ring1=normal, ring2=light, ring3=light
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('light')
    this.ringSprites3.changeOpacity('light')

    this.audio.playBGM('se_rotate', 1)
    this.bet_times++
    switch (this.rule) {
      case 'rule_2_2943':
      case 'rule_2_8390':
      case 'rule_2_37654':
        this.betTimesSprites.redraw(this.bet_times)
        break
    }

    this.mode = 'rotate_3'
  }

  /**
   * braking_3: brake ring1
   * Original: case "braking_3" (lines 300-305)
   */
  private onBraking3(): void {
    this.ringSprites1.brake(this.speed, () => {
      this.ringSprites1.stop(this.bullet_time || this.revolution)
      this.mode = 'braked_3'
      this.changeMode()
    })
  }

  /**
   * braked_3 -> rotate_2
   * Original: case "braked_3" (lines 307-312)
   */
  private onBraked3(): void {
    // Set opacity: ring1=normal, ring2=normal, ring3=light
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('normal')
    this.ringSprites3.changeOpacity('light')
    this.mode = 'rotate_2'
  }

  /**
   * braking_2: brake ring2
   * Original: case "braking_2" (lines 317-322)
   */
  private onBraking2(): void {
    this.ringSprites2.brake(this.speed, () => {
      this.ringSprites2.stop(this.bullet_time || this.revolution)
      this.mode = 'braked_2'
      this.changeMode()
    })
  }

  /**
   * braked_2: show reaches, then rotate_1
   * Original: case "braked_2" (lines 324-346)
   */
  private onBraked2(): void {
    // Set opacity: all normal
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('normal')
    this.ringSprites3.changeOpacity('normal')

    const reaches = Rule.getReaches(
      this.ringSprites1.eyes,
      this.ringSprites2.eyes
    )

    // Show reach guides
    reaches.forEach(reach => {
      this.guidesSprites.show(reach)
    })

    if (reaches.length > 0) {
      this.audio.playSound('voice_reach')
    }

    // Check zone reaches
    if (!this.bullet_time && !this.revolution) {
      const zoneReaches = Rule.getZoneReaches(
        this.ringSprites1.eyes,
        this.ringSprites2.eyes
      )
      if (zoneReaches.length > 0) {
        this.audio.playSound('se_zone_reach')
      }
    }

    this.mode = 'rotate_1'
  }

  /**
   * rotate_1 -> braking_1
   * Original: case "rotate_1" (lines 347-351)
   */
  private onRotate1Stop(): void {
    this.audio.stopBGM('se_rotate')
    this.mode = 'braking_1'
    this.onBraking1()
  }

  /**
   * braking_1: brake ring3
   * Original: case "braking_1" (lines 352-358)
   */
  private onBraking1(): void {
    this.ringSprites3.brake(this.speed, () => {
      this.ringSprites3.stop(this.bullet_time || this.revolution)
      this.mode = 'braked_1'
      this.changeMode()
    })
  }

  /**
   * braked_1: calculate tuples, check zones, show mods and scores
   * Original: case "braked_1" (lines 359-476)
   */
  private onBraked1(): void {
    // Set opacity: all normal
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('normal')
    this.ringSprites3.changeOpacity('normal')

    // Hide reach guides
    this.guidesSprites.hide()

    this.tuples = Rule.calcTuples(
      this.ringSprites1.eyes,
      this.ringSprites2.eyes,
      this.ringSprites3.eyes
    )

    // Check for zone triggers (using reserve flag, not direct start)
    // Original: if (this.zone_seconds <= 0) { ... reserve_start_zone = true }
    if (this.zone_seconds <= 0) {
      const zoneRolls = Rule.getZoneRolls(this.tuples)
      if (zoneRolls.length > 0) {
        this.reserve_start_zone = true
      }

      zoneRolls.forEach(roll => {
        this.audio.playSound(`voice_zone_${roll}`)
      })
    }

    // Check for ambulance (time bonus easter egg)
    if (Rule.isAmbulance(this.tuples)) {
      this.elapsed_time -= 10 * 1000
      this.audio.playSound('se_ambulance')
      this.stats.egg.ambulance++
    }

    this.mods = Rule.calcMods(this.tuples)
    this.mode = 'showing_mods'

    // Show mods after 300ms, then scores after 1400ms more
    this.time.delayedCall(300, () => {
      // Show guide for mods
      this.guidesSprites.show('mod')
      this.modsSprites.redraw(this.mods)
      this.alphabetsSprites.redraw(this.tuples, this.mods)

      this.time.delayedCall(1400, () => {
        this.scores = Rule.calcScores(this.tuples, this.mods, this.revolution)

        // Check for rollback (triple seven effect)
        let rollback = false
        if (this.rollback_stock > 0) {
          const reaches = Rule.getReaches(
            this.ringSprites1.eyes,
            this.ringSprites2.eyes
          )
          if (reaches.length > 0) {
            if (!Rule.isMultiWon(this.scores)) {
              // Hide current guides and show reach guides
              this.guidesSprites.hide()
              this.modsSprites.hide()
              this.alphabetsSprites.hide()
              reaches.forEach(reach => {
                this.guidesSprites.show(reach)
              })

              rollback = true
            }
          }
        }

        if (rollback) {
          this.doRollback()
        } else {
          this.showScoresAndWait()
        }
      })
    })
  }

  /**
   * Rollback: re-spin ring 3
   * Original: rollback logic in braked_1 (lines 414-431)
   */
  private doRollback(): void {
    this.rollback_stock--

    if (this.rollback_stock === 0) {
      const ns = this.ringSprites3.ns
      const color = this.ringSprites2.color // Original uses ring2's color
      this.ringSprites3.redraw(ns, color)
    }

    this.effectSprites.show('triple_seven')
    this.time.delayedCall(1000, () => {
      this.effectSprites.hide('triple_seven')
    })

    this.audio.playSound('voice_rollback')
    this.stats.triple_seven.rollback++
    this.mode = 'rotate_1'
  }

  /**
   * Show scores and wait for player interaction.
   * Original: else branch in rollback check (lines 432-475)
   */
  private showScoresAndWait(): void {
    // Update stats (original uses score.won, not score.roll.won)
    this.scores.forEach(score => {
      if (score.won && typeof score.roll !== 'string') {
        this.stats.roll[score.roll.name as keyof typeof this.stats.roll]++
      } else {
        this.stats.roll.buta++
      }
    })

    this.current_scores = Rule.calcCurrentScores(this.scores)

    if (this.current_scores[2] >= 100) {
      this.i_combo++
      this.stats.max_combo = Math.max(this.stats.max_combo, this.i_combo)
    } else {
      this.i_combo = 0
    }

    this.current_scores = Rule.addComboScore(this.current_scores, this.i_combo)
    this.total_score = Rule.calcTotalScore(
      this.total_score,
      this.current_scores
    )

    this.stats.max_gain = Math.max(this.stats.max_gain, this.current_scores[3])

    this.mode = 'showing_scores'
    this.scoresSprites.redraw(this.scores, this.revolution)

    if (this.i_combo >= 2) {
      this.comboSprites.redraw(this.i_combo)
    }

    this.currentScoreSprites.redraw(this.current_scores)

    let wait = 1000
    if (this.current_scores[3] !== this.current_scores[2]) {
      wait = 1500
    }

    this.time.delayedCall(wait, () => {
      this.totalScoreSprites.redraw(this.total_score)
      this.mode = 'shown_scores'
      // NOTE: isAchieved is checked when the player clicks/presses space
      // in shown_scores state, NOT here. This matches the original.
    })
  }

  /**
   * shown_scores: check achievement or prepare next spin
   * Original: case "shown_scores" in changeMode (lines 481-656)
   * This is called when the player clicks/presses space in shown_scores state.
   */
  private onShownScores(): void {
    // Check if game is achieved
    if (Rule.isAchieved(this.rule, this.elapsed_time, this.total_score)) {
      this.finishGame()
      return
    }

    // --- Prepare next spin ---
    // Hide all score-related displays
    this.guidesSprites.hide()
    this.modsSprites.hide()
    this.alphabetsSprites.hide()
    this.scoresSprites.hide()
    this.comboSprites.hide()
    this.currentScoreSprites.hide()

    // Adjust speed (only if not in bullet_time)
    const current_score = this.current_scores[3]

    if (!this.bullet_time) {
      const speed_bk = this.speed
      this.speed = Rule.getNextSpeed(this.speed, current_score)

      if (this.speed > speed_bk) {
        this.audio.playSound('se_speed_up')
      } else if (this.speed < speed_bk) {
        this.audio.playSound('se_speed_down')
      }
    }

    // Handle zone finish (via reserve flag)
    if (this.reserve_finish_zone) {
      this.reserve_finish_zone = false
      this.zone_seconds = 0
      this.audio.changeBGMVolume(0.2)

      if (this.bullet_time) {
        this.speed = this.speed_bk
        this.audio.playSound('se_speed_up')
      }

      if (this.revolution) {
        this.audio.playSound('se_finish_revolution')
      }

      this.bullet_time = false
      this.revolution = false
      this.effectSprites.hide()
    }

    // Handle zone start (via reserve flag)
    if (this.reserve_start_zone) {
      this.reserve_start_zone = false
      this.zone_seconds = 30
      this.audio.changeBGMVolume(0.1)

      // Randomly choose bullet time or revolution (original uses _.random(0,1) > 0)
      if (Math.random() > 0.5) {
        this.bullet_time = true
        this.speed_bk = this.speed
        this.speed = 2
        this.effectSprites.show('bullet_time')
        this.audio.playSound('se_start_bullet_time')
        this.audio.playSound('voice_bullet_time')
        this.stats.zone.bullet_time++
      } else {
        this.revolution = true
        this.effectSprites.show('revolution')
        this.audio.playSound('se_start_revolution')
        this.audio.playSound('voice_revolution')
        this.stats.zone.revolution++
      }
    }

    // Determine ring color
    let color = 'white'
    if (Rule.isPinkRibbon(this.scores)) {
      color = 'pink'
    }

    // Generate new ring numbers
    let ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    let ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    let ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    // Check for triple seven effect
    if (Rule.isTripleSeven(this.scores)) {
      this.effectSprites.show('triple_seven')
      this.time.delayedCall(1000, () => {
        this.effectSprites.hide('triple_seven')
      })

      this.audio.playSound('voice_triple_seven')

      const effect = Rule.getTripleSevenEffect(this.rollback_stock, this.stats)
      ring1_ns = effect.ring1_ns
      ring2_ns = effect.ring2_ns
      ring3_ns = effect.ring3_ns
      this.rollback_stock = effect.rollback_stock
      this.stats = effect.stats as typeof this.stats
    }

    // Redraw rings
    this.ringSprites1.redraw(ring1_ns, color)
    this.ringSprites2.redraw(ring2_ns, color)

    if (this.rollback_stock === 0) {
      this.ringSprites3.redraw(ring3_ns, color)
    } else {
      this.ringSprites3.redraw(ring3_ns, 'yellow')
    }

    // Set opacity: ring1=normal, ring2=light, ring3=light
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('light')
    this.ringSprites3.changeOpacity('light')

    // Change ring patterns (visual perspective variation)
    this.ringSprites1.changeRingPattern()
    this.ringSprites2.changeRingPattern()
    this.ringSprites3.changeRingPattern()

    // Check for background change (every 1000 points)
    const i_score_1000 = Math.floor(this.total_score / 1000)
    if (i_score_1000 !== this.i_score_1000) {
      this.i_score_1000 = i_score_1000
      if (this.i_score_1000 < 0) {
        this.i_score_1000 = 0
      }
      this.backgroundSprites.change(this.i_score_1000, this.rule)
    }

    // Check for BGM change (every minute, via reserve flag)
    if (this.reserve_change_BGM) {
      this.reserve_change_BGM = false
      this.audio.changeBGM()
    }

    // Play start sound and start se_rotate loop (original: SoundManager.playMusic + Audio.playBGM)
    this.audio.playSound('se_start')
    this.audio.playBGM('se_rotate', 1)

    // Increment bet times
    this.bet_times++
    switch (this.rule) {
      case 'rule_2_2943':
      case 'rule_2_8390':
      case 'rule_2_37654':
        this.betTimesSprites.redraw(this.bet_times)
        break
    }

    this.mode = 'rotate_3'
  }

  /**
   * Game clear: show result screen
   * Original: shown_scores isAchieved branch (lines 482-524)
   */
  private finishGame(): void {
    this.audio.stopAllBGM()
    this.audio.playBGM('bgm_result', 0.1)

    // Determine high score
    let isHighScore = false
    const savedHighScores = this.getHighScores()
    switch (this.rule) {
      case 'rule_1_2943':
      case 'rule_1_8390':
      case 'rule_1_37654':
        if (
          savedHighScores[this.rule] === null ||
          this.elapsed_time < savedHighScores[this.rule]!
        ) {
          isHighScore = true
          savedHighScores[this.rule] = this.elapsed_time
        }
        break
      case 'rule_2_2943':
      case 'rule_2_8390':
      case 'rule_2_37654':
        if (
          savedHighScores[this.rule] === null ||
          this.bet_times < savedHighScores[this.rule]!
        ) {
          isHighScore = true
          savedHighScores[this.rule] = this.bet_times
        }
        break
      case 'rule_3_0409':
      case 'rule_3_2009':
      case 'rule_3_6819':
        if (
          savedHighScores[this.rule] === null ||
          this.total_score > savedHighScores[this.rule]!
        ) {
          isHighScore = true
          savedHighScores[this.rule] = this.total_score
        }
        break
    }
    this.saveHighScores(savedHighScores)

    // Show result
    this.resultSprites.redraw(
      this.rule,
      this.elapsed_time,
      this.bet_times,
      this.total_score,
      this.stats,
      isHighScore
    )

    this.mode = 'shown_result'

    // Play result voices (original: voice_result, then 1500ms later voice_result_high_score or voice_result_negi)
    this.audio.playSound('voice_result')
    this.time.delayedCall(1500, () => {
      if (isHighScore) {
        this.audio.playSound('voice_result_high_score')
      } else {
        this.audio.playSound('voice_result_negi')
      }
    })

    // Button handlers
    const btnChangeRule = this.resultSprites.getButtonChangeRule()
    const btnOneMore = this.resultSprites.getButtonOneMore()

    btnChangeRule.on('pointerover', () => {
      if (this.mode !== 'shown_result') return
      btnChangeRule.setTexture('button_change_rule_hover')
      this.audio.playSound('voice_back')
    })
    btnChangeRule.on('pointerout', () => {
      btnChangeRule.setTexture('button_change_rule')
    })
    btnChangeRule.on('pointerdown', () => {
      if (this.mode !== 'shown_result') return
      this.audio.stopAllBGM()
      this.scene.start('TitleScene', { back: true })
    })

    btnOneMore.on('pointerover', () => {
      if (this.mode !== 'shown_result') return
      btnOneMore.setTexture('button_one_more_hover')
      this.audio.playSound('voice_one_more')
    })
    btnOneMore.on('pointerout', () => {
      btnOneMore.setTexture('button_one_more')
    })
    btnOneMore.on('pointerdown', () => {
      if (this.mode !== 'shown_result') return
      this.audio.stopAllBGM()
      this.scene.start('MainScene', { rule: this.rule })
    })
  }

  private getHighScores(): Record<string, number | null> {
    try {
      const saved = localStorage.getItem('cee-lo-rings-high-scores')
      if (saved) return JSON.parse(saved)
    } catch {
      /* ignore */
    }
    return {
      rule_1_2943: null,
      rule_1_8390: null,
      rule_1_37654: null,
      rule_2_2943: null,
      rule_2_8390: null,
      rule_2_37654: null,
      rule_3_0409: null,
      rule_3_2009: null,
      rule_3_6819: null,
    }
  }

  private saveHighScores(scores: Record<string, number | null>): void {
    try {
      localStorage.setItem('cee-lo-rings-high-scores', JSON.stringify(scores))
    } catch {
      /* ignore */
    }
  }
}
