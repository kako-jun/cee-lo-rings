import { Rectangle, Sprite, Texture, Assets } from 'pixi.js'
import { Scene, type SceneContext } from './Scene'
import { Rule, type RuleType, type Score, type GameStats } from './rule'
import { load as loadHighScores, save as saveHighScores } from './highscore'
import type { GameMode, GameState } from './GameState'
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

export class MainScene extends Scene {
  private mode: GameMode = 'first'
  private rule: RuleType = 'rule_1_2943'
  private elapsed_time: number = 0
  private bet_times: number = 0
  private total_score: number = 0
  private backButton!: Sprite
  private preventClick = false

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

  private ringSprites1!: RingSprites
  private ringSprites2!: RingSprites
  private ringSprites3!: RingSprites

  private backgroundSprites!: BackgroundSprites

  private scoresSprites!: ScoresSprites
  private currentScoreSprites!: CurrentScoreSprites
  private totalScoreSprites!: TotalScoreSprites

  private linesSprites!: LinesSprites
  private guidesSprites!: GuidesSprites
  private modsSprites!: ModsSprites
  private alphabetsSprites!: AlphabetsSprites
  private comboSprites!: ComboSprites
  private effectSprites!: EffectSprites
  private betTimesSprites!: BetTimesSprites
  private timeSprites!: TimeSprites
  private resultSprites!: ResultSprites

  private scores: Score[] = []
  private current_scores: number[] = []
  private tuples: number[][] = []
  private mods: number[] = []

  private stats: GameStats = newStats()

  constructor(ctx: SceneContext, rule: RuleType, initial?: GameState) {
    super(ctx)
    this.rule = rule
    if (initial) {
      this.applyState(initial)
    }
    this.build()
    this.attachInput()
    this.onTick(ticker => this.tick(ticker.deltaMS))
    // Kick off the state machine after a 1s delay (matches original).
    this.delayedCall(1000, () => this.changeMode())
  }

  private applyState(s: GameState): void {
    this.rule = s.rule
    this.mode = s.mode
    this.elapsed_time = s.elapsedTime
    this.bet_times = s.betTimes
    this.total_score = s.totalScore
    this.speed = s.speed
    this.i_combo = s.iCombo
    this.i_score_1000 = s.iScore1000
    this.bullet_time = s.bulletTime
    this.revolution = s.revolution
    this.zone_seconds = s.zoneSeconds
    this.rollback_stock = s.rollbackStock
    this.reserve_change_BGM = s.reserveChangeBGM
    this.reserve_start_zone = s.reserveStartZone
    this.reserve_finish_zone = s.reserveFinishZone
    this.stats = s.stats
  }

  private build(): void {
    this.backgroundSprites = new BackgroundSprites(this)
    new KanjiSprites(this)
    new MonSprites(this)
    this.backgroundSprites.change(0, this.rule)

    this.ringSprites1 = new RingSprites(this, 100, 300, 'left')
    this.ringSprites2 = new RingSprites(this, 142, 300, 'center')
    this.ringSprites3 = new RingSprites(this, 184, 300, 'right')

    this.scoresSprites = new ScoresSprites(this, 520, 300)
    this.currentScoreSprites = new CurrentScoreSprites(this, 645, 790)
    this.totalScoreSprites = new TotalScoreSprites(this, 245, 925)

    this.linesSprites = new LinesSprites(this)
    this.guidesSprites = new GuidesSprites(this, 155, 382)
    this.modsSprites = new ModsSprites(this, 155, 382)
    this.alphabetsSprites = new AlphabetsSprites(this, 335, 300)
    this.comboSprites = new ComboSprites(this, 350, 783)
    this.effectSprites = new EffectSprites(this)
    this.betTimesSprites = new BetTimesSprites(this, 245, 60)
    this.timeSprites = new TimeSprites(this, 245, 17)
    this.resultSprites = new ResultSprites(this)

    this.backButton = new Sprite(Assets.get('button_back') ?? Texture.EMPTY)
    this.backButton.anchor.set(0.5)
    this.backButton.position.set(34, 30)
    this.backButton.alpha = 0.5
    this.backButton.zIndex = 100
    this.backButton.eventMode = 'static'
    this.backButton.cursor = 'pointer'
    this.addChild(this.backButton)

    this.backButton.on('pointerover', () => {
      if (this.mode === 'first' || this.mode === 'ready') return
      this.backButton.texture = Assets.get('button_back_hover')
      this.audio.playSound('voice_back')
    })
    this.backButton.on('pointerout', () => {
      this.backButton.texture = Assets.get('button_back')
    })
    this.backButton.on('pointerdown', () => {
      if (this.mode === 'first' || this.mode === 'ready') return
      if (this.preventClick) return
      this.preventClick = true
      this.audio.stopBGM()
      this.ctx.goTitle({ back: true })
    })

    // Register back-button rectangle so InputManager ignores presses inside it
    const b = this.backButton.getBounds()
    this.input.addExclude(new Rectangle(b.x, b.y, b.width, b.height))
  }

  private attachInput(): void {
    this.input.setHandler(() => {
      if (this.preventClick) return
      switch (this.mode) {
        // These modes ignore manual triggers (matches original onclick filter)
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
          return
      }
      this.changeMode()
    })
    // 'first' / 'ready' specifically allow Space (the original allowed keyboard
    // but not pointer for those modes). Keep simple: gate space the same way.
  }

  private tick(deltaMS: number): void {
    switch (this.mode) {
      case 'first':
      case 'ready':
      case 'shown_result':
        break
      default: {
        this.elapsed_time += deltaMS

        const second = Math.floor(this.elapsed_time / 1000)
        const iSecond1 = Math.floor(second)
        if (iSecond1 !== this.i_second_1) {
          this.i_second_1 = iSecond1
          const timeValue = Rule.getTime(this.rule, this.i_second_1)
          this.timeSprites.redraw(timeValue)

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
  }

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
        void this.onBraking3()
        break
      case 'braking_3':
        break
      case 'braked_3':
        this.onBraked3()
        break
      case 'rotate_2':
        this.mode = 'braking_2'
        void this.onBraking2()
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
    }
  }

  private onFirst(): void {
    this.linesSprites.show()

    const ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    this.ringSprites1.redraw(ring1_ns, 'white')
    this.ringSprites2.redraw(ring2_ns, 'white')
    this.ringSprites3.redraw(ring3_ns, 'white')

    this.ringSprites1.show()
    this.ringSprites2.show()
    this.ringSprites3.show()

    this.totalScoreSprites.redraw(this.total_score)

    const timeValue = Rule.getTime(this.rule, this.i_second_1)
    this.timeSprites.redraw(timeValue)

    switch (this.rule) {
      case 'rule_2_2943':
      case 'rule_2_8390':
      case 'rule_2_37654':
        this.betTimesSprites.redraw(this.bet_times)
        break
    }

    this.delayedCall(500, () => {
      this.audio.playSound('voice_ready_1')
      this.delayedCall(1700, () => {
        this.audio.playSound('voice_ready_2')
        this.delayedCall(1300, () => {
          this.audio.playSound('voice_ready_3')
          this.delayedCall(700, () => {
            this.mode = 'ready'
            this.changeMode()
          })
        })
      })
    })
  }

  private onReady(): void {
    this.elapsed_time = 0
    this.audio.playBGM('bgm_1', 0.2)

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

  private async onBraking3(): Promise<void> {
    await this.ringSprites1.brake(this.speed)
    if (this.disposed) return
    this.ringSprites1.stop(this.bullet_time || this.revolution)
    this.mode = 'braked_3'
    this.changeMode()
  }

  private onBraked3(): void {
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('normal')
    this.ringSprites3.changeOpacity('light')
    this.mode = 'rotate_2'
  }

  private async onBraking2(): Promise<void> {
    await this.ringSprites2.brake(this.speed)
    if (this.disposed) return
    this.ringSprites2.stop(this.bullet_time || this.revolution)
    this.mode = 'braked_2'
    this.changeMode()
  }

  private onBraked2(): void {
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('normal')
    this.ringSprites3.changeOpacity('normal')

    const reaches = Rule.getReaches(
      this.ringSprites1.eyes,
      this.ringSprites2.eyes
    )

    reaches.forEach(reach => this.guidesSprites.show(reach))

    if (reaches.length > 0) this.audio.playSound('voice_reach')

    if (!this.bullet_time && !this.revolution) {
      const zoneReaches = Rule.getZoneReaches(
        this.ringSprites1.eyes,
        this.ringSprites2.eyes
      )
      if (zoneReaches.length > 0) this.audio.playSound('se_zone_reach')
    }

    this.mode = 'rotate_1'
  }

  private onRotate1Stop(): void {
    this.audio.stopBGM('se_rotate')
    this.mode = 'braking_1'
    void this.onBraking1()
  }

  private async onBraking1(): Promise<void> {
    await this.ringSprites3.brake(this.speed)
    if (this.disposed) return
    this.ringSprites3.stop(this.bullet_time || this.revolution)
    this.mode = 'braked_1'
    this.changeMode()
  }

  private onBraked1(): void {
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('normal')
    this.ringSprites3.changeOpacity('normal')

    this.guidesSprites.hide()

    this.tuples = Rule.calcTuples(
      this.ringSprites1.eyes,
      this.ringSprites2.eyes,
      this.ringSprites3.eyes
    )

    if (this.zone_seconds <= 0) {
      const zoneRolls = Rule.getZoneRolls(this.tuples)
      if (zoneRolls.length > 0) this.reserve_start_zone = true
      zoneRolls.forEach(roll => this.audio.playSound(`voice_zone_${roll}`))
    }

    if (Rule.isAmbulance(this.tuples)) {
      this.elapsed_time -= 10 * 1000
      this.audio.playSound('se_ambulance')
      this.stats.egg.ambulance++
    }

    this.mods = Rule.calcMods(this.tuples)
    this.mode = 'showing_mods'

    this.delayedCall(300, () => {
      this.guidesSprites.show('mod')
      this.modsSprites.redraw(this.mods)
      this.alphabetsSprites.redraw(this.tuples, this.mods)

      this.delayedCall(1400, () => {
        this.scores = Rule.calcScores(this.tuples, this.mods, this.revolution)

        let rollback = false
        if (this.rollback_stock > 0) {
          const reaches = Rule.getReaches(
            this.ringSprites1.eyes,
            this.ringSprites2.eyes
          )
          if (reaches.length > 0) {
            if (!Rule.isMultiWon(this.scores)) {
              this.guidesSprites.hide()
              this.modsSprites.hide()
              this.alphabetsSprites.hide()
              reaches.forEach(reach => this.guidesSprites.show(reach))
              rollback = true
            }
          }
        }

        if (rollback) this.doRollback()
        else this.showScoresAndWait()
      })
    })
  }

  private doRollback(): void {
    this.rollback_stock--

    if (this.rollback_stock === 0) {
      const ns = this.ringSprites3.ns
      const color = this.ringSprites2.color
      this.ringSprites3.redraw(ns, color)
    }

    this.effectSprites.show('triple_seven')
    this.delayedCall(1000, () => this.effectSprites.hide('triple_seven'))

    this.audio.playSound('voice_rollback')
    this.stats.triple_seven.rollback++
    this.mode = 'rotate_1'
  }

  private showScoresAndWait(): void {
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

    if (this.i_combo >= 2) this.comboSprites.redraw(this.i_combo)

    this.currentScoreSprites.redraw(this.current_scores)

    let wait = 1000
    if (this.current_scores[3] !== this.current_scores[2]) wait = 1500

    this.delayedCall(wait, () => {
      this.totalScoreSprites.redraw(this.total_score)
      this.mode = 'shown_scores'
    })
  }

  private onShownScores(): void {
    if (Rule.isAchieved(this.rule, this.elapsed_time, this.total_score)) {
      this.finishGame()
      return
    }

    this.guidesSprites.hide()
    this.modsSprites.hide()
    this.alphabetsSprites.hide()
    this.scoresSprites.hide()
    this.comboSprites.hide()
    this.currentScoreSprites.hide()

    const current_score = this.current_scores[3]

    if (!this.bullet_time) {
      const speed_bk = this.speed
      this.speed = Rule.getNextSpeed(this.speed, current_score)
      if (this.speed > speed_bk) this.audio.playSound('se_speed_up')
      else if (this.speed < speed_bk) this.audio.playSound('se_speed_down')
    }

    if (this.reserve_finish_zone) {
      this.reserve_finish_zone = false
      this.zone_seconds = 0
      this.audio.changeBGMVolume(0.2)

      if (this.bullet_time) {
        this.speed = this.speed_bk
        this.audio.playSound('se_speed_up')
      }
      if (this.revolution) this.audio.playSound('se_finish_revolution')

      this.bullet_time = false
      this.revolution = false
      this.effectSprites.hide()
    }

    if (this.reserve_start_zone) {
      this.reserve_start_zone = false
      this.zone_seconds = 30
      this.audio.changeBGMVolume(0.1)

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

    let color = 'white'
    if (Rule.isPinkRibbon(this.scores)) color = 'pink'

    let ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    let ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    let ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    if (Rule.isTripleSeven(this.scores)) {
      this.effectSprites.show('triple_seven')
      this.delayedCall(1000, () => this.effectSprites.hide('triple_seven'))
      this.audio.playSound('voice_triple_seven')

      const effect = Rule.getTripleSevenEffect(this.rollback_stock, this.stats)
      ring1_ns = effect.ring1_ns
      ring2_ns = effect.ring2_ns
      ring3_ns = effect.ring3_ns
      this.rollback_stock = effect.rollback_stock
      this.stats = effect.stats as typeof this.stats
    }

    this.ringSprites1.redraw(ring1_ns, color)
    this.ringSprites2.redraw(ring2_ns, color)
    if (this.rollback_stock === 0) this.ringSprites3.redraw(ring3_ns, color)
    else this.ringSprites3.redraw(ring3_ns, 'yellow')

    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('light')
    this.ringSprites3.changeOpacity('light')

    this.ringSprites1.changeRingPattern()
    this.ringSprites2.changeRingPattern()
    this.ringSprites3.changeRingPattern()

    const i_score_1000 = Math.floor(this.total_score / 1000)
    if (i_score_1000 !== this.i_score_1000) {
      this.i_score_1000 = i_score_1000
      if (this.i_score_1000 < 0) this.i_score_1000 = 0
      this.backgroundSprites.change(this.i_score_1000, this.rule)
    }

    if (this.reserve_change_BGM) {
      this.reserve_change_BGM = false
      this.audio.changeBGM()
    }

    this.audio.playSound('se_start')
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

  private finishGame(): void {
    this.audio.stopAllBGM()
    this.audio.playBGM('bgm_result', 0.1)

    let isHighScore = false
    const savedHighScores = loadHighScores()
    switch (this.rule) {
      case 'rule_1_2943':
      case 'rule_1_8390':
      case 'rule_1_37654':
        if (
          savedHighScores[this.rule] === null ||
          this.elapsed_time < (savedHighScores[this.rule] as number)
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
          this.bet_times < (savedHighScores[this.rule] as number)
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
          this.total_score > (savedHighScores[this.rule] as number)
        ) {
          isHighScore = true
          savedHighScores[this.rule] = this.total_score
        }
        break
    }
    saveHighScores(savedHighScores)

    this.resultSprites.redraw(
      this.rule,
      this.elapsed_time,
      this.bet_times,
      this.total_score,
      this.stats,
      isHighScore
    )

    this.mode = 'shown_result'

    this.audio.playSound('voice_result')
    this.delayedCall(1500, () => {
      if (isHighScore) this.audio.playSound('voice_result_high_score')
      else this.audio.playSound('voice_result_negi')
    })

    const btnChangeRule = this.resultSprites.getButtonChangeRule()
    const btnOneMore = this.resultSprites.getButtonOneMore()

    btnChangeRule.on('pointerover', () => {
      if (this.mode !== 'shown_result') return
      btnChangeRule.texture = Assets.get('button_change_rule_hover')
      this.audio.playSound('voice_back')
    })
    btnChangeRule.on('pointerout', () => {
      btnChangeRule.texture = Assets.get('button_change_rule')
    })
    btnChangeRule.on('pointerdown', () => {
      if (this.mode !== 'shown_result') return
      this.audio.stopAllBGM()
      this.ctx.goTitle({ back: true })
    })

    btnOneMore.on('pointerover', () => {
      if (this.mode !== 'shown_result') return
      btnOneMore.texture = Assets.get('button_one_more_hover')
      this.audio.playSound('voice_one_more')
    })
    btnOneMore.on('pointerout', () => {
      btnOneMore.texture = Assets.get('button_one_more')
    })
    btnOneMore.on('pointerdown', () => {
      if (this.mode !== 'shown_result') return
      this.audio.stopAllBGM()
      this.ctx.goMain({ rule: this.rule })
    })
  }
}

function newStats(): GameStats {
  return {
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
}
