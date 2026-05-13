// Phina ScoresSprites (1555-1685行) - 役画像 + odds 画像。me/kabu/multi の表示遅延差
import { Scene } from '../Scene'
import { Rule, Score } from '../rule'
import { GameSprite, makeSprite } from '../pixi-sprite'

export class ScoresSprites {
  private sprite_group: GameSprite[][] = []

  constructor(ds: Scene, x: number, y: number) {
    for (let i = 0; i < 11; i++) {
      const roll = makeSprite('dummy').addChildTo(ds)
      roll.x = x
      roll.y = y + 42 * i
      roll.alpha = 0
      const odds = makeSprite('dummy').addChildTo(ds)
      odds.x = x + 85
      odds.y = y + 42 * i
      odds.alpha = 0
      this.sprite_group.push([roll, odds])
    }
  }

  redraw(scores: Score[], revolution: boolean): void {
    this.sprite_group.forEach((sprites, i) => {
      const score = scores[i]
      let roll_image = ''
      let odds_image = ''
      if (score.won && score.roll) {
        roll_image = `roll_${score.roll.name}`
        let odds =
          score.roll.odds ??
          score.roll.calcGain(score.sum ?? 0, score.tuple, score.mod)
        if (score.roll.f === 'multi' && revolution) odds *= -1
        odds_image = `odds_${score.roll.f}_${odds}`
      } else {
        roll_image = 'roll_buta'
        odds_image = 'dummy'
      }
      sprites[0].setImage(roll_image)
      sprites[0].alpha = 0
      sprites[1].setImage(odds_image)
      sprites[1].alpha = 0
    })
    this.show(scores)
  }

  private show(scores: Score[]): void {
    this.sprite_group.forEach((sprites, i) => {
      const score = scores[i]
      const [roll, odds] = sprites
      if (score.won) {
        const step = Rule.getStep(score)
        if (step === 'me') {
          roll.tweener.fadeIn(50).play()
          odds.tweener.fadeIn(50).play()
        } else if (step === 'kabu') {
          roll.tweener.wait(500).fadeIn(50).play()
          odds.tweener.wait(500).fadeIn(50).play()
        } else {
          roll.tweener.wait(1000).fadeIn(50).play()
          odds.tweener.wait(1000).fadeIn(50).play()
        }
      } else {
        roll.tweener.wait(1000).fadeIn(50).play()
        odds.tweener.wait(1000).fadeIn(50).play()
      }
    })
  }

  hide(): void {
    for (const sprites of this.sprite_group)
      for (const s of sprites) s.tweener.fadeOut(50).play()
  }

  remove(): void {
    for (const sprites of this.sprite_group) for (const s of sprites) s.remove()
    this.sprite_group = []
  }
}
