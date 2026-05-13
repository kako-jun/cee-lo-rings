import { Assets, Sprite } from 'pixi.js'
import { Scene, type SceneContext } from './Scene'

type TitleMode = 'first' | 'select_rule'

interface RuleConfig {
  id: string
  x: number
  y: number
  voice: string
}

const RULE_CONFIGS: RuleConfig[] = [
  { id: 'rule_1_2943', x: 120, y: 600, voice: 'voice_rule_2943' },
  { id: 'rule_1_8390', x: 120, y: 740, voice: 'voice_rule_8390' },
  { id: 'rule_1_37654', x: 120, y: 880, voice: 'voice_rule_37654' },
  { id: 'rule_2_2943', x: 320, y: 600, voice: 'voice_rule_2943' },
  { id: 'rule_2_8390', x: 320, y: 740, voice: 'voice_rule_8390' },
  { id: 'rule_2_37654', x: 320, y: 880, voice: 'voice_rule_37654' },
  { id: 'rule_3_0409', x: 520, y: 600, voice: 'voice_rule_0409' },
  { id: 'rule_3_2009', x: 520, y: 740, voice: 'voice_rule_2009' },
  { id: 'rule_3_6819', x: 520, y: 880, voice: 'voice_rule_6819' },
]

export class TitleScene extends Scene {
  private mode: TitleMode = 'first'
  private titleSprite!: Sprite
  private infoButton?: Sprite
  private preventClick = false

  constructor(ctx: SceneContext, opts: { back?: boolean }) {
    super(ctx)
    this.build(opts.back ?? false)
  }

  private build(back: boolean): void {
    this.titleSprite = new Sprite(Assets.get('bg_title'))
    this.titleSprite.anchor.set(0.5)
    this.titleSprite.position.set(320, 480)
    this.titleSprite.alpha = 0
    this.addChild(this.titleSprite)

    this.tween(this.titleSprite, {
      alpha: 1,
      duration: 0.2,
      onComplete: () => {
        if (back) this.showRuleSelection()
        else this.playIntroVoices()
      },
    })

    this.ctx.input.setHandler(() => {
      if (this.mode === 'first' && !this.preventClick) {
        this.showRuleSelection()
      }
    })
  }

  private playIntroVoices(): void {
    this.delayedCall(500, () => {
      this.audio.playSound('voice_chin')
      this.delayedCall(600, () => {
        this.audio.playSound('voice_chiro')
        this.delayedCall(600, () => {
          this.audio.playSound('voice_rin')
        })
      })
    })
  }

  private showRuleSelection(): void {
    if (this.mode !== 'first') return
    this.mode = 'select_rule'

    this.infoButton = new Sprite(Assets.get('button_info'))
    this.infoButton.anchor.set(0.5)
    this.infoButton.position.set(606, 30)
    this.infoButton.alpha = 0
    this.infoButton.eventMode = 'static'
    this.infoButton.cursor = 'pointer'
    this.addChild(this.infoButton)

    this.infoButton.on('pointerover', () => {
      if (!this.infoButton) return
      this.infoButton.texture = Assets.get('button_info_hover')
      this.audio.playSound('voice_info')
    })
    this.infoButton.on('pointerout', () => {
      if (!this.infoButton) return
      this.infoButton.texture = Assets.get('button_info')
    })
    this.infoButton.on('pointerdown', () => {
      this.preventClick = true
      this.delayedCall(100, () => {
        this.preventClick = false
      })
      const locale = navigator.language.split('-')[0] === 'ja' ? 'ja' : 'en'
      window.open(`https://llll-ll.com/${locale}/tin-tilo-rings`, '_blank')
    })

    this.tween(this.infoButton, { alpha: 0.5, duration: 0.2 })

    const headerY = 480
    const header1 = this.mkSprite(120, headerY, 'rule_1')
    const header2 = this.mkSprite(320, headerY, 'rule_2')
    const header3 = this.mkSprite(520, headerY, 'rule_3')
    this.tween([header1, header2, header3], { alpha: 1, duration: 0.2 })

    for (const config of RULE_CONFIGS) {
      const button = this.mkSprite(config.x, config.y, config.id)
      button.eventMode = 'static'
      button.cursor = 'pointer'
      button.on('pointerover', () => {
        button.texture = Assets.get(`${config.id}_hover`)
        this.audio.playSound(config.voice)
      })
      button.on('pointerout', () => {
        button.texture = Assets.get(config.id)
      })
      button.on('pointerdown', () => {
        if (this.preventClick) return
        this.preventClick = true
        this.audio.playSound('se_select_rule')
        this.delayedCall(300, () => {
          this.ctx.goMain({ rule: config.id })
        })
      })
      this.tween(button, { alpha: 1, duration: 0.2 })
    }
  }

  private mkSprite(x: number, y: number, key: string): Sprite {
    const s = new Sprite(Assets.get(key))
    s.anchor.set(0.5)
    s.position.set(x, y)
    s.alpha = 0
    this.addChild(s)
    return s
  }
}
