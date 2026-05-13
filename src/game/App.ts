import { Application } from 'pixi.js'
import { AudioManager } from './AudioManager'
import { InputManager } from './InputManager'
import { Scene, type SceneContext } from './Scene'
import { TitleScene } from './TitleScene'
import { MainScene } from './MainScene'
import { loadImageAssets } from './assets'
import { parseStateFromUrl, type GameState } from './GameState'
import type { RuleType } from './rule'

const STAGE_WIDTH = 640
const STAGE_HEIGHT = 960

export class App {
  private app: Application
  private audio: AudioManager
  private input!: InputManager
  private current: Scene | null = null
  private ctx!: SceneContext

  constructor() {
    this.app = new Application()
    this.audio = new AudioManager()
  }

  async init(progressEl?: HTMLElement | null): Promise<void> {
    await this.app.init({
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      background: '#732121',
      antialias: true,
      preference: 'webgl',
    })
    this.app.stage.sortableChildren = true

    const gameEl = document.getElementById('game')
    if (!gameEl) throw new Error('#game element missing')
    gameEl.appendChild(this.app.canvas)

    const updateBar = (p: number) => {
      if (progressEl) {
        const bar = progressEl.querySelector(
          '#loading-bar > div'
        ) as HTMLDivElement
        if (bar) bar.style.width = `${Math.round(p * 100)}%`
      }
    }

    await loadImageAssets(p => updateBar(p * 0.5))
    await this.audio.preload(p => updateBar(0.5 + p * 0.5))

    this.input = new InputManager(this.app.canvas, STAGE_WIDTH, STAGE_HEIGHT)

    this.ctx = {
      audio: this.audio,
      input: this.input,
      ticker: this.app.ticker,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      goTitle: data => this.startTitle(data),
      goMain: data => this.startMain(data.rule as RuleType),
    }

    // Resume the audio context on the first user interaction (browser autoplay).
    const resume = () => {
      this.audio.resumeContext()
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
    window.addEventListener('pointerdown', resume)
    window.addEventListener('keydown', resume)
  }

  start(): void {
    const initial = parseStateFromUrl()
    if (initial) {
      this.startMain(initial.rule, initial)
    } else {
      this.startTitle()
    }
  }

  private startTitle(opts: { back?: boolean } = {}): void {
    this.swapScene(ctx => new TitleScene(ctx, opts))
  }

  private startMain(rule: RuleType, initial?: GameState): void {
    this.swapScene(ctx => new MainScene(ctx, rule, initial))
  }

  private swapScene(factory: (ctx: SceneContext) => Scene): void {
    if (this.current) {
      this.app.stage.removeChild(this.current)
      this.current.destroy({ children: true })
    }
    this.input.clearExcludes()
    this.input.setHandler(null)
    this.input.setSuppressed(false)
    const next = factory(this.ctx)
    this.current = next
    this.app.stage.addChild(next)
  }
}
