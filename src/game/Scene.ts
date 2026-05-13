import { Container, Ticker, type DestroyOptions } from 'pixi.js'
import gsap from 'gsap'
import type { AudioManager } from './AudioManager'
import type { InputManager } from './InputManager'

export interface SceneContext {
  audio: AudioManager
  input: InputManager
  ticker: Ticker
  width: number
  height: number
  goTitle: (data?: { back?: boolean }) => void
  goMain: (data: { rule: string }) => void
}

/**
 * Container subclass that tracks timeouts and tweens it creates so that
 * scene teardown can cancel everything in-flight.
 */
export class Scene extends Container {
  public readonly ctx: SceneContext
  public get audio(): AudioManager {
    return this.ctx.audio
  }
  public get input(): InputManager {
    return this.ctx.input
  }
  protected timers: Set<number> = new Set()
  protected tweens: Set<gsap.core.Tween> = new Set()
  protected tickerCallbacks: Array<(ticker: Ticker) => void> = []
  protected disposed = false

  constructor(ctx: SceneContext) {
    super()
    this.ctx = ctx
    this.sortableChildren = true
  }

  /**
   * Schedule fn to run after ms. Returns a cancel function.
   * All pending timers are cleared on scene destroy.
   */
  delayedCall(ms: number, fn: () => void): () => void {
    const id = window.setTimeout(() => {
      this.timers.delete(id)
      if (!this.disposed) fn()
    }, ms)
    this.timers.add(id)
    return () => {
      window.clearTimeout(id)
      this.timers.delete(id)
    }
  }

  /** Track a gsap tween so it can be killed on scene destroy. */
  trackTween<T extends gsap.core.Tween>(tween: T): T {
    this.tweens.add(tween)
    tween.eventCallback('onComplete', () => {
      this.tweens.delete(tween)
    })
    return tween
  }

  /** Convenience: gsap.to + auto-tracking. Durations/delays in seconds. */
  tween(target: object | object[], vars: gsap.TweenVars): gsap.core.Tween {
    return this.trackTween(gsap.to(target, vars))
  }

  /** Subscribe to ticker; auto-removed on destroy. */
  protected onTick(cb: (ticker: Ticker) => void): void {
    this.tickerCallbacks.push(cb)
    this.ctx.ticker.add(cb)
  }

  override destroy(options?: DestroyOptions): void {
    this.disposed = true
    this.timers.forEach(id => window.clearTimeout(id))
    this.timers.clear()
    this.tweens.forEach(t => t.kill())
    this.tweens.clear()
    this.tickerCallbacks.forEach(cb => this.ctx.ticker.remove(cb))
    this.tickerCallbacks = []
    super.destroy(options)
  }
}
