// Phina sprites.js RulesSprite (174-516行) を再現
// 9 ルールボタン + 装飾線。ホバーでボイス、クリックで rule 確定→exit
import { Audio } from '../audio'
import { Scene, SceneExitParam } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

interface ModeOwner {
  mode: string
}

interface RuleDef {
  id: string
  voice: string
  col: number // 0..2
  row: number // 0..2
}

const RULES: RuleDef[] = [
  { id: 'rule_1_2943', voice: 'voice_rule_2943', col: 0, row: 0 },
  { id: 'rule_1_8390', voice: 'voice_rule_8390', col: 0, row: 1 },
  { id: 'rule_1_37654', voice: 'voice_rule_37654', col: 0, row: 2 },
  { id: 'rule_2_2943', voice: 'voice_rule_2943', col: 1, row: 0 },
  { id: 'rule_2_8390', voice: 'voice_rule_8390', col: 1, row: 1 },
  { id: 'rule_2_37654', voice: 'voice_rule_37654', col: 1, row: 2 },
  { id: 'rule_3_0409', voice: 'voice_rule_0409', col: 2, row: 0 },
  { id: 'rule_3_2009', voice: 'voice_rule_2009', col: 2, row: 1 },
  { id: 'rule_3_6819', voice: 'voice_rule_6819', col: 2, row: 2 },
]

export class RulesSprite {
  private ds: Scene & ModeOwner
  private sprites: GameSprite[] = []

  constructor(ds: Scene & ModeOwner, x: number, y: number) {
    this.ds = ds

    const lineL = makeSprite('line_v_1').addChildTo(ds)
    lineL.x = x + 100
    lineL.y = y + 200
    lineL.alpha = 0
    this.sprites.push(lineL)

    const lineR = makeSprite('line_v_1').addChildTo(ds)
    lineR.x = x + 100 + 200
    lineR.y = y + 200
    lineR.alpha = 0
    this.sprites.push(lineR)

    // ヘッダ rule_1 / rule_2 / rule_3
    for (let c = 0; c < 3; c++) {
      const head = makeSprite(`rule_${c + 1}`).addChildTo(ds)
      head.x = x + 200 * c
      head.y = y
      head.alpha = 0
      this.sprites.push(head)
    }

    // 9 個のルール選択ボタン
    for (const rule of RULES) {
      const sprite = makeSprite(rule.id).addChildTo(ds)
      sprite.x = x + 200 * rule.col
      sprite.y = y + 120 + 140 * rule.row
      sprite.alpha = 0
      sprite.setInteractive()

      sprite.on('pointerdown', () => {
        if (this.ds.mode === 'first') return
        Audio.playSound('se_select_rule')
        const param: SceneExitParam = { rule: rule.id }
        this.ds.exit(param)
      })
      sprite.on('pointerover', () => {
        if (this.ds.mode === 'first') return
        sprite.setImage(`${rule.id}_hover`)
        Audio.playSound(rule.voice)
      })
      sprite.on('pointerout', () => {
        sprite.setImage(rule.id)
      })

      this.sprites.push(sprite)
    }
  }

  show(): void {
    for (const s of this.sprites) s.tweener.fadeIn(200).play()
  }
  hide(): void {
    for (const s of this.sprites) s.tweener.fadeOut(50).play()
  }
  remove(): void {
    for (const s of this.sprites) s.remove()
    this.sprites = []
  }
}
