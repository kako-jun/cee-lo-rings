# Tin! Tilo! Rings! 開発者向けドキュメント

チンチロリン（Cee-lo）をベースにした3リール回転式ゲーム。Phaser 3 + TypeScript実装。

## プロジェクト構造

```
src/
├── main.tsx               # エントリーポイント
├── App.tsx                # Reactラッパー
├── components/
│   └── PhaserGame.tsx     # Phaser統合コンポーネント
└── game/
    ├── config.ts          # Phaser設定
    ├── TitleScene.ts      # タイトル画面
    ├── MainScene.ts       # メインゲーム
    ├── AudioManager.ts    # BGM・効果音管理
    ├── rolls.ts           # 役の定義
    └── rule.ts            # ゲームロジック

public/assets/
├── bgm/                   # BGMファイル（.ogg）
├── image/
│   ├── ring/              # リング画像（白/ピンク/黄/グレー × 0-9）
│   ├── bg/                # 背景画像（37種類）
│   ├── title/             # タイトル画面素材
│   ├── guide/             # リーチガイド画像
│   ├── score/             # スコア表示画像
│   └── effect/            # エフェクト画像
└── sound/                 # 効果音（71ファイル）

docs/
├── GAME_SPEC.md           # ゲーム仕様書
└── ARCHITECTURE.md        # アーキテクチャ詳細
```

## ゲームフロー

```
TitleScene → ルール選択 → MainScene
    ↓
カウントダウン → リール回転 → 左停止 → 中停止 → 右停止
    ↓
リーチ判定 → ゾーン判定 → mod計算 → スコア計算
    ↓
コンボ計算 → 総スコア更新 → クリア判定
    ├─ クリア → リザルト表示
    └─ 未クリア → 次スピンへ
```

## スコア計算

### 評価順序

1. **Multi判定**: 乗算系（ピンゾロ、ゾロ目、シゴロ等）
2. **Me判定**: 加算系（ピンクリボン、ピンバサミ、メ）
3. **Kabu判定**: mod 10の結果（ピン〜カブ、ブタ）

### 11ライン評価

各スピンで11本のライン（a〜k）を評価。

### コンボシステム

- 100点以上でコンボ継続
- 最大10倍まで

## 特殊機能

### ゾーンシステム

特定の3数字でゾーンモード突入（110, 359, 427, 488, 501, 564, 712, 893, 931）

- **バレットタイム**: 速度半減、30秒
- **レボリューション**: スコア2倍、30秒

### トリプルセブン効果

[7,7,7]出現で以下の効果が確率発動:

- all_1, all_6: 特定数字のみになる
- all_123, all_456: 特定範囲になる
- triplets: ゾロ目が出やすくなる
- rollback: 右リールを再回転

## 依存パッケージ

| パッケージ  | 用途                 |
| ----------- | -------------------- |
| phaser      | ゲームフレームワーク |
| react       | UIラッパー           |
| vite        | ビルドツール         |
| tailwindcss | スタイリング         |

## ビルド

```bash
npm run dev          # 開発サーバー
npm run build        # プロダクションビルド
npm run lint         # ESLint
npm run format       # Prettier
```

## CI/CD

- **deploy.yml**: GitHub Pagesへ自動デプロイ
- **Husky + lint-staged**: pre-commit hooks

## パフォーマンス

- 400以上のアセットファイル
- バンドルサイズ: ~1.6MB（gzip: ~395KB）
- 60fps動作目標

## 将来計画

- リザルト画面の詳細化
- ハイスコアのローカルストレージ保存
- パーティクルエフェクト追加
- モバイル最適化
- 多言語対応
