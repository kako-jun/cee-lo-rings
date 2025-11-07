import Phaser from 'phaser'
import { TitleScene } from './TitleScene'
import { MainScene } from './MainScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 960,
  parent: 'phaser-game',
  backgroundColor: '#732121',
  scene: [TitleScene, MainScene],
}
