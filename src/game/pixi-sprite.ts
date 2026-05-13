// Phina の Sprite("name") + addChildTo + setImage + tweener API を Pixi v8 + GSAP で再現する薄いラッパ。

import { Container, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { getTexture } from './textures'

const DEG2RAD = Math.PI / 180

const EASING_MAP: Record<string, string> = {
  linear: 'none',
  easeInOutQuad: 'power1.inOut',
  easeInOutCubic: 'power2.inOut',
  easeInOutSine: 'sine.inOut',
  easeOutExpo: 'expo.out',
  easeInOutExpo: 'expo.inOut',
  easeOutBack: 'back.out',
  easeInOutBack: 'back.inOut',
  easeInOutElastic: 'elastic.inOut',
}

const mapEase = (name?: string): string =>
  name ? (EASING_MAP[name] ?? 'none') : 'none'

interface TweenTarget {
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  rotation?: number // degrees (Phina 互換)
  alpha?: number
  width?: number
  height?: number
}

interface BuiltStep {
  proxy: Record<string, number>
  vars: gsap.TweenVars
}

const buildStep = (
  sprite: Sprite,
  props: TweenTarget,
  durationMs: number,
  ease: string,
  relative: boolean
): BuiltStep => {
  const proxy: Record<string, number> = {}
  const writers: Array<() => void> = []
  const vars: gsap.TweenVars = { duration: durationMs / 1000, ease }

  const setup = (
    key: string,
    getCurrent: () => number,
    target: number,
    write: () => void
  ) => {
    proxy[key] = getCurrent()
    ;(vars as Record<string, unknown>)[key] = relative ? `+=${target}` : target
    writers.push(write)
  }

  if (props.x !== undefined)
    setup(
      '_x',
      () => sprite.x,
      props.x,
      () => (sprite.x = proxy._x)
    )
  if (props.y !== undefined)
    setup(
      '_y',
      () => sprite.y,
      props.y,
      () => (sprite.y = proxy._y)
    )
  if (props.alpha !== undefined)
    setup(
      '_a',
      () => sprite.alpha,
      props.alpha,
      () => (sprite.alpha = proxy._a)
    )
  if (props.width !== undefined)
    setup(
      '_w',
      () => sprite.width,
      props.width,
      () => (sprite.width = proxy._w)
    )
  if (props.height !== undefined)
    setup(
      '_h',
      () => sprite.height,
      props.height,
      () => (sprite.height = proxy._h)
    )
  if (props.scaleX !== undefined)
    setup(
      '_sx',
      () => sprite.scale.x,
      props.scaleX,
      () => (sprite.scale.x = proxy._sx)
    )
  if (props.scaleY !== undefined)
    setup(
      '_sy',
      () => sprite.scale.y,
      props.scaleY,
      () => (sprite.scale.y = proxy._sy)
    )
  if (props.rotation !== undefined) {
    const rad = props.rotation * DEG2RAD
    setup(
      '_rot',
      () => sprite.rotation,
      rad,
      () => (sprite.rotation = proxy._rot)
    )
  }

  vars.onUpdate = () => {
    for (const w of writers) w()
  }
  return { proxy, vars }
}

const startProxiesAtCurrent = (
  sprite: Sprite,
  proxy: Record<string, number>
) => {
  // 現在値で proxy を初期化 (timeline の各セグメント開始時に再評価したい場合用)
  if ('_x' in proxy) proxy._x = sprite.x
  if ('_y' in proxy) proxy._y = sprite.y
  if ('_a' in proxy) proxy._a = sprite.alpha
  if ('_w' in proxy) proxy._w = sprite.width
  if ('_h' in proxy) proxy._h = sprite.height
  if ('_sx' in proxy) proxy._sx = sprite.scale.x
  if ('_sy' in proxy) proxy._sy = sprite.scale.y
  if ('_rot' in proxy) proxy._rot = sprite.rotation
}

export class TweenerChain {
  private timeline: gsap.core.Timeline
  private sprite: Sprite

  constructor(sprite: Sprite) {
    this.sprite = sprite
    this.timeline = gsap.timeline({ paused: true })
  }

  fade(target: number, durationMs: number, ease?: string): this {
    return this.tweenTo({ alpha: target }, durationMs, ease, false)
  }
  fadeIn(durationMs: number, ease?: string): this {
    return this.tweenTo({ alpha: 1 }, durationMs, ease, false)
  }
  fadeOut(durationMs: number, ease?: string): this {
    return this.tweenTo({ alpha: 0 }, durationMs, ease, false)
  }
  to(props: TweenTarget, durationMs: number, ease?: string): this {
    return this.tweenTo(props, durationMs, ease, false)
  }
  by(props: TweenTarget, durationMs: number, ease?: string): this {
    return this.tweenTo(props, durationMs, ease, true)
  }
  wait(durationMs: number): this {
    this.timeline.to({}, { duration: durationMs / 1000 })
    return this
  }
  call(fn: () => void): this {
    this.timeline.call(fn)
    return this
  }
  setLoop(loop: boolean): this {
    this.timeline.repeat(loop ? -1 : 0)
    return this
  }

  private tweenTo(
    props: TweenTarget,
    durationMs: number,
    ease: string | undefined,
    relative: boolean
  ): this {
    const sprite = this.sprite
    const { proxy, vars } = buildStep(
      sprite,
      props,
      durationMs,
      mapEase(ease),
      relative
    )
    // セグメント開始時に proxy を現在値に再同期 (連続 by/to の起点を直前の終端に揃える)
    const originalUpdate = vars.onUpdate as (() => void) | undefined
    vars.onStart = () => startProxiesAtCurrent(sprite, proxy)
    vars.onUpdate = originalUpdate
    this.timeline.add(gsap.to(proxy, vars), '>')
    return this
  }

  play(): this {
    this.timeline.restart(true)
    return this
  }

  stop(): void {
    this.timeline.pause()
    this.timeline.kill()
  }
}

// Phina の sprite.attach(Tweener()...) を再現するためのビルダー
export interface TweenStep {
  kind: 'to' | 'by' | 'fade' | 'fadeIn' | 'fadeOut' | 'wait' | 'call'
  props?: TweenTarget
  target?: number
  durationMs?: number
  ease?: string
  fn?: () => void
}

export class TweenerBuilder {
  steps: TweenStep[] = []
  loop = false

  to(props: TweenTarget, durationMs: number, ease?: string): this {
    this.steps.push({ kind: 'to', props, durationMs, ease })
    return this
  }
  by(props: TweenTarget, durationMs: number, ease?: string): this {
    this.steps.push({ kind: 'by', props, durationMs, ease })
    return this
  }
  fade(target: number, durationMs: number, ease?: string): this {
    this.steps.push({ kind: 'fade', target, durationMs, ease })
    return this
  }
  fadeIn(durationMs: number, ease?: string): this {
    this.steps.push({ kind: 'fadeIn', durationMs, ease })
    return this
  }
  fadeOut(durationMs: number, ease?: string): this {
    this.steps.push({ kind: 'fadeOut', durationMs, ease })
    return this
  }
  wait(durationMs: number): this {
    this.steps.push({ kind: 'wait', durationMs })
    return this
  }
  call(fn: () => void): this {
    this.steps.push({ kind: 'call', fn })
    return this
  }
  setLoop(loop: boolean): this {
    this.loop = loop
    return this
  }

  applyTo(sprite: GameSprite): TweenerChain {
    const chain = new TweenerChain(sprite)
    if (this.loop) chain.setLoop(true)
    for (const s of this.steps) {
      switch (s.kind) {
        case 'to':
          chain.to(s.props!, s.durationMs!, s.ease)
          break
        case 'by':
          chain.by(s.props!, s.durationMs!, s.ease)
          break
        case 'fade':
          chain.fade(s.target!, s.durationMs!, s.ease)
          break
        case 'fadeIn':
          chain.fadeIn(s.durationMs!, s.ease)
          break
        case 'fadeOut':
          chain.fadeOut(s.durationMs!, s.ease)
          break
        case 'wait':
          chain.wait(s.durationMs!)
          break
        case 'call':
          chain.call(s.fn!)
          break
      }
    }
    return chain
  }
}

export const Tweener = (): TweenerBuilder => new TweenerBuilder()

// Phina の Sprite("name").addChildTo(scene) 互換オブジェクト
export class GameSprite extends Sprite {
  imageName: string
  meta: Record<string, unknown> = {}
  private interactiveTweeners: TweenerChain[] = []
  private currentTweener: TweenerChain | null = null

  constructor(imageName: string) {
    super(getTexture(imageName))
    this.imageName = imageName
    this.anchor.set(0.5, 0.5)
  }

  setImage(name: string): void {
    this.texture = getTexture(name)
    this.imageName = name
  }

  setInteractive(): void {
    this.eventMode = 'static'
    this.cursor = 'pointer'
  }

  addChildTo(parent: Container): this {
    parent.addChild(this)
    return this
  }

  // sprite.tweener.xxx().play() — 1 系統のみ。新しい getter 取得時に直前を停止
  get tweener(): TweenerChain {
    this.currentTweener?.stop()
    this.currentTweener = new TweenerChain(this)
    return this.currentTweener
  }

  // Phina の sprite.attach(tweener) は永続 (loop アニメ等)
  attach(builder: TweenerBuilder): void {
    const chain = builder.applyTo(this)
    chain.play()
    this.interactiveTweeners.push(chain)
  }

  remove(): void {
    this.killTweens()
    if (this.parent) this.parent.removeChild(this)
    this.destroy()
  }

  // Pixi の destroy() 経由 (Scene.destroy({children:true})) でも GSAP timeline を確実に止める
  override destroy(options?: Parameters<Sprite['destroy']>[0]): void {
    this.killTweens()
    super.destroy(options)
  }

  private killTweens(): void {
    this.currentTweener?.stop()
    this.currentTweener = null
    for (const t of this.interactiveTweeners) t.stop()
    this.interactiveTweeners = []
  }
}

export const makeSprite = (imageName: string): GameSprite =>
  new GameSprite(imageName)
