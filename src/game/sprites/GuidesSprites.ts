// Phina GuidesSprites (1201-1317行) - reach/mod ガイドの fade
import { Scene } from '../Scene'
import { GameSprite, makeSprite } from '../pixi-sprite'

const ALPHABETS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']

export class GuidesSprites {
  private reach_sprites: GameSprite[] = []
  private mod_sprites: GameSprite[] = []

  constructor(ds: Scene, x: number, y: number) {
    for (const a of ALPHABETS) {
      const s = makeSprite(`guide_reach_${a}`).addChildTo(ds)
      s.x = x
      s.y = y
      s.alpha = 0
      this.reach_sprites.push(s)
    }
    for (const k of ['guide_mod_a', 'guide_mod_f', 'guide_mod_i']) {
      const s = makeSprite(k).addChildTo(ds)
      s.x = x
      s.y = y
      s.alpha = 0
      this.mod_sprites.push(s)
    }
  }

  show(guide: string): void {
    if (guide === 'mod') {
      this.mod_sprites[0].tweener.fadeIn(50).play()
      this.mod_sprites[1].tweener.wait(400).fadeIn(50).play()
      this.mod_sprites[2].tweener.wait(800).fadeIn(50).play()
      return
    }
    const idx = ALPHABETS.indexOf(guide)
    if (idx >= 0) this.reach_sprites[idx].tweener.fadeIn(200).play()
  }

  hide(): void {
    for (const s of this.reach_sprites) s.tweener.fadeOut(50).play()
    for (const s of this.mod_sprites) s.tweener.fadeOut(50).play()
  }

  remove(): void {
    for (const s of this.reach_sprites) s.remove()
    for (const s of this.mod_sprites) s.remove()
    this.reach_sprites = []
    this.mod_sprites = []
  }
}
