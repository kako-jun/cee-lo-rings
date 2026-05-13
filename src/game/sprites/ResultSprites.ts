// Phina ResultSprites (2130-2802行) - リザルト画面
// テキスト要素 (score/time/bet/rank/stats 各行) は PIXI.Text で表示
// ボタン 4 種 (change_rule / one_more / send / ranking) のクリック処理も担う
// Network 通信 (rank 取得/送信) は省略 (Phina の Network.* を呼んでいた箇所はスタブ)

import { Text, TextStyle } from 'pixi.js'
import { gsap } from 'gsap'
import { Audio } from '../audio'
import { Scene } from '../Scene'
import { Rule, RuleId, Stats } from '../rule'
import { GameSprite, makeSprite, Tweener } from '../pixi-sprite'

interface ModeOwner {
  mode: string
  prevent_click?: boolean
  rule?: string
  stats?: Stats
}

const labelStyle = (size = 21): TextStyle =>
  new TextStyle({ fontFamily: 'sans-serif', fontSize: size, fill: 0x000000 })

class Label extends Text {
  imageName = ''
  meta: Record<string, unknown> = {}
  private fadeTween: gsap.core.Tween | null = null

  constructor(initial = '', size = 21) {
    super({ text: initial, style: labelStyle(size) })
    this.anchor.set(0, 0.5)
    this.alpha = 0
  }

  fadeIn(): void {
    this.fadeTween?.kill()
    this.fadeTween = gsap.to(this, { alpha: 1, duration: 0.2 })
  }

  fadeOut(): void {
    this.fadeTween?.kill()
    this.fadeTween = gsap.to(this, { alpha: 0, duration: 0.05 })
  }

  override destroy(options?: Parameters<Text['destroy']>[0]): void {
    this.fadeTween?.kill()
    this.fadeTween = null
    super.destroy(options)
  }
}

const placeLabel = (scene: Scene, x: number, y: number, size = 21): Label => {
  const l = new Label('', size)
  l.x = x
  l.y = y
  scene.addChild(l)
  return l
}

export class ResultSprites {
  private ds: Scene & ModeOwner

  private bg_sprite: GameSprite
  private rule_sprite: GameSprite
  private high_score_sprite: GameSprite

  private score_sprite: Label
  private time_sprite: Label
  private bet_times_sprite: Label
  private rank_sprite: Label
  private line_sprite_1: GameSprite
  private max_combo_sprite: Label
  private max_gain_sprite: Label
  private average_gain_sprite: Label
  private line_sprite_2: GameSprite

  private roll_labels: Record<string, Label> = {}
  private line_sprite_3: GameSprite
  private zone_bullet_time_sprite: Label
  private zone_revolution_sprite: Label
  private triple_seven_labels: Record<string, Label> = {}
  private egg_ambulance_sprite: Label

  private button_change_rule: GameSprite
  private button_one_more: GameSprite
  private button_send: GameSprite
  private button_ranking: GameSprite

  constructor(ds: Scene & ModeOwner) {
    this.ds = ds

    this.bg_sprite = makeSprite('bg_result').addChildTo(ds)
    this.bg_sprite.x = 320
    this.bg_sprite.y = 480
    this.bg_sprite.alpha = 0

    this.rule_sprite = makeSprite('dummy').addChildTo(ds)
    this.rule_sprite.x = 320
    this.rule_sprite.y = 200
    this.rule_sprite.alpha = 0

    this.high_score_sprite = makeSprite('high_score').addChildTo(ds)
    this.high_score_sprite.x = 550
    this.high_score_sprite.y = 400
    this.high_score_sprite.width = 400
    this.high_score_sprite.height = 400
    this.high_score_sprite.alpha = 0

    this.score_sprite = placeLabel(ds, 120, 280)
    this.time_sprite = placeLabel(ds, 320, 280)
    this.bet_times_sprite = placeLabel(ds, 420, 280)
    this.rank_sprite = placeLabel(ds, 320, 310)

    this.line_sprite_1 = makeSprite('line_h_3').addChildTo(ds)
    this.line_sprite_1.x = 320
    this.line_sprite_1.y = 320
    this.line_sprite_1.alpha = 0

    this.max_combo_sprite = placeLabel(ds, 120, 340)
    this.max_gain_sprite = placeLabel(ds, 320, 340)
    this.average_gain_sprite = placeLabel(ds, 420, 340)

    this.line_sprite_2 = makeSprite('line_h_3').addChildTo(ds)
    this.line_sprite_2.x = 320
    this.line_sprite_2.y = 360
    this.line_sprite_2.alpha = 0

    // 3 行 × 7 列のロール統計
    const roll_layout: Array<[string, number, number]> = [
      ['pinzoro', 200, 380],
      ['arashikabu', 250, 380],
      ['kemono', 300, 380],
      ['triple_seven', 350, 380],
      ['zorome', 400, 380],
      ['shigoro', 450, 380],
      ['hifumi', 500, 380],
      ['pinbasami', 200, 410],
      ['me', 250, 410],
      ['pin', 300, 410],
      ['nizou', 350, 410],
      ['santa', 400, 410],
      ['yotsuya', 450, 410],
      ['goke', 500, 410],
      ['roppou', 200, 440],
      ['shichiken', 250, 440],
      ['oicho', 300, 440],
      ['kabu', 350, 440],
      ['pink_ribbon', 400, 440],
      ['buta', 450, 440],
    ]
    for (const [name, x, y] of roll_layout) {
      this.roll_labels[name] = placeLabel(ds, x, y)
    }

    this.line_sprite_3 = makeSprite('line_h_3').addChildTo(ds)
    this.line_sprite_3.x = 320
    this.line_sprite_3.y = 470
    this.line_sprite_3.alpha = 0

    this.zone_bullet_time_sprite = placeLabel(ds, 200, 490)
    this.zone_revolution_sprite = placeLabel(ds, 400, 490)

    const ts_layout: Array<[string, number, number]> = [
      ['all_1', 200, 520],
      ['all_6', 300, 520],
      ['all_123', 400, 520],
      ['all_456', 500, 520],
      ['triplets', 200, 550],
      ['others', 300, 550],
      ['rollback', 400, 550],
    ]
    for (const [name, x, y] of ts_layout)
      this.triple_seven_labels[name] = placeLabel(ds, x, y)
    this.egg_ambulance_sprite = placeLabel(ds, 500, 550)

    this.button_change_rule = this.makeButton(
      ds,
      'button_change_rule',
      170,
      770,
      'voice_back',
      () => {
        Audio.stopAllBGM()
        this.ds.exit({ back: true })
      }
    )
    this.button_one_more = this.makeButton(
      ds,
      'button_one_more',
      320,
      770,
      'voice_one_more',
      () => {
        Audio.stopAllBGM()
        this.ds.exit({ rule: this.ds.rule })
      }
    )
    this.button_send = this.makeButton(
      ds,
      'button_send',
      470,
      770,
      'voice_ok',
      () => {
        // 送信機能は省略 (Phina 版でも TODO スタブ)。即 ranking 画面遷移なしで終了
        Audio.stopAllBGM()
        this.ds.exit({ rule: this.ds.rule })
      }
    )
    this.button_ranking = this.makeButton(
      ds,
      'button_ranking',
      470,
      700,
      'voice_ranking',
      () => {
        const lang = navigator.language.split('-')[0]
        const locale = lang === 'ja' ? 'ja' : 'en'
        window.open(
          `https://llll-ll.com/${locale}/tin-tilo-rings_ranking.html`,
          '_blank'
        )
      }
    )
  }

  private makeButton(
    ds: Scene & ModeOwner,
    image: string,
    x: number,
    y: number,
    voice: string,
    onClick: () => void
  ): GameSprite {
    const sprite = makeSprite(image).addChildTo(ds)
    sprite.x = x
    sprite.y = y
    sprite.alpha = 0
    sprite.setInteractive()
    sprite.on('pointerdown', () => {
      if (this.ds.mode !== 'shown_result') return
      onClick()
    })
    sprite.on('pointerover', () => {
      if (this.ds.mode !== 'shown_result') return
      sprite.setImage(`${image}_hover`)
      Audio.playSound(voice)
    })
    sprite.on('pointerout', () => {
      sprite.setImage(image)
    })
    return sprite
  }

  redraw(
    rule: RuleId,
    elapsed_time: number,
    bet_times: number,
    total_score: number,
    stats: Stats,
    is_high_score: boolean
  ): void {
    this.rule_sprite.setImage(rule)
    this.rule_sprite.alpha = 0

    this.score_sprite.text = String(total_score)

    const second = Math.floor(elapsed_time / 1000)
    const time = Rule.getTime(rule, second)
    const h = Math.floor(time / 60 / 60)
    const m = Math.floor(time / 60) % 60
    const s = time % 60
    const ms = elapsed_time % 1000
    const pad = (n: number, w = 2) => ('0'.repeat(w) + n).slice(-w)
    this.time_sprite.text = `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`
    this.bet_times_sprite.text = String(bet_times)

    this.max_combo_sprite.text = String(stats.max_combo)
    this.max_gain_sprite.text = String(stats.max_gain)
    this.average_gain_sprite.text = String(
      Math.floor((total_score / Math.max(bet_times, 1)) * 10) / 10
    )

    for (const [name, label] of Object.entries(this.roll_labels)) {
      label.text = String(stats.roll[name] ?? 0)
    }
    this.zone_bullet_time_sprite.text = String(stats.zone.bullet_time)
    this.zone_revolution_sprite.text = String(stats.zone.revolution)
    for (const [name, label] of Object.entries(this.triple_seven_labels)) {
      label.text = String(
        (stats.triple_seven as unknown as Record<string, number>)[name] ?? 0
      )
    }
    this.egg_ambulance_sprite.text = String(stats.egg.ambulance)

    this.show(is_high_score)
  }

  private show(is_high_score: boolean): void {
    this.bg_sprite.tweener.fadeIn(200).play()
    this.rule_sprite.tweener.fadeIn(200).play()

    if (is_high_score) {
      this.high_score_sprite.attach(
        Tweener().by({ rotation: -30 }, 1000, 'easeOutExpo')
      )
      this.high_score_sprite.attach(
        Tweener().to({ scaleX: 0.5, scaleY: 0.5 }, 1000, 'easeOutExpo')
      )
      this.high_score_sprite.attach(
        Tweener().by({ x: -100, y: -100 }, 1000, 'easeOutExpo')
      )
      this.high_score_sprite.attach(Tweener().fade(0.8, 1200, 'easeOutExpo'))
    }

    for (const s of [
      this.line_sprite_1,
      this.line_sprite_2,
      this.line_sprite_3,
      this.button_change_rule,
      this.button_one_more,
      this.button_send,
      this.button_ranking,
    ]) {
      s.tweener.fadeIn(200).play()
    }
    for (const l of [
      this.score_sprite,
      this.time_sprite,
      this.bet_times_sprite,
      this.rank_sprite,
      this.max_combo_sprite,
      this.max_gain_sprite,
      this.average_gain_sprite,
      this.zone_bullet_time_sprite,
      this.zone_revolution_sprite,
      this.egg_ambulance_sprite,
      ...Object.values(this.roll_labels),
      ...Object.values(this.triple_seven_labels),
    ]) {
      l.fadeIn()
    }

    Audio.playSound('voice_result')
    setTimeout(() => {
      Audio.playSound(
        is_high_score ? 'voice_result_high_score' : 'voice_result_negi'
      )
    }, 1500)
  }

  hide(): void {
    for (const s of [
      this.bg_sprite,
      this.rule_sprite,
      this.high_score_sprite,
      this.line_sprite_1,
      this.line_sprite_2,
      this.line_sprite_3,
      this.button_change_rule,
      this.button_one_more,
      this.button_send,
      this.button_ranking,
    ]) {
      s.tweener.fadeOut(50).play()
    }
    for (const l of [
      this.score_sprite,
      this.time_sprite,
      this.bet_times_sprite,
      this.rank_sprite,
      this.max_combo_sprite,
      this.max_gain_sprite,
      this.average_gain_sprite,
      this.zone_bullet_time_sprite,
      this.zone_revolution_sprite,
      this.egg_ambulance_sprite,
      ...Object.values(this.roll_labels),
      ...Object.values(this.triple_seven_labels),
    ]) {
      l.fadeOut()
    }
  }
}
