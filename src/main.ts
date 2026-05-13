// PixiJS v8 + GSAP + Howler エントリーポイント
// Phina 版の phina.main(() => GameApp({...}).run()) と title.js の起動を最小再現

import { Application } from 'pixi.js'
import { App, STAGE_WIDTH, STAGE_HEIGHT } from './game/App'
import { loadAllTextures } from './game/textures'

const setLoadingProgress = (ratio: number): void => {
  const bar = document.querySelector<HTMLDivElement>('#loading-bar > div')
  if (bar) bar.style.width = `${Math.floor(ratio * 100)}%`
}

const removeLoading = (): void => {
  const el = document.getElementById('loading')
  if (el) el.remove()
}

const main = async (): Promise<void> => {
  const pixiApp = new Application()
  await pixiApp.init({
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    background: '#732121',
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  })

  const host = document.getElementById('game') ?? document.body
  host.appendChild(pixiApp.canvas)

  setLoadingProgress(0.1)
  await loadAllTextures()
  setLoadingProgress(1)

  const app = new App(pixiApp)
  app.startTitle({})
  removeLoading()
}

main().catch(err => {
  console.error(err)
})
