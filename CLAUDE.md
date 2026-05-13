# Tin! Tilo! Rings! 開発者向けドキュメント

チンチロリン（Cee-lo）をベースにした3リール回転式ゲーム。PixiJS v8 + TypeScript 実装（Phaser 3 から移植済）。

## プロジェクト構造

```
src/
├── main.ts                   # エントリーポイント (PIXI.Application 起動)
├── game/
│   ├── App.ts                # PIXI.Application + シーン切替
│   ├── Scene.ts              # 共通基底 (Container + timer/tween/ticker 管理)
│   ├── TitleScene.ts         # タイトル画面
│   ├── MainScene.ts          # メインゲーム + ステートマシン
│   ├── Sprites.ts            # 16 スプライトマネージャクラス
│   ├── AudioManager.ts       # Howler.js ベース BGM/SE/Voice
│   ├── InputManager.ts       # Space/Click + 200ms デバウンス + 除外領域
│   ├── GameState.ts          # 状態スナップショット型 + ?state= URL 復元
│   ├── assets.ts             # import.meta.glob ベースのアセット manifest
│   ├── highscore.ts          # localStorage ハイスコア
│   ├── rolls.ts              # 役の定義（純粋データ）
│   └── rule.ts               # ゲームロジック（純粋関数）
└── assets/                   # ゲームアセット（Vite が bundle に取り込む）
    ├── bgm/                  # BGM ファイル（.ogg）
    ├── image/                # 画像（ring/bg/title/guide/score/effect/kanji/mon/line/mod/result）
    └── sound/                # 効果音・ボイス（.ogg）

docs/
├── GAME_SPEC.md              # ゲーム仕様書
├── ARCHITECTURE.md           # アーキテクチャ詳細
└── PHINA_TO_PHASER_MAPPING.md # 過去マイグレーションの参考（Phaser 版時代の資料）
```

## ゲームフロー

```
TitleScene → ルール選択 → MainScene
    ↓
カウントダウン → リール回転 → 左停止 → 中停止 → 右停止
    ↓
リーチ判定 → ゾーン判定 → mod 計算 → スコア計算
    ↓
コンボ計算 → 総スコア更新 → クリア判定
    ├─ クリア → リザルト表示
    └─ 未クリア → 次スピンへ
```

## スコア計算

### 評価順序

1. **Multi 判定**: 乗算系（ピンゾロ、ゾロ目、シゴロ等）
2. **Me 判定**: 加算系（ピンクリボン、ピンバサミ、メ）
3. **Kabu 判定**: mod 10 の結果（ピン〜カブ、ブタ）

### 11 ライン評価

各スピンで 11 本のライン（a〜k）を評価。

### コンボシステム

- 100 点以上でコンボ継続
- 最大 10 倍まで

## 特殊機能

### ゾーンシステム

特定の3数字でゾーンモード突入（110, 359, 427, 488, 501, 564, 712, 893, 931）

- **バレットタイム**: 速度半減、30 秒
- **レボリューション**: スコア 2 倍、30 秒

### トリプルセブン効果

[7,7,7] 出現で以下の効果が確率発動:

- all_1, all_6: 特定数字のみになる
- all_123, all_456: 特定範囲になる
- triplets: ゾロ目が出やすくなる
- rollback: 右リールを再回転

## 依存パッケージ

| パッケージ | 用途                       |
| ---------- | -------------------------- |
| pixi.js    | レンダリング（v8）         |
| gsap       | Tween / アニメーション     |
| howler     | オーディオ（BGM/SE/Voice） |
| vite       | ビルドツール               |

## ビルド

```bash
npm run dev          # 開発サーバー (http://localhost:3000/cee-lo-rings/)
npm run build        # プロダクションビルド (tsc + vite build)
npm run preview      # ビルド成果物を local プレビュー
npm run lint         # ESLint
npm run format       # Prettier
```

## デバッグ

任意の局面から起動するには `?state=<base64-encoded-GameState>` を URL クエリで渡す。例:

```js
const s = { rule: 'rule_1_2943', mode: 'rotate_3' /* ... */ }
location.search = '?state=' + btoa(JSON.stringify(s))
```

リングデジット/カラーは `restoreRingVisuals()` で復元される。スコア表示側 (tuples/mods/scores) は次のスピンで再構築される。

## CI/CD

- **deploy.yml**: GitHub Pages へ自動デプロイ
- **Husky + lint-staged**: pre-commit hooks

## パフォーマンス

- 約 400 のアセットファイル
- バンドルサイズ: ~1.6MB（gzip: ~395KB）
- 60fps 動作目標

## 将来計画

- パーティクルエフェクト追加
- モバイル最適化（タッチ操作対応）
- 多言語対応
- `GameState` を使った録画 / 再生機能
