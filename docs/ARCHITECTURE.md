# Tin! Tilo! Rings! - アーキテクチャドキュメント

## 技術スタック

- **フレームワーク**: Phaser 3.80+
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite 6.x
- **UI**: React 18.x（ラッパーのみ）
- **スタイリング**: CSS

## プロジェクト構造

```
cee-lo-rings/
├── public/
│   └── assets/          # ゲームアセット（画像・音声）
│       ├── bgm/         # BGMファイル（.ogg）
│       ├── image/       # 画像ファイル（.png, .jpg）
│       └── sound/       # 効果音（.ogg）
├── src/
│   ├── components/
│   │   └── PhaserGame.tsx    # Phaser統合Reactコンポーネント
│   ├── game/
│   │   ├── AudioManager.ts   # 音声管理
│   │   ├── TitleScene.ts     # タイトルシーン
│   │   ├── MainScene.ts      # ゲームシーン
│   │   ├── config.ts         # Phaser設定
│   │   ├── rolls.ts          # 役の定義
│   │   └── rule.ts           # ゲームロジック
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   ├── GAME_SPEC.md          # ゲーム仕様書
│   └── ARCHITECTURE.md       # このファイル
└── package.json
```

## コアコンポーネント

### 1. AudioManager (`src/game/AudioManager.ts`)

**責務**: BGMと効果音の管理

**主要メソッド**:

```typescript
preload(): void                    // アセットのプリロード
playBGM(key: string, volume: number): void  // BGM再生
stopBGM(key?: string): void        // BGM停止
playSound(key: string, volume: number): void // 効果音再生
changeBGM(): void                  // BGM切り替え（1分ごと）
changeBGMVolume(volume: number): void // BGMボリューム変更
```

**特徴**:

- BGMはループ再生
- 複数のBGMトラックを管理（Map<string, Phaser.Sound.BaseSound>）
- ゾーンモード中はBGMボリュームを自動調整

### 2. TitleScene (`src/game/TitleScene.ts`)

**責務**: タイトル画面とルール選択

**状態管理**:

```typescript
type TitleMode = 'first' | 'select_rule'
```

**主要機能**:

- イントロボイス再生（チン・チロ・リン）
- 9種類のルールボタン（3×3グリッド）
- インフォボタン（外部リンク）
- ホバーエフェクトと効果音

**ルールボタン配置**:

```
[rule_1_2943] [rule_2_2943] [rule_3_0409]
[rule_1_8390] [rule_2_8390] [rule_3_2009]
[rule_1_37654] [rule_2_37654] [rule_3_6819]
```

### 3. MainScene (`src/game/MainScene.ts`)

**責務**: メインゲームプレイ

**ゲームモード**:

```typescript
type GameMode =
  | 'first' // 初期状態
  | 'ready' // 準備完了
  | 'rotate_3' // 3リール回転中
  | 'braking_3' // 左リールブレーキ中
  | 'braked_3' // 左リール停止
  | 'rotate_2' // 2リール回転中
  | 'braking_2' // 中央リールブレーキ中
  | 'braked_2' // 中央リール停止
  | 'rotate_1' // 右リール回転中
  | 'braking_1' // 右リールブレーキ中
  | 'braked_1' // 右リール停止
  | 'showing_mods' // mod値表示中
  | 'showing_scores' // スコア表示中
  | 'shown_scores' // スコア表示完了
  | 'shown_result' // リザルト表示
```

**主要メソッド**:

```typescript
// ゲームフロー制御
changeMode(): void                 // モード遷移処理
startReady(): void                 // カウントダウン開始
startRotation(): void              // リール回転開始

// リール制御
brakeRing1/2/3(): void             // 各リールのブレーキ
stopRing(): void                   // リール停止処理
redrawRing(): void                 // リール再描画

// スコアリング
checkReach(): void                 // リーチ判定
calculateScores(): void            // スコア計算
showScoresAndFinish(): void        // スコア表示
displayScores(): void              // スコア画像表示

// 特殊機能
startZone(): void                  // ゾーンモード開始
finishZone(): void                 // ゾーンモード終了
doRollback(): void                 // トリプルセブンロールバック
showEffect(): void                 // エフェクト表示

// ゲーム終了
finishGame(): void                 // ゲームクリア処理
prepareNextSpin(): void            // 次のスピン準備
```

### 4. Rule (`src/game/rule.ts`)

**責務**: ゲームロジックの実装

**主要な型**:

```typescript
export interface Score {
  alphabet: string
  tuple: number[]
  mod: number
  won: boolean
  roll: Roll | string
  gain?: number
  sum?: number
}

export interface GameStats {
  max_combo: number
  max_gain: number
  roll: Record<string, number>
  zone: Record<string, number>
  triple_seven: Record<string, number>
  egg: Record<string, number>
}
```

**主要メソッド**:

```typescript
shuffle(array: number[]): number[]
  // Fisher-Yatesシャッフル

getReaches(eyes1: number[], eyes2: number[]): string[]
  // 2リール停止時のリーチ判定

getZoneReaches(eyes1: number[], eyes2: number[]): string[]
  // ゾーントリガー判定

calcTuples(eyes1: number[], eyes2: number[], eyes3: number[]): number[][]
  // 11ラインの組み合わせ計算

calcMods(tuples: number[][]): number[]
  // 各ラインのmod 10計算

calcScores(tuples: number[][], mods: number[], revolution: boolean): Score[]
  // スコア計算（Multi→Me→Kabu）

calcCurrentScores(scores: Score[]): number[]
  // [base, with_odds, sum, final]形式でスコア集計

addComboScore(currentScores: number[], combo: number): number[]
  // コンボボーナス加算

calcTotalScore(total: number, currentScores: number[]): number
  // 総スコア更新

getNextSpeed(speed: number, score: number): number
  // スコアに応じたスピード調整

isAchieved(rule: string, time: number, score: number): boolean
  // クリア判定

getTripleSevenEffect(rollbackStock: number, stats: GameStats): TripleSevenEffect
  // トリプルセブン効果の決定
```

### 5. Rolls (`src/game/rolls.ts`)

**責務**: 役の定義

**Roll インターフェース**:

```typescript
export interface Roll {
  name: string // 役名（内部ID）
  desc: string // 役の説明
  rule: string // 適用ルール
  f: 'multi' | 'add' // 計算方法（乗算 or 加算）
  odds: number | null // 倍率/加算値
  judge: (tuple: number[], mod: number) => boolean // 判定関数
  calcGain: (src: number, tuple: number[], mod: number) => number // 獲得点計算
  won?: boolean // 勝利フラグ（実行時に設定）
}
```

**役のテーブル**:

- `RollTableMulti`: 乗算系7種類（ピンゾロ、アラシカブ、ケモノ、etc）
- `RollTableMe`: 加算系3種類（ピンクリボン、ピンバサミ、メ）
- `RollTableKabu`: カブ系9種類（ピン～カブ）

## データフロー

### ゲーム開始フロー

```
TitleScene起動
  ↓
ルール選択（9種類から1つ）
  ↓
MainScene起動（rule パラメータ渡し）
  ↓
カウントダウン（3, 2, 1）
  ↓
リール回転開始
```

### スピンフロー

```
startRotation()
  ↓
3リール同時回転（rotate_3モード）
  ↓
左リールブレーキ → 停止（braking_3 → braked_3）
  ↓
中央リールブレーキ → 停止（braking_2 → braked_2）
  ↓
リーチ判定 + ガイド表示
  ↓
右リールブレーキ → 停止（braking_1 → braked_1）
  ↓
ゾーン判定
  ↓
mod値計算 + 表示（showing_mods）
  ↓
スコア計算（Multi → Me → Kabu）
  ↓
ロールバック判定（トリプルセブン効果中のみ）
  ├─ YES → 右リール再回転
  └─ NO → スコア表示（showing_scores）
      ↓
  コンボ計算 + 総スコア更新
      ↓
  クリア判定
  ├─ 達成 → リザルト画面（shown_result）
  └─ 未達 → 次のスピン準備（prepareNextSpin）
      ↓
  速度調整 + 背景変更 + トリプルセブン効果適用
      ↓
  リール再描画
      ↓
  startRotation()に戻る
```

### スコア計算フロー

```
calcScores(tuples, mods, revolution)
  ↓
各ライン（a～k）に対して:
  ↓
  Step 1: Multi判定
  ├─ マッチ → スコア確定、次ステップスキップ
  └─ 不一致 → Step 2へ
      ↓
  Step 2: Me判定（加算系）
  ├─ マッチ → スコア確定、次ステップスキップ
  └─ 不一致 → Step 3へ
      ↓
  Step 3: Kabu判定（mod 10）
  ├─ マッチ → スコア確定
  └─ 不一致 → ブタ（0点）
  ↓
全ラインのスコアを集計
  ↓
革命中なら2倍
  ↓
コンボ倍率適用
  ↓
最終スコア確定
```

## パフォーマンス最適化

### アセット管理

- **プリロード**: 全アセットをシーン開始前にロード
- **スプライト再利用**: リング画像は40個のスプライトを循環使用
- **音声圧縮**: OGG形式（WebM Vorbis）を使用

### レンダリング

- **深度管理**: `setDepth()`でZ-order制御
- **アルファブレンド**: フェードイン/アウトでスムーズな表示切替
- **Tween**: Phaserの組み込みTweenシステムを使用

### メモリ管理

- **画像破棄**: スコア表示後に不要なスプライトを`destroy()`
- **音声停止**: BGM切り替え時に前のトラックを停止
- **ガイドクリア**: 次のスピン前にガイドスプライトをクリア

## テスト戦略

### 単体テスト（推奨）

```typescript
// Rule.tsのロジックをテスト
describe('Rule.calcScores', () => {
  it('should calculate pinzoro correctly', () => {
    const tuples = [[1, 1, 1]]
    const mods = [3]
    const scores = Rule.calcScores(tuples, mods, false)
    expect(scores[0].roll.name).toBe('pinzoro')
    expect(scores[0].gain).toBe(1000) // 100 * 10倍
  })
})
```

### 統合テスト

1. タイトル → ルール選択 → ゲーム開始
2. リール回転 → 停止 → スコア表示
3. ゾーン発動 → 効果適用
4. クリア条件達成 → リザルト表示

### 手動テスト

- 各ルールで正しくクリア判定されるか
- 全ての役が正しく判定されるか
- BGM・効果音が適切なタイミングで再生されるか

## デプロイ

### ビルド

```bash
npm run build
# → dist/フォルダに静的ファイル生成
```

### 環境変数

- `base`: Viteのbaseパス設定（例: `/cee-lo-rings/`）

### ホスティング

- GitHub Pages
- Netlify
- Vercel
  など、静的サイトホスティングサービスに対応

## トラブルシューティング

### 音が出ない

- ブラウザの自動再生ポリシーを確認
- ユーザーインタラクション後に音声再生を開始

### リールが正しく停止しない

- `stopRing()`の判定ロジックを確認
- スプライトのy座標とデータ取得範囲を確認

### スコアが合わない

- `calcScores()`のロジックを確認
- Multi → Me → Kabuの評価順序を確認
- 革命フラグが正しく適用されているか確認

## 拡張性

### 新しいルールの追加

1. `rule.ts`の`isAchieved()`に条件を追加
2. `TitleScene.ts`にボタンを追加
3. アセット画像を追加

### 新しい役の追加

1. `rolls.ts`に新しいRollオブジェクトを定義
2. 適切なテーブル（Multi/Me/Kabu）に追加
3. 役の画像を`public/assets/image/score/`に追加

### 新しいエフェクトの追加

1. エフェクト画像を`public/assets/image/effect/`に追加
2. `MainScene.showEffect()`で表示ロジックを実装
3. 音声ファイルを追加（必要に応じて）

## ライセンスと著作権

- オリジナル: [tin-tilo-rings](https://github.com/kako-jun/tin-tilo-rings) by kako-jun
- フレームワーク: Phaser 3（MIT License）
- 本実装: TypeScript移植版
