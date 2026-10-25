import Phaser from 'phaser'
import { MenuScene } from './scenes/MenuScene'
import { LevelSelectScene } from './scenes/LevelSelectScene'
import { GameScene } from './scenes/GameScene'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#020617',
  pixelArt: false,
  roundPixels: true,
  resolution: window.devicePixelRatio || 1,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MenuScene, LevelSelectScene, GameScene],
}

const game = new Phaser.Game(config)

// 调试入口：便于控制台/自动化测试访问游戏
window.game = game
