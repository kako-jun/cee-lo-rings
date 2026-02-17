# Reference Materials

このディレクトリには、cee-lo-rings の参照用資料を保管しています。

## tin-tilo-rings-phina/

**phina.js 版の Tin! Tilo! Rings!（95%完成版）**

- 実装: phina.js + JavaScript
- 状態: 95%完成、正常動作確認済み
- 行数: 約5,500行の実装コード
- 用途: Phaser版の実装参照、ゲームロジックの正解版

### 経緯

Phaser版への移行後、ゲームが壊れまくっているため、正しく動作していたphina.js版を参照用として保存。
完成度の高いこの実装を参考にして、Phaser版を修正する。

### ファイル構造

```
phinajs/
├── assets/js/
│   ├── main.js       - メインループ
│   ├── rule.js       - ルール判定（723行）
│   ├── rolls.js      - リール制御（349行）
│   ├── sprites.js    - スプライト管理（2909行）
│   ├── constants.js  - 定数定義（492行）
│   ├── audio.js      - 音声制御
│   ├── network.js    - ネットワーク
│   └── title.js      - タイトル画面
├── mobile_auto_skippable/
│   └── ads.js        - 広告制御（180行）
└── vendor/           - phina.js ライブラリ
```
