import { App } from './game/App'

async function bootstrap(): Promise<void> {
  const loading = document.getElementById('loading')
  const app = new App()
  try {
    await app.init(loading)
  } catch (e) {
    console.error(e)
    if (loading) loading.textContent = 'Failed to load assets.'
    return
  }
  if (loading) loading.remove()
  app.start()
}

void bootstrap()
