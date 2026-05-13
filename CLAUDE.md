# Tin! Tilo! Rings! 開発者向けドキュメント

チンチロリン（Cee-lo）をベースにした 3 リール回転式ゲーム。**Phina.js 95% 完成版を正本に PixiJS v8 + TypeScript で再実装**。

## 重要な歴史的経緯

- 元実装: Phina.js (`reference/tin-tilo-rings-phina/`)
- 一度 Phaser 3 へ移植したが**失敗**。コード破棄
- 一度 PixiJS へ移植したが、**失敗版 Phaser をベースに翻訳した**ため挙動が狂い破棄
- 現在: **Phina 版を直接根拠に PixiJS で再実装**

→ `reference/tin-tilo-rings-phina/phinajs/assets/js/` が**唯一の正本**。`git log` 上の `MainScene.ts` 等は失敗版なので参照しないこと。

## プロジェクト構造

```
src/
├── main.ts                    # エントリーポイント (PIXI.Application 起動 + アセット pre-load)
├── game/
│   ├── App.ts                 # SceneManager: title ⇄ main の切替
│   ├── Scene.ts               # PIXI.Container 継承の基底 (update/onClick/exit)
│   ├── TitleScene.ts          # Phina title.js を再現
│   ├── MainScene.ts           # Phina main.js のステートマシン (mode 遷移) を再現
│   ├── pixi-sprite.ts         # GameSprite + Tweener (Phina の Sprite/Tweener API ラッパ)
│   ├── textures.ts            # PIXI.Assets でのテクスチャプリロード + キャッシュ
│   ├── assets.ts              # Vite import.meta.glob で Phina の Assets/BGMs マップを再構築
│   ├── audio.ts               # Phina audio.js を Howler に置換
│   ├── input.ts               # Space + pointerdown を scene.onClick に流す
│   ├── highscore.ts           # localStorage ハイスコア
│   ├── rolls.ts               # Phina rolls.js (役の定義) を TS 化
│   ├── rule.ts                # Phina rule.js (純粋ロジック) を TS 化
│   └── sprites/               # Phina sprites.js の 20 クラスを 1 ファイルずつ分離
│       ├── BackgroundSprites.ts / KanjiSprites.ts / MonSprites.ts (背景)
│       ├── EffectSprites.ts / LinesSprites.ts (演出)
│       ├── RingSprites.ts (3 リール本体)
│       ├── GuidesSprites.ts / ModsSprites.ts (リーチ/mod ガイド)
│       ├── AlphabetsSprites.ts / ScoresSprites.ts (役・odds 表)
│       ├── ComboSprites.ts / CurrentScoreSprites.ts / TotalScoreSprites.ts
│       ├── TimeSprites.ts / BetTimesSprites.ts (HUD)
│       ├── InfoSprite.ts / BackSprite.ts / TitleSprite.ts / RulesSprite.ts (UI)
│       └── ResultSprites.ts (リザルト画面)
└── assets/
    ├── bgm/                   # BGM (.ogg)
    ├── image/                 # 画像 (Phina で参照されるサブディレクトリのみ glob)
    └── sound/                 # SE / ボイス (.ogg)

reference/tin-tilo-rings-phina/   # 正本 Phina 実装。**触らない**

docs/
├── ARCHITECTURE.md
├── GAME_SPEC.md
└── README.md
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

## 状態機械 (MainScene.mode)

Phina main.js の `mode` をそのまま流用:

```
first → ready → rotate_3 → braking_3 → braked_3
              → rotate_2 → braking_2 → braked_2
              → rotate_1 → braking_1 → braked_1
              → showing_mods → showing_scores → shown_scores
              → (loop) または → shown_result
```

## スコア計算

### 評価順序

1. **Multi 判定** (multiplicative): pinzoro / arashikabu / kemono / triple_seven / zorome / shigoro / hifumi
2. **Me 判定** (additive): pink_ribbon / pinbasami / me
3. **Kabu 判定** (mod 10): pin / nizou / santa / yotsuya / goke / roppou / shichiken / oicho / kabu

### 11 ライン評価

各スピンで 11 本のライン (a〜k) を評価。reach (2 リール一致) → zone reach 判定 → 確定後の役判定。

### コンボ

- 100 点以上で継続 (i_combo++)
- 最大 10 倍まで (i_combo > 10 は 10 として扱う)
- 値の clamp は ±9999

## 特殊機能

### ゾーンシステム

特定の 3 数字でゾーンモード突入: 110 / 359 / 427 / 488 / 501 / 564 / 712 / 893 / 931

50% で **バレットタイム** (速度 2 固定 / 30 秒)、50% で **レボリューション** (multi 役の符号反転 / 30 秒)。

### トリプルセブン効果

`[7,7,7]` 出現で確率発動:

| 確率 | 効果                      |
| ---: | ------------------------- |
|   5% | all_1                     |
|   5% | all_6                     |
|   5% | triplets (整列)           |
|   5% | triplets (shuffle)        |
|  10% | others (0..6 + 789)       |
|  10% | all_123                   |
|  10% | all_456                   |
|  50% | rollback (右リール再回転) |

### 救急車

[1,1,9] / [9,1,1] / [1,2,0] / [1,1,2] が出ると elapsed_time -10 秒 (rule_3 時間制で利得)。

## 依存パッケージ

| パッケージ | 用途                      |
| ---------- | ------------------------- |
| pixi.js v8 | レンダリング              |
| gsap       | Tween / アニメーション    |
| howler     | オーディオ (BGM/SE/Voice) |
| vite       | ビルドツール              |

## ビルド

```bash
npm run dev          # 開発サーバー (http://localhost:3000/cee-lo-rings/)
npm run build        # プロダクションビルド (tsc + vite build)
npm run preview      # ビルド成果物を local プレビュー
npm run lint         # ESLint
npm run format       # Prettier --write
npm run format:check # Prettier --check
```

## CI/CD

- **`.github/workflows/ci.yml`**: Lint + Format check + Type check + Build (PR / push 時)
- **`.github/workflows/deploy.yml`**: GitHub Pages へ自動デプロイ
- **Husky + lint-staged**: pre-commit hooks

## アセット

- 画像は Phina が参照するサブディレクトリのみ Vite glob (`bg/kanji/mon/ring/title/guide/mod/line/score/result/effect/dummy.png`)
- Phina manifest 外の参考用 jpg (Bishamonten 等) はバンドルに含めない
- BGM ループは Howler 標準 `loop:true` で実装 (Phina の手動 setTimeout ループは不要)
- フォント数字 (`fude_n_*.png`) はビットマップ。テキスト描画は ResultSprites のみ PIXI.Text を使用

## Phina 仕様一致のポリシー

1. **状態名・関数名は Phina と同じ綴り** (例: `rotate_3`, `Rule.calcScores`) — 正本との照合容易性を最優先
2. **判定式 (rule.ts/rolls.ts) は厳密一致** — 数値・順序・clamp 値を変えない
3. **スプライト座標・タイミング (sprites.ts) は Phina の数値をそのまま使う**
4. **PixiJS の慣用が必要な箇所のみ翻訳** (rotation 単位, Container hierarchy, Howler の loop 機能等)
5. **挙動非一致を入れる場合はコメントで明記** (例: アセット glob の絞り込み)
