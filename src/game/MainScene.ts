import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private reels: Phaser.GameObjects.Text[][] = []
  private spinButton!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text
  private creditsText!: Phaser.GameObjects.Text
  private spinning: boolean = false
  private credits: number = 100
  private readonly symbols = ['🍒', '🍋', '🍊', '🔔', '💎', '7️⃣']
  private readonly REEL_COUNT = 3
  private readonly SYMBOL_HEIGHT = 80
  private readonly BET_AMOUNT = 10

  constructor() {
    super({ key: 'MainScene' })
  }

  create(): void {
    const { width } = this.cameras.main

    // タイトル
    this.add
      .text(width / 2, 50, 'スロットマシン', {
        fontSize: '48px',
        color: '#FFD700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // クレジット表示
    this.creditsText = this.add
      .text(width / 2, 120, `クレジット: ${this.credits}`, {
        fontSize: '24px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)

    // リール枠の作成
    const reelStartX = width / 2 - 150
    const reelStartY = 200

    for (let i = 0; i < this.REEL_COUNT; i++) {
      const reelX = reelStartX + i * 100

      // リール背景
      const reelBg = this.add.rectangle(
        reelX,
        reelStartY + this.SYMBOL_HEIGHT / 2,
        90,
        this.SYMBOL_HEIGHT,
        0x333333
      )
      reelBg.setStrokeStyle(3, 0xffd700)

      // リールのシンボル列
      this.reels[i] = []
      for (let j = 0; j < 3; j++) {
        const symbol = this.add
          .text(reelX, reelStartY + j * 30, this.getRandomSymbol(), {
            fontSize: '48px',
          })
          .setOrigin(0.5)
        this.reels[i].push(symbol)
        symbol.setVisible(j === 1) // 中央のシンボルのみ表示
      }
    }

    // 結果表示
    this.resultText = this.add
      .text(width / 2, 350, '', {
        fontSize: '32px',
        color: '#00FF00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // スピンボタン
    this.spinButton = this.add
      .text(width / 2, 450, 'スピン (スペースキー)', {
        fontSize: '28px',
        color: '#FFFFFF',
        backgroundColor: '#4CAF50',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive()

    this.spinButton.on('pointerdown', () => this.spin())
    this.spinButton.on('pointerover', () => {
      this.spinButton.setBackgroundColor('#45a049')
    })
    this.spinButton.on('pointerout', () => {
      this.spinButton.setBackgroundColor('#4CAF50')
    })

    // 操作説明
    this.add
      .text(width / 2, 530, '💰 3つ揃うと当たり！', {
        fontSize: '20px',
        color: '#CCCCCC',
      })
      .setOrigin(0.5)

    // キーボード入力
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.spinning) {
        this.spin()
      }
    })
  }

  private getRandomSymbol(): string {
    return this.symbols[Phaser.Math.Between(0, this.symbols.length - 1)]
  }

  private spin(): void {
    if (this.spinning || this.credits < this.BET_AMOUNT) {
      if (this.credits < this.BET_AMOUNT) {
        this.resultText.setText('クレジット不足！')
        this.resultText.setColor('#FF0000')
      }
      return
    }

    this.spinning = true
    this.credits -= this.BET_AMOUNT
    this.creditsText.setText(`クレジット: ${this.credits}`)
    this.resultText.setText('スピン中...')
    this.resultText.setColor('#FFFFFF')

    // 各リールをスピン
    const finalSymbols: string[] = []

    this.reels.forEach((reel, i) => {
      let spins = 0
      const maxSpins = 20 + i * 5

      this.time.addEvent({
        delay: 50,
        repeat: maxSpins,
        callback: () => {
          const newSymbol = this.getRandomSymbol()
          reel[1].setText(newSymbol)
          spins++

          if (spins === maxSpins) {
            finalSymbols[i] = newSymbol
            if (i === this.REEL_COUNT - 1) {
              // 全リール停止後、結果判定
              this.checkResult(finalSymbols)
            }
          }
        },
      })
    })
  }

  private checkResult(symbols: string[]): void {
    const allSame = symbols.every(symbol => symbol === symbols[0])

    if (allSame) {
      // 大当たり
      const winAmount = this.BET_AMOUNT * 10
      this.credits += winAmount
      this.resultText.setText(`🎉 大当たり！ +${winAmount} 🎉`)
      this.resultText.setColor('#FFD700')

      // 勝利アニメーション
      this.tweens.add({
        targets: this.resultText,
        scale: { from: 1, to: 1.3 },
        duration: 200,
        yoyo: true,
        repeat: 2,
      })
    } else if (
      symbols[0] === symbols[1] ||
      symbols[1] === symbols[2] ||
      symbols[0] === symbols[2]
    ) {
      // 小当たり
      const winAmount = this.BET_AMOUNT * 2
      this.credits += winAmount
      this.resultText.setText(`当たり！ +${winAmount}`)
      this.resultText.setColor('#00FF00')
    } else {
      // ハズレ
      this.resultText.setText('ハズレ...')
      this.resultText.setColor('#FF6B6B')
    }

    this.creditsText.setText(`クレジット: ${this.credits}`)
    this.spinning = false
  }
}
