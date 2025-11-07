import { useState } from 'react'
import PhaserGame from './components/PhaserGame'
import './App.css'

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        <h1>スロットマシンゲーム - React + Vite + TypeScript</h1>
      </header>

      <main>
        {!gameStarted ? (
          <div className="start-screen">
            <p>シンプルなスロットマシンゲームです</p>
            <p>スペースキーまたはクリックでスピン！</p>
            <button onClick={() => setGameStarted(true)}>ゲームを始める</button>
          </div>
        ) : (
          <PhaserGame />
        )}
      </main>
    </div>
  )
}

export default App
