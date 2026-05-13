// Phina ComboSprites (1687-1757行) - "COMBO ×N" 表示
import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

export class ComboSprites {
  private combo_sprite: GameSprite
  private text_sprite: GameSprite

  constructor(ds: Scene, x: number, y: number) {
    this.combo_sprite = makeSprite('dummy').addChildTo(ds)
    this.combo_sprite.x = x + 39
    this.combo_sprite.y = y + 12
    this.combo_sprite.alpha = 0
    this.text_sprite = makeSprite('text_combo').addChildTo(ds)
    this.text_sprite.x = x
    this.text_sprite.y = y
    this.text_sprite.alpha = 0
  }

  redraw(i_combo: number): void {
    const n = i_combo > 10 ? 10 : i_combo
    this.combo_sprite.setImage(`odds_multi_${n}`)
    this.combo_sprite.alpha = 0
    this.text_sprite.alpha = 0
    this.show()
  }

  private show(): void {
    this.text_sprite.tweener.wait(1500).fadeIn(50).play()
    this.combo_sprite.tweener.wait(1500).fadeIn(50).play()
  }

  hide(): void {
    this.text_sprite.tweener.fadeOut(50).play()
    this.combo_sprite.tweener.fadeOut(50).play()
  }

  remove(): void {
    this.text_sprite.remove()
    this.combo_sprite.remove()
  }
}
