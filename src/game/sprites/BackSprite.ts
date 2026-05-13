import { Audio } from '../audio'
import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

interface ModeOwner {
  mode: string
  prevent_click?: boolean
}

export class BackSprite {
  private ds: Scene & ModeOwner
  private sprite: GameSprite

  constructor(ds: Scene & ModeOwner, x: number, y: number) {
    this.ds = ds
    this.sprite = makeSprite('button_back').addChildTo(ds)
    this.sprite.x = x
    this.sprite.y = y
    this.sprite.alpha = 0
    this.sprite.setInteractive()
    this.sprite.on('pointerdown', () => {
      if (this.ds.mode === 'first' || this.ds.mode === 'ready') return
      this.ds.prevent_click = true
      setTimeout(() => {
        this.ds.prevent_click = false
      }, 100)
      Audio.stopAllBGM()
      this.ds.exit({ back: true })
    })
    this.sprite.on('pointerover', () => {
      if (this.ds.mode === 'first') return
      this.sprite.setImage('button_back_hover')
      Audio.playSound('voice_back')
    })
    this.sprite.on('pointerout', () => {
      this.sprite.setImage('button_back')
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
