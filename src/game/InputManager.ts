import { Rectangle } from 'pixi.js'

/**
 * Routes Space/Click input to the scene with a 200ms debounce.
 * Click events whose stage coordinates fall inside any registered
 * exclude rectangle (back button area) are dropped.
 */
export class InputManager {
  private canvas: HTMLCanvasElement
  private stageWidth: number
  private stageHeight: number
  private lastTrigger = 0
  private debounceMs = 200
  private excludes: Rectangle[] = []
  private handler: (() => void) | null = null
  private keyListener: (e: KeyboardEvent) => void
  private pointerListener: (e: PointerEvent) => void
  private suppressed = false

  constructor(
    canvas: HTMLCanvasElement,
    stageWidth: number,
    stageHeight: number
  ) {
    this.canvas = canvas
    this.stageWidth = stageWidth
    this.stageHeight = stageHeight

    this.keyListener = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        this.trigger()
      }
    }
    this.pointerListener = (e: PointerEvent) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * this.stageWidth
      const y = ((e.clientY - rect.top) / rect.height) * this.stageHeight
      if (this.excludes.some(r => r.contains(x, y))) return
      this.trigger()
    }

    window.addEventListener('keydown', this.keyListener)
    this.canvas.addEventListener('pointerdown', this.pointerListener)
  }

  setHandler(handler: (() => void) | null): void {
    this.handler = handler
  }

  addExclude(rect: Rectangle): void {
    this.excludes.push(rect)
  }

  clearExcludes(): void {
    this.excludes = []
  }

  /** Temporarily ignore presses (used while a transition is in flight). */
  setSuppressed(suppressed: boolean): void {
    this.suppressed = suppressed
  }

  private trigger(): void {
    if (this.suppressed) return
    const now = performance.now()
    if (now - this.lastTrigger < this.debounceMs) return
    this.lastTrigger = now
    this.handler?.()
  }

  destroy(): void {
    window.removeEventListener('keydown', this.keyListener)
    this.canvas.removeEventListener('pointerdown', this.pointerListener)
    this.handler = null
    this.excludes = []
  }
}
