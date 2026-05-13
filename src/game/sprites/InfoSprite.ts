import { Audio } from '../audio'
import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

interface ModeOwner {
  mode: string
  prevent_click?: boolean
}

export class InfoSprite {
  private ds: Scene & ModeOwner
  private sprite: GameSprite

  constructor(ds: Scene & ModeOwner, x: number, y: number) {
    this.ds = ds
    this.sprite = makeSprite('button_info').addChildTo(ds)
    this.sprite.x = x
    this.sprite.y = y
    this.sprite.alpha = 0
    this.sprite.setInteractive()
    this.sprite.on('pointerdown', () => {
      if (this.ds.mode === 'first') return
      this.ds.prevent_click = true
      setTimeout(() => {
        this.ds.prevent_click = false
      }, 100)
      const lang = navigator.language.split('-')[0]
      const locale = lang === 'ja' ? 'ja' : 'en'
      window.open(`https://llll-ll.com/${locale}/tin-tilo-rings`, '_blank')
    })
    this.sprite.on('pointerover', () => {
      if (this.ds.mode === 'first') return
      this.sprite.setImage('button_info_hover')
      Audio.playSound('voice_info')
    })
    this.sprite.on('pointerout', () => {
      this.sprite.setImage('button_info')
    })
  }

  show(): void {
    this.sprite.tweener.fade(0.5, 200).play()
  }
  hide(): void {
    this.sprite.tweener.fadeOut(50).play()
  }
  remove(): void {
    this.sprite.remove()
  }
}
