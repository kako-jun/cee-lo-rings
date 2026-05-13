// Phina LinesSprites (831-909行) - リール背景の縦横ライン 8 本
import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

export class LinesSprites {
  private sprites: GameSprite[]

  constructor(ds: Scene) {
    this.sprites = []
    const def: Array<[string, number, number]> = [
      ['line_v_1', 122, 450],
      ['line_v_1', 164, 450],
      ['line_h_1', 142, 278],
      ['line_h_1', 142, 488],
      ['line_h_2', 142, 320],
      ['line_h_2', 142, 362],
      ['line_h_2', 142, 404],
      ['line_h_2', 142, 446],
    ]
    for (const [name, x, y] of def) {
      const s = makeSprite(name).addChildTo(ds)
      s.x = x
      s.y = y
      s.alpha = 0
      this.sprites.push(s)
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
