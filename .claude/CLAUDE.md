# Tin! Tilo! Rings! - プロジェクト管理ドキュメント

## プロジェクト概要

**プロジェクト名:** cee-lo-rings
**元実装:** [tin-tilo-rings](https://github.com/kako-jun/tin-tilo-rings) (Phina.js)
**現実装:** Phaser 3 + React + TypeScript + Vite
**開発状況:** ✅ 完全移植完了（2025-11-17）

### ゲーム概要

チンチロリン（Cee-lo）をベースにした3リール回転式スロットゲーム。

- 3本のリング（スロット）が回転し、出目の組み合わせで得点を獲得
- 20種類の役（ピンゾロ、ゾロ目、シゴロ、カブなど）
- 特殊機能：リーチ、ゾーンモード、トリプルセブン効果
- 9種類のゲームルール（時間制限、回数制限、スコアアタック）

---

## 技術構成

### フロントエンド

- **React 18.3.1** - UIフレームワーク
- **Phaser 3.87.0** - ゲームエンジン
- **TypeScript 5.7.3** - 型安全性
- **Vite 6.0.11** - ビルドツール
- **Tailwind CSS 4.1.17** - スタイリング

### 開発ツール

- **ESLint** - コード品質チェック
- **Prettier** - コードフォーマット
- **Husky + lint-staged** - Git pre-commit hooks

### デプロイ

- **GitHub Pages** - 静的サイトホスティング
- ベースパス: `/cee-lo-rings/`

---

## プロジェクト構造

```
cee-lo-rings/
├── .claude/                    # プロジェクト管理ドキュメント（このディレクトリ）
│   ├── CLAUDE.md              # プロジェクト概要・設計（このファイル）
│   ├── TODO.md                # TODOリスト
│   ├── PORTING.md             # Phina.js → Phaser 3 移植記録
│   └── TESTING.md             # テスト項目・確認事項
├── docs/                       # 開発者向けドキュメント
│   ├── README.md              # ドキュメント目次
│   ├── GAME_SPEC.md           # ゲーム仕様書
│   ├── ARCHITECTURE.md        # アーキテクチャ
│   └── PHINA_TO_PHASER_MAPPING.md  # フレームワーク対応表
├── public/
│   └── assets/                # ゲームアセット
│       ├── bgm/               # BGM（5曲）
│       ├── image/             # 画像（400+ファイル）
│       │   ├── ring/          # リング画像（4色×10数字）
│       │   ├── bg/            # 背景（37種類）
│       │   ├── kanji/         # 漢字（35種類）
│       │   ├── mon/           # 紋（14種類）
│       │   ├── guide/         # ガイド画像
│       │   ├── score/         # スコア表示画像
│       │   └── effect/        # エフェクト画像
│       └── sound/             # 効果音（71ファイル）
├── src/
│   ├── components/
│   │   └── PhaserGame.tsx     # Phaserゲームコンポーネント
│   └── game/                  # ゲームロジック
│       ├── config.ts          # Phaser設定
│       ├── TitleScene.ts      # タイトル画面
│       ├── MainScene.ts       # メインゲーム画面 ⭐
│       ├── Sprites.ts         # スプライトクラス群 ⭐
│       ├── AudioManager.ts    # 音声管理
│       ├── rule.ts            # ゲームルール・計算
│       └── rolls.ts           # 役の定義
└── dist/                      # ビルド成果物

⭐ = 移植で完全書き換えしたファイル
```

---

## 設計方針

### 1. **完全な機能パリティ**

元のPhina.js実装のすべての機能を正確に再現：

- リングの42pxグリッドスナッピング
- すべてのアニメーション（回転・拡大縮小・フェード）
- タイミング精度（Me: 0ms, Kabu: 500ms, Multi: 1000ms）
- 効果音の同期

### 2. **型安全性の徹底**

- TypeScript Strictモード
- すべての関数・変数に明示的な型定義
- any型の排除（ESLintルール強制）

### 3. **クラスベース設計**

Phina.jsのクラス構造をPhaser 3に適切に移植：

```typescript
// 元のPhina.js
class RingSprites {
  constructor(scene, x, y) { ... }
  redraw(ns, color) { ... }
  rotate(speed) { ... }
  brake(speed, callback) { ... }  // 42pxグリッドスナッピング
  stop(isZone) { ... }
  transform(sprite) { ... }       // 3D透視効果
}

// Phaser 3実装
export class RingSprites {
  private scene: MainScene
  private sprites: Phaser.GameObjects.Image[] = []
  public eyes: number[] = []

  constructor(scene: MainScene, x: number, y: number, position: 'left' | 'center' | 'right') { ... }
  redraw(ns: number[], color: string): void { ... }
  rotate(speed: number): void { ... }
  brake(speed: number, callback: () => void): void { ... }
  stop(isZone: boolean): void { ... }
  private transform(sprite: Phaser.GameObjects.Image): void { ... }
}
```

### 4. **アニメーションの正確性**

#### Phina.js Tweener → Phaser 3 Tweens 対応表

| Phina.js                              | Phaser 3                                                         | 用途         |
| ------------------------------------- | ---------------------------------------------------------------- | ------------ |
| `Tweener().to({x: 100}, 1000).play()` | `this.tweens.add({targets: sprite, x: 100, duration: 1000})`     | 絶対値       |
| `Tweener().by({x: 100}, 1000).play()` | `this.tweens.add({targets: sprite, x: '+=100', duration: 1000})` | 相対値       |
| `.fadeIn(duration)`                   | `alpha: {from: 0, to: 1}`                                        | フェードイン |
| `.setLoop(true)`                      | `repeat: -1`                                                     | 無限ループ   |
| `easeOutExpo`                         | `'Expo.easeOut'`                                                 | イージング   |

### 5. **パフォーマンス最適化**

- スプライトプール（40個/リング）による無限スクロール
- 不要なスプライトの即座destroy()
- tweenアニメーションの並列実行

---

## 主要コンポーネント

### MainScene.ts

ゲームのメインロジック。14の状態（GameMode）を管理：

```typescript
type GameMode =
  | 'first' // 初回表示
  | 'ready' // 準備完了
  | 'rotate_3' // 3リング回転中
  | 'braking_3' // リング1ブレーキ中
  | 'braked_3' // リング1停止完了
  | 'rotate_2' // 2リング回転中
  | 'braking_2' // リング2ブレーキ中
  | 'braked_2' // リング2停止完了
  | 'rotate_1' // 1リング回転中
  | 'braking_1' // リング3ブレーキ中
  | 'braked_1' // リング3停止完了
  | 'showing_mods' // mod値表示中
  | 'showing_scores' // スコア表示中
  | 'shown_scores' // スコア表示完了
  | 'shown_result' // 結果画面表示中
```

### Sprites.ts

すべてのスプライトクラスを集約：

1. **RingSprites** - リング表示・回転・停止
   - 42pxグリッドスナッピング
   - Expo.easeOutイージング
   - 3D透視効果（transform）

2. **BackgroundSprites** - 背景アニメーション
   - 回転：-60° → +30° → +90° → 0°（240秒周期）
   - スケール：1.0x ⇄ 1.5x（120秒周期）
   - 移動：正方形パターン（40秒周期）

3. **KanjiSprites** - 漢字装飾（35種類）
   - 回転：Back.easeInOutで360°/-360°
   - スケール：2x ⇄ 3x
   - 複雑な12ステップ移動パス
   - ランダム画像切り替え

4. **MonSprites** - 紋装飾（14種類）
   - 回転：Elastic.easeInOutで360°/-360°
   - スケール：1x ⇄ 1.5x
   - 複雑な12ステップ移動パス
   - ランダム画像切り替え

5. **ScoresSprites** - スコア表示
   - 段階的表示（Me: 0ms, Kabu: 500ms, Multi: 1000ms）
   - 役名画像 + 倍率/加算値画像

6. **CurrentScoreSprites** - 現在スコア表示
   - 連続フェードアニメーション
   - コンボ表示

7. **TotalScoreSprites** - 合計スコア表示
   - 筆文字スタイル数字画像

---

## 移植で解決した問題

### 問題1: スロットがピッタリ止まらない

**原因:** 元実装の42pxグリッドスナッピングロジックが未実装
**解決:**

```typescript
brake(speed: number, callback: () => void): void {
  this.sprites.forEach((sprite, i) => {
    const initialY = this.getInitialY(i)
    const dy = sprite.y - initialY
    const dn = Math.floor(dy / 42)  // ← 42pxグリッド計算
    const destY = initialY + 42 * dn
    const destDy = destY - sprite.y
    const duration = 10 * Math.abs(destDy)  // 10ms/pixel

    this.scene.tweens.add({
      targets: sprite,
      y: destY,
      duration: duration,
      ease: 'Expo.easeOut',  // ← スロットマシン的な減速
    })
  })
}
```

### 問題2: 背景が表示されない

**原因:** BackgroundSpritesクラスが未実装
**解決:** 完全な3層アニメーションシステムを実装

### 問題3: スロット周辺の装飾がない

**原因:** KanjiSprites/MonSpritesクラスが未実装
**解決:** 35+14種類の画像を自動ロード＆アニメーション

### 問題4: 点数の画像が表示されない

**原因:** ScoresSpritesの表示タイミングロジックが不正確
**解決:** 役の種類（Me/Kabu/Multi）ごとに正確な遅延時間を設定

---

## 開発ガイドライン

### コーディング規約

1. **TypeScript Strict** - 厳密な型チェック
2. **ESLint** - `npm run lint` ですべてのエラーを解決
3. **Prettier** - `npm run format` で自動フォーマット
4. **no-explicit-any** - any型禁止

### コミットメッセージ

```
<type>: <subject>

<body>

<footer>
```

**Types:**

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `refactor:` リファクタリング
- `test:` テスト追加
- `chore:` ビルド・設定変更

### ブランチ戦略

- `main` - 本番デプロイ用
- `claude/*` - Claude開発用ブランチ
- プルリクエストでマージ

---

## テスト戦略

詳細は `.claude/TESTING.md` を参照。

### 自動テスト

- [ ] ビルドエラーなし（`npm run build`）
- [ ] ESLintエラーなし（`npm run lint`）
- [ ] 型エラーなし（`tsc --noEmit`）

### 手動テスト

- [ ] スロット停止精度
- [ ] 背景アニメーション
- [ ] スコア表示
- [ ] 音声再生
- [ ] 全9ルールのクリア

---

## 今後の改善案

詳細は `.claude/TODO.md` を参照。

### 優先度：高

- [ ] 実機テスト完了
- [ ] ブラウザコンソールエラー確認
- [ ] 元実装との完全一致確認

### 優先度：中

- [ ] パフォーマンスプロファイリング
- [ ] モバイル対応最適化
- [ ] リザルト画面の詳細化

### 優先度：低

- [ ] 多言語対応（英語）
- [ ] ハイスコアのクラウド保存
- [ ] ソーシャル共有機能

---

## リファレンス

### 元実装

- **リポジトリ:** https://github.com/kako-jun/tin-tilo-rings
- **デモ:** https://kako-jun.github.io/tin-tilo-rings/phinajs/
- **フレームワーク:** Phina.js

### 技術ドキュメント

- [Phaser 3 公式ドキュメント](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript公式サイト](https://www.typescriptlang.org/)
- [Vite公式サイト](https://vitejs.dev/)

### プロジェクトドキュメント

- `docs/GAME_SPEC.md` - ゲーム仕様書
- `docs/ARCHITECTURE.md` - アーキテクチャ
- `docs/PHINA_TO_PHASER_MAPPING.md` - フレームワーク対応表
- `.claude/PORTING.md` - 移植作業記録
- `.claude/TODO.md` - TODOリスト
- `.claude/TESTING.md` - テスト項目

---

## 連絡先

**作者:** kako-jun
**ライセンス:** MIT
**GitHub:** https://github.com/kako-jun/cee-lo-rings
