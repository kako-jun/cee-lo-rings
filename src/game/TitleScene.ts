// Title scene with rule selection for Tin! Tilo! Rings!

import Phaser from 'phaser'
import { AudioManager } from './AudioManager'

type TitleMode = 'first' | 'select_rule'

export class TitleScene extends Phaser.Scene {
  private mode: TitleMode = 'first'
  private audio!: AudioManager
  private titleSprite!: Phaser.GameObjects.Image
  private infoButton!: Phaser.GameObjects.Image
  private ruleButtons: Map<string, Phaser.GameObjects.Image> = new Map()
  private preventClick = false

  constructor() {
    super({ key: 'TitleScene' })
  }

  preload(): void {
    // Initialize audio manager
    this.audio = new AudioManager(this)
    this.audio.preload()

    // Load title scene images
    this.load.image('bg_title', 'assets/image/title/bg_title.png')
    this.load.image('button_info', 'assets/image/title/button_info.png')
    this.load.image(
      'button_info_hover',
      'assets/image/title/button_info_hover.png'
    )
    this.load.image('button_back', 'assets/image/title/button_back.png')
    this.load.image(
      'button_back_hover',
      'assets/image/title/button_back_hover.png'
    )

    // Load rule category headers
    this.load.image('rule_1', 'assets/image/title/rule_1.png')
    this.load.image('rule_2', 'assets/image/title/rule_2.png')
    this.load.image('rule_3', 'assets/image/title/rule_3.png')

    // Load rule buttons (normal and hover states)
    const ruleIds = [
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

    ruleIds.forEach(id => {
      this.load.image(id, `assets/image/title/${id}.png`)
      this.load.image(`${id}_hover`, `assets/image/title/${id}_hover.png`)
    })
  }

  create(): void {
    // Set background color
    this.cameras.main.setBackgroundColor('#732121')

    // Create title sprite
    this.titleSprite = this.add.image(320, 480, 'bg_title')
    this.titleSprite.setAlpha(0)

    // Fade in title
    this.tweens.add({
      targets: this.titleSprite,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        // Check if returning from game
        const data = this.scene.settings.data as { back?: boolean }
        if (data && data.back) {
          // Skip intro voices if returning
          this.showRuleSelection()
        } else {
          // Play intro voices
          this.playIntroVoices()
        }
      },
    })

    // Handle click to advance from title
    this.input.on('pointerdown', () => {
      if (this.mode === 'first' && !this.preventClick) {
        this.showRuleSelection()
      }
    })
  }

  private playIntroVoices(): void {
    this.time.delayedCall(500, () => {
      this.audio.playSound('voice_chin')
      this.time.delayedCall(600, () => {
        this.audio.playSound('voice_chiro')
        this.time.delayedCall(600, () => {
          this.audio.playSound('voice_rin')
        })
      })
    })
  }

  private showRuleSelection(): void {
    if (this.mode !== 'first') return

    this.mode = 'select_rule'

    // Create info button
    this.infoButton = this.add.image(606, 30, 'button_info')
    this.infoButton.setAlpha(0)
    this.infoButton.setInteractive({ useHandCursor: true })

    this.infoButton.on('pointerover', () => {
      if (this.mode === 'first') return
      this.infoButton.setTexture('button_info_hover')
      this.audio.playSound('voice_info')
    })

    this.infoButton.on('pointerout', () => {
      this.infoButton.setTexture('button_info')
    })

    this.infoButton.on('pointerdown', () => {
      if (this.mode === 'first') return
      this.preventClick = true
      this.time.delayedCall(100, () => {
        this.preventClick = false
      })
      // Open help page
      const locale = navigator.language.split('-')[0] === 'ja' ? 'ja' : 'en'
      window.open(`https://llll-ll.com/${locale}/tin-tilo-rings`, '_blank')
    })

    // Fade in info button
    this.tweens.add({
      targets: this.infoButton,
      alpha: 0.5,
      duration: 200,
    })

    // Create rule category headers
    const headerY = 480
    const header1 = this.add.image(120, headerY, 'rule_1').setAlpha(0)
    const header2 = this.add.image(320, headerY, 'rule_2').setAlpha(0)
    const header3 = this.add.image(520, headerY, 'rule_3').setAlpha(0)

    this.tweens.add({
      targets: [header1, header2, header3],
      alpha: 1,
      duration: 200,
    })

    // Create rule buttons
    const ruleConfigs = [
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

    ruleConfigs.forEach(config => {
      const button = this.add.image(config.x, config.y, config.id)
      button.setAlpha(0)
      button.setInteractive({ useHandCursor: true })

      button.on('pointerover', () => {
        if (this.mode === 'first') return
        button.setTexture(`${config.id}_hover`)
        this.audio.playSound(config.voice)
      })

      button.on('pointerout', () => {
        button.setTexture(config.id)
      })

      button.on('pointerdown', () => {
        if (this.mode === 'first') return
        this.preventClick = true
        this.audio.playSound('se_select_rule')

        // Transition to main game scene with selected rule
        this.time.delayedCall(300, () => {
          this.scene.start('MainScene', { rule: config.id })
        })
      })

      this.ruleButtons.set(config.id, button)

      // Fade in button
      this.tweens.add({
        targets: button,
        alpha: 1,
        duration: 200,
      })
    })
  }
}
