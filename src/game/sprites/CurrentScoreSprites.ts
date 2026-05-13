// Phina CurrentScoreSprites (1759-1987行) - me/kabu/multi/combo の段階表示 + se_win/se_buta/se_multi/voice_combo
import { Audio } from '../audio'
import { Scene } from '../Scene'
import { CurrentScores } from '../rule'
import { GameSprite, makeSprite } from '../pixi-sprite'

const SLOTS = 8

export class CurrentScoreSprites {
  private me_sprites: GameSprite[] = []
  private kabu_sprites: GameSprite[] = []
  private multi_sprites: GameSprite[] = []
  private combo_sprites: GameSprite[] = []

  constructor(ds: Scene, x: number, y: number) {
    const make = (): GameSprite[] => {
      const out: GameSprite[] = []
      for (let i = 0; i < SLOTS; i++) {
        const s = makeSprite('dummy').addChildTo(ds)
        s.x = x - 70 * 0.7 * (SLOTS - i)
        s.y = y
        s.alpha = 0
        out.push(s)
      }
      return out
    }
    this.me_sprites = make()
    this.kabu_sprites = make()
    this.multi_sprites = make()
    this.combo_sprites = make()
  }

  redraw(current_scores: CurrentScores): void {
    const apply = (sprites: GameSprite[], n: number) => {
      const digits = String(n).split('')
      const start_i = SLOTS - digits.length
      sprites.forEach((sprite, i) => {
        if (i < start_i) {
          sprite.setImage('dummy')
        } else {
          sprite.setImage(`fude_n_${digits[i - start_i]}`)
          sprite.width = 70
          sprite.height = 70
          sprite.alpha = 0
        }
      })
    }
    apply(this.me_sprites, current_scores[0])
    apply(this.kabu_sprites, current_scores[1])
    apply(this.multi_sprites, current_scores[2])
    apply(this.combo_sprites, current_scores[3])
    this.show(current_scores)
  }

  private show(current_scores: CurrentScores): void {
    for (const s of this.me_sprites)
      s.tweener.fadeIn(50).wait(500).fadeOut(50).play()
    for (const s of this.kabu_sprites)
      s.tweener.wait(500).fadeIn(50).wait(500).fadeOut(50).play()

    if (current_scores[3] !== current_scores[2]) {
      for (const s of this.multi_sprites)
        s.tweener.wait(1000).fadeIn(50).wait(500).fadeOut(50).play()
      for (const s of this.combo_sprites) s.tweener.wait(1500).fadeIn(50).play()
    } else {
      for (const s of this.multi_sprites) s.tweener.wait(1000).fadeIn(50).play()
    }

    if (current_scores[0] > 0) Audio.playSound('se_win')
    else Audio.playSound('se_buta')

    setTimeout(() => {
      if (current_scores[1] > current_scores[0]) Audio.playSound('se_win')
      else Audio.playSound('se_buta')
    }, 500)

    setTimeout(() => {
      if (current_scores[2] > current_scores[1]) Audio.playSound('se_multi')
      else if (current_scores[2] === current_scores[1])
        Audio.playSound('se_buta')
      else Audio.playSound('se_hifumi')
    }, 1000)

    if (current_scores[3] !== current_scores[2]) {
      setTimeout(() => Audio.playSound('voice_combo'), 1500)
    }
  }

  hide(): void {
    for (const arr of [
      this.me_sprites,
      this.kabu_sprites,
      this.multi_sprites,
      this.combo_sprites,
    ]) {
      for (const s of arr) s.tweener.fadeOut(50).play()
    }
  }

  remove(): void {
    for (const arr of [
      this.me_sprites,
      this.kabu_sprites,
      this.multi_sprites,
      this.combo_sprites,
    ]) {
      for (const s of arr) s.remove()
    }
    this.me_sprites = []
    this.kabu_sprites = []
    this.multi_sprites = []
    this.combo_sprites = []
  }
}
