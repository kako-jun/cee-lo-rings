// Phina main.js (MainScene) を Pixi で再現
// 状態 (mode):
//   first → ready → rotate_3 → braking_3 → braked_3 → rotate_2 → braking_2 → braked_2
//      → rotate_1 → braking_1 → braked_1 → showing_mods → showing_scores → shown_scores
//      → (loop) または → shown_result
// 入力 (Space / pointerdown) は changeMode() を呼ぶ。特定 mode は無視

import { Audio } from './audio'
import {
  Eyes,
  Rule,
  RuleId,
  Score,
  Stats,
  newStats,
  CurrentScores,
} from './rule'
import { Tuple } from './rolls'
import { Scene } from './Scene'
import { loadHighScore, saveHighScore } from './highscore'
import type { App } from './App'

import { BackgroundSprites } from './sprites/BackgroundSprites'
import { KanjiSprites } from './sprites/KanjiSprites'
import { MonSprites } from './sprites/MonSprites'
import { EffectSprites } from './sprites/EffectSprites'
import { LinesSprites } from './sprites/LinesSprites'
import { GuidesSprites } from './sprites/GuidesSprites'
import { ModsSprites } from './sprites/ModsSprites'
import { RingSprites } from './sprites/RingSprites'
import { AlphabetsSprites } from './sprites/AlphabetsSprites'
import { ScoresSprites } from './sprites/ScoresSprites'
import { ComboSprites } from './sprites/ComboSprites'
import { CurrentScoreSprites } from './sprites/CurrentScoreSprites'
import { TotalScoreSprites } from './sprites/TotalScoreSprites'
import { TimeSprites } from './sprites/TimeSprites'
import { BetTimesSprites } from './sprites/BetTimesSprites'
import { InfoSprite } from './sprites/InfoSprite'
import { BackSprite } from './sprites/BackSprite'
import { ResultSprites } from './sprites/ResultSprites'

type Mode =
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

const isBet2Rule = (rule: string): boolean =>
  rule === 'rule_2_2943' || rule === 'rule_2_8390' || rule === 'rule_2_37654'

export class MainScene extends Scene {
  rule: RuleId
  mode: Mode = 'first'
  prevent_click = false

  private elapsed_time = 0
  private bet_times = 0
  private total_score = 0
  stats: Stats = newStats()

  private speed = 4
  private speed_bk = 4

  private i_combo = 0
  private i_score_1000 = 0
  private i_second_1 = 0
  private i_minute_1 = 0

  private reserve_change_BGM = false
  private reserve_start_zone = false
  private reserve_finish_zone = false
  private zone_seconds = 0
  private bullet_time = false
  private revolution = false
  private rollback_stock = 0

  private tuples: Tuple[] = []
  private mods: number[] = []
  private scores: Score[] = []
  private current_scores: CurrentScores = [0, 0, 0, 0]

  private backgroundSprites: BackgroundSprites
  private kanjiSprites: KanjiSprites
  private monSprites: MonSprites
  private effectSprites: EffectSprites
  private linesSprites: LinesSprites
  private guidesSprites: GuidesSprites
  private modsSprites: ModsSprites
  private ringSprites1: RingSprites
  private ringSprites2: RingSprites
  private ringSprites3: RingSprites
  private alphabetsSprites: AlphabetsSprites
  private scoresSprites: ScoresSprites
  private comboSprites: ComboSprites
  private currentScoreSprites: CurrentScoreSprites
  private totalScoreSprites: TotalScoreSprites
  private timeSprites: TimeSprites
  private betTimesSprites: BetTimesSprites
  private infoSprite: InfoSprite
  private backSprite: BackSprite
  private resultSprites: ResultSprites | null = null

  constructor(_app: App, rule: string) {
    super()
    this.rule = rule as RuleId

    this.backgroundSprites = new BackgroundSprites(this)
    this.kanjiSprites = new KanjiSprites(this)
    this.monSprites = new MonSprites(this)
    this.effectSprites = new EffectSprites(this)
    this.linesSprites = new LinesSprites(this)
    this.guidesSprites = new GuidesSprites(this, 155, 382)
    this.modsSprites = new ModsSprites(this, 155, 382)
    this.ringSprites1 = new RingSprites(this, 100, 300, 'left')
    this.ringSprites2 = new RingSprites(this, 142, 300, 'center')
    this.ringSprites3 = new RingSprites(this, 184, 300, 'right')
    this.alphabetsSprites = new AlphabetsSprites(this, 335, 300)
    this.scoresSprites = new ScoresSprites(this, 520, 300)
    this.comboSprites = new ComboSprites(this, 350, 783)
    this.currentScoreSprites = new CurrentScoreSprites(this, 645, 790)
    this.totalScoreSprites = new TotalScoreSprites(this, 245, 925)
    this.timeSprites = new TimeSprites(this, 245, 17)
    this.betTimesSprites = new BetTimesSprites(this, 245, 60)
    this.infoSprite = new InfoSprite(this, 606, 30)
    this.backSprite = new BackSprite(this, 34, 30)

    this.kanjiSprites.change()
    this.monSprites.change()
    this.backgroundSprites.change(0, this.rule)

    setTimeout(() => this.changeMode(), 1000)
  }

  override update(deltaMs: number): void {
    switch (this.mode) {
      case 'first':
      case 'ready':
      case 'shown_result':
      case 'input_name':
        break
      default: {
        this.elapsed_time += deltaMs
        const second = Math.floor(this.elapsed_time / 1000)
        if (second !== this.i_second_1) {
          this.i_second_1 = second
          this.timeSprites.redraw(Rule.getTime(this.rule, this.i_second_1))
          if (this.bullet_time || this.revolution) {
            if (this.zone_seconds > 0) {
              this.zone_seconds--
              if (this.zone_seconds <= 0) this.reserve_finish_zone = true
            }
          }
        }
        const i_minute_1 = Math.floor(second / 60)
        if (i_minute_1 > this.i_minute_1) {
          this.i_minute_1 = i_minute_1
          this.reserve_change_BGM = true
        }
        break
      }
    }

    // ring 回転は state ごとの speed で進める
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
      default:
        break
    }
  }

  override onClick(): void {
    if (this.prevent_click) return
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
  }

  changeMode(): void {
    switch (this.mode) {
      case 'first':
        this.handleFirst()
        break
      case 'ready':
        this.handleReady()
        break
      case 'rotate_3':
        this.mode = 'braking_3'
        this.changeMode()
        break
      case 'braking_3':
        this.ringSprites1.brake(this.speed, () => {
          this.ringSprites1.stop(this.bullet_time || this.revolution)
          this.mode = 'braked_3'
          this.changeMode()
        })
        break
      case 'braked_3':
        this.ringSprites1.changeOpacity('normal')
        this.ringSprites2.changeOpacity('normal')
        this.ringSprites3.changeOpacity('light')
        this.mode = 'rotate_2'
        break
      case 'rotate_2':
        this.mode = 'braking_2'
        this.changeMode()
        break
      case 'braking_2':
        this.ringSprites2.brake(this.speed, () => {
          this.ringSprites2.stop(this.bullet_time || this.revolution)
          this.mode = 'braked_2'
          this.changeMode()
        })
        break
      case 'braked_2':
        this.handleBraked2()
        break
      case 'rotate_1':
        Audio.stopBGM('se_rotate')
        this.mode = 'braking_1'
        this.changeMode()
        break
      case 'braking_1':
        this.ringSprites3.brake(this.speed, () => {
          this.ringSprites3.stop(this.bullet_time || this.revolution)
          this.mode = 'braked_1'
          this.changeMode()
        })
        break
      case 'braked_1':
        this.handleBraked1()
        break
      case 'shown_scores':
        this.handleShownScores()
        break
      default:
        break
    }
  }

  private eyes(ring: RingSprites): Eyes {
    const e = ring.eyes
    return [e[0], e[1], e[2], e[3], e[4]]
  }

  private handleFirst(): void {
    this.infoSprite.show()
    this.backSprite.show()
    this.linesSprites.show()

    const ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    this.ringSprites1.redraw(ring1_ns, 'white')
    this.ringSprites2.redraw(ring2_ns, 'white')
    this.ringSprites3.redraw(ring3_ns, 'white')

    this.totalScoreSprites.redraw(this.total_score)
    this.timeSprites.redraw(Rule.getTime(this.rule, this.i_second_1))

    if (isBet2Rule(this.rule)) this.betTimesSprites.redraw(this.bet_times)

    setTimeout(() => {
      Audio.playSound('voice_ready_1')
      setTimeout(() => {
        Audio.playSound('voice_ready_2')
        setTimeout(() => {
          Audio.playSound('voice_ready_3')
          setTimeout(() => {
            this.mode = 'ready'
            this.changeMode()
          }, 700)
        }, 1300)
      }, 1700)
    }, 500)
  }

  private handleReady(): void {
    this.elapsed_time = 0
    Audio.playBGM('bgm_1')
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('light')
    this.ringSprites3.changeOpacity('light')
    Audio.playBGM('se_rotate')
    this.bet_times++
    if (isBet2Rule(this.rule)) this.betTimesSprites.redraw(this.bet_times)
    this.mode = 'rotate_3'
  }

  private handleBraked2(): void {
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('normal')
    this.ringSprites3.changeOpacity('normal')
    const eyes1 = this.eyes(this.ringSprites1)
    const eyes2 = this.eyes(this.ringSprites2)
    const reaches = Rule.getReaches(eyes1, eyes2)
    for (const r of reaches) this.guidesSprites.show(r)
    if (reaches.length > 0) Audio.playSound('voice_reach')
    if (!this.bullet_time && !this.revolution) {
      const zoneReaches = Rule.getZoneReaches(eyes1, eyes2)
      if (zoneReaches.length > 0) Audio.playSound('se_zone_reach')
    }
    this.mode = 'rotate_1'
  }

  private handleBraked1(): void {
    this.ringSprites1.changeOpacity('normal')
    this.ringSprites2.changeOpacity('normal')
    this.ringSprites3.changeOpacity('normal')
    this.guidesSprites.hide()

    const eyes1 = this.eyes(this.ringSprites1)
    const eyes2 = this.eyes(this.ringSprites2)
    const eyes3 = this.eyes(this.ringSprites3)
    this.tuples = Rule.calcTuples(eyes1, eyes2, eyes3)

    if (this.zone_seconds <= 0) {
      const zoneRolls = Rule.getZoneRolls(this.tuples)
      if (zoneRolls.length > 0) this.reserve_start_zone = true
      for (const r of zoneRolls) Audio.playSound(`voice_zone_${r}`)
    }

    if (Rule.isAmbulance(this.tuples)) {
      this.elapsed_time -= 10 * 1000
      Audio.playSound('se_ambulance')
      this.stats.egg.ambulance++
    }

    this.mods = Rule.calcMods(this.tuples)
    this.mode = 'showing_mods'

    setTimeout(() => {
      this.guidesSprites.show('mod')
      this.modsSprites.redraw(this.mods)
      this.alphabetsSprites.redraw(this.tuples, this.mods)

      setTimeout(() => {
        this.scores = Rule.calcScores(this.tuples, this.mods, this.revolution)

        let rollback = false
        if (this.rollback_stock > 0) {
          const reaches = Rule.getReaches(eyes1, eyes2)
          if (reaches.length > 0 && !Rule.isMultiWon(this.scores)) {
            this.guidesSprites.hide()
            this.modsSprites.hide()
            this.alphabetsSprites.hide()
            for (const r of reaches) this.guidesSprites.show(r)
            rollback = true
          }
        }

        if (rollback) {
          this.rollback_stock--
          if (this.rollback_stock === 0) {
            const ns = this.ringSprites3.ns
            const color = this.ringSprites2.color
            this.ringSprites3.redraw(ns, color)
          }
          this.effectSprites.show('triple_seven')
          setTimeout(() => this.effectSprites.hide('triple_seven'), 1000)
          Audio.playSound('voice_rollback')
          this.stats.triple_seven.rollback++
          this.mode = 'rotate_1'
        } else {
          for (const score of this.scores) {
            if (score.won && score.roll) this.stats.roll[score.roll.name]++
            else this.stats.roll.buta++
          }
          this.current_scores = Rule.calcCurrentScores(this.scores)
          if (this.current_scores[2] >= 100) {
            this.i_combo++
            if (this.i_combo > this.stats.max_combo)
              this.stats.max_combo = this.i_combo
          } else {
            this.i_combo = 0
          }
          this.current_scores = Rule.addComboScore(
            this.current_scores,
            this.i_combo
          )
          this.total_score = Rule.calcTotalScore(
            this.total_score,
            this.current_scores
          )
          if (this.current_scores[3] > this.stats.max_gain)
            this.stats.max_gain = this.current_scores[3]

          this.mode = 'showing_scores'
          this.scoresSprites.redraw(this.scores, this.revolution)
          if (this.i_combo >= 2) this.comboSprites.redraw(this.i_combo)
          this.currentScoreSprites.redraw(this.current_scores)

          const wait =
            this.current_scores[3] !== this.current_scores[2] ? 1500 : 1000
          setTimeout(() => {
            this.totalScoreSprites.redraw(this.total_score)
            this.mode = 'shown_scores'
          }, wait)
        }
      }, 1400)
    }, 300)
  }

  private handleShownScores(): void {
    if (Rule.isAchieved(this.rule, this.elapsed_time, this.total_score)) {
      Audio.stopAllBGM()
      Audio.playBGM('bgm_result')

      const hs = loadHighScore()
      let is_high_score = false
      const r = this.rule
      if (r === 'rule_1_2943' || r === 'rule_1_8390' || r === 'rule_1_37654') {
        const cur = hs[r]
        if (cur === undefined || this.elapsed_time < cur) {
          is_high_score = true
          hs[r] = this.elapsed_time
        }
      } else if (
        r === 'rule_2_2943' ||
        r === 'rule_2_8390' ||
        r === 'rule_2_37654'
      ) {
        const cur = hs[r]
        if (cur === undefined || this.bet_times < cur) {
          is_high_score = true
          hs[r] = this.bet_times
        }
      } else {
        const cur = hs[r]
        if (cur === undefined || this.total_score > cur) {
          is_high_score = true
          hs[r] = this.total_score
        }
      }
      saveHighScore(hs)

      this.resultSprites = new ResultSprites(this)
      this.resultSprites.redraw(
        this.rule,
        this.elapsed_time,
        this.bet_times,
        this.total_score,
        this.stats,
        is_high_score
      )
      this.mode = 'shown_result'
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
      if (this.speed > speed_bk) Audio.playSound('se_speed_up')
      else if (this.speed < speed_bk) Audio.playSound('se_speed_down')
    }

    if (this.reserve_finish_zone) {
      this.reserve_finish_zone = false
      this.zone_seconds = 0
      Audio.changeBGMVolume(0.2)
      if (this.bullet_time) {
        this.speed = this.speed_bk
        Audio.playSound('se_speed_up')
      }
      if (this.revolution) Audio.playSound('se_finish_revolution')
      this.bullet_time = false
      this.revolution = false
      this.effectSprites.hide()
    }

    if (this.reserve_start_zone) {
      this.reserve_start_zone = false
      this.zone_seconds = 30
      Audio.changeBGMVolume(0.1)
      if (Rule.random(0, 1) > 0) {
        this.bullet_time = true
        this.speed_bk = this.speed
        this.speed = 2
        this.effectSprites.show('bullet_time')
        Audio.playSound('se_start_bullet_time')
        Audio.playSound('voice_bullet_time')
        this.stats.zone.bullet_time++
      } else {
        this.revolution = true
        this.effectSprites.show('revolution')
        Audio.playSound('se_start_revolution')
        Audio.playSound('voice_revolution')
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
      setTimeout(() => this.effectSprites.hide('triple_seven'), 1000)
      Audio.playSound('voice_triple_seven')

      const effect = Rule.getTripleSevenEffect(this.rollback_stock, this.stats)
      ring1_ns = effect.ring1_ns
      ring2_ns = effect.ring2_ns
      ring3_ns = effect.ring3_ns
      this.rollback_stock = effect.rollback_stock
      this.stats = effect.stats
    }

    this.ringSprites1.redraw(ring1_ns, color)
    this.ringSprites2.redraw(ring2_ns, color)
    if (this.rollback_stock === 0) {
      this.ringSprites3.redraw(ring3_ns, color)
    } else {
      this.ringSprites3.redraw(ring3_ns, 'yellow')
    }

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
      Audio.changeBGM()
    }

    Audio.playSound('se_start')
    Audio.playBGM('se_rotate')
    this.bet_times++
    if (isBet2Rule(this.rule)) this.betTimesSprites.redraw(this.bet_times)
    this.mode = 'rotate_3'
  }
}
