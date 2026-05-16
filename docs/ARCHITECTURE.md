# Tin! Tilo! Rings! - アーキテクチャドキュメント

## 技術スタック

- **レンダリング**: PixiJS 8.x
- **Tween / アニメーション**: gsap 3.x
- **オーディオ**: Howler.js 2.x
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite 6.x

> 歴史的経緯: 元は phina.js → Phaser 3 → 現在の PixiJS への 2 段階移植版。`PHINA_TO_PHASER_MAPPING.md` は Phaser 版時代の API 対応表で、現行コードでは使用していない。

## プロジェクト構造

```
cee-lo-rings/
├── src/
│   ├── main.ts                   # エントリーポイント
│   ├── game/
│   │   ├── App.ts                # PIXI.Application 初期化 + シーン切替
│   │   ├── Scene.ts              # 共通基底 (Container + timer/tween/ticker 管理)
│   │   ├── TitleScene.ts         # タイトル + ルール選択
│   │   ├── MainScene.ts          # メインゲーム + ステートマシン
│   │   ├── Sprites.ts            # 16 マネージャクラス
│   │   ├── AudioManager.ts       # Howler ラッパー
│   │   ├── InputManager.ts       # Space/Click + デバウンス
│   │   ├── GameState.ts          # 状態スナップショット型
│   │   ├── assets.ts             # アセット manifest 自動生成
│   │   ├── highscore.ts          # localStorage ハイスコア
│   │   ├── rolls.ts              # 役の定義（純粋データ）
│   │   └── rule.ts               # ゲームロジック（純粋関数）
│   └── assets/                   # 画像・音声 (Vite が bundle に取り込む)
├── docs/
│   ├── README.md
│   ├── GAME_SPEC.md
│   ├── ARCHITECTURE.md           # このファイル
│   └── PHINA_TO_PHASER_MAPPING.md  # 過去マイグレーションの参考資料
└── package.json
```

## コアコンポーネント

### 1. App (`src/game/App.ts`)

**責務**: PIXI.Application の初期化とシーン切替

```typescript
init(progressEl): Promise<void>     // PIXI 起動 + 全アセットロード + InputManager 接続
start(): void                       // ?state= があれば MainScene、なければ TitleScene
swapScene(factory): void            // 旧シーン destroy → InputManager リセット → 新シーン add
```

`SceneContext` を介して各シーンに `audio`, `input`, `ticker`, `width`, `height`, `goTitle`, `goMain` を渡す。

### 2. Scene (`src/game/Scene.ts`)

**責務**: シーン共通の lifecycle 管理

`PIXI.Container` を継承し、以下を提供:

```typescript
delayedCall(ms, fn): () => void          // setTimeout を track。destroy で全 cancel
tween(target, vars): gsap.core.Tween    // gsap.to + auto-track。destroy で全 kill
onTick(cb): void                         // Ticker subscribe。destroy で auto-unsubscribe
```

`destroy()` 時に in-flight の timer / tween / ticker callback を全て解除するので、シーン遷移時のリソースリークやコールバック発火を防げる。

### 3. AudioManager (`src/game/AudioManager.ts`)

**責務**: BGM・効果音・ボイスの再生（Howler.js）

```typescript
preload(onProgress?): Promise<void>     // 全 67 ファイルを Howl 生成
resumeContext(): void                   // 初回ユーザー操作で AudioContext.resume
playBGM(key, volume?): void             // bgm_*: 切替、se_rotate: 並走、bgm_result: 上書き
stopBGM(key?): void
stopAllBGM(): void
playSound(key, volume?): void           // SE/ボイス
changeBGM(): void                       // bgm_1 → bgm_2 → bgm_3 → bgm_4 → bgm_1
changeBGMVolume(volume): void           // ゾーン中の自動ボリューム調整
```

`se_rotate` は loop で BGM と同時再生される（仕様）。`bgm_result` は他を全部止めて流す。

### 4. InputManager (`src/game/InputManager.ts`)

**責務**: 入力ハンドリング

```typescript
setHandler(handler | null): void        // Space/Click 共通のコールバック登録
addExclude(rect: PIXI.Rectangle): void  // バックボタン領域など、無視する矩形
clearExcludes(): void
setSuppressed(b): void                  // 遷移中の一時停止
```

200ms デバウンス。canvas の DOM pointerdown を直接購読しているので、PIXI 経由のイベントとは独立して動く（バックボタン側は PIXI の `eventMode='static'` で個別ハンドリング、InputManager は rect 除外で多重発火を防ぐ）。

### 5. TitleScene (`src/game/TitleScene.ts`)

**責務**: タイトル + ルール選択

`TitleMode = 'first' | 'select_rule'` の 2 状態。`first` 中の Space/Click で `select_rule` へ。`back` で戻ってきた場合は intro voice をスキップする。

### 6. MainScene (`src/game/MainScene.ts`)

**責務**: メインゲーム + 13 状態のステートマシン

```typescript
type GameMode =
  | 'first'
  | 'ready'
  | 'rotate_3'
  | 'braking_3'
  | 'braked_3'
  | 'rotate_2'
  | 'braking_2'
  | 'braked_2'
  | 'rotate_1'
  | 'braking_1'
  | 'braked_1'
  | 'showing_mods'
  | 'showing_scores'
  | 'shown_scores'
  | 'shown_result'
```

`changeMode()` が中央 dispatcher。各 `on*()` ハンドラが遷移ロジックを実装する。`braking_*` 系は `async/await` で `RingSprites.brake()` の完了を Promise.all で待つ（後述）。

### 7. Sprites (`src/game/Sprites.ts`)

**責務**: 16 個のスプライトマネージャ

- `RingSprites`: 3 リール各 40 枚のリングデジット。回転・ブレーキ・疑似 3D 変形
- `BackgroundSprites`: 背景画像 + ループアニメ
- `KanjiSprites` / `MonSprites`: 装飾用回転アニメ
- `EffectSprites`: bullet_time / revolution / triple_seven オーバーレイ
- `LinesSprites` / `GuidesSprites` / `ModsSprites` / `AlphabetsSprites`: スコア解説 UI
- `ScoresSprites` / `ComboSprites` / `CurrentScoreSprites` / `TotalScoreSprites`: スコア表示
- `TimeSprites` / `BetTimesSprites`: ヘッダー情報
- `ResultSprites`: リザルト画面の集約表示

### 8. Rule (`src/game/rule.ts`)

**責務**: ゲームロジック（純粋関数）

PixiJS 移行で**変更なし**。フレームワーク依存なしの純粋関数群:

```typescript
shuffle(array): number[]
getReaches(eyes1, eyes2): string[]
getZoneReaches(eyes1, eyes2): string[]
calcTuples(eyes1, eyes2, eyes3): number[][]
calcMods(tuples): number[]
calcScores(tuples, mods, revolution): Score[]
calcCurrentScores(scores): number[]
addComboScore(currentScores, combo): number[]
calcTotalScore(total, currentScores): number
getNextSpeed(speed, score): number
isAchieved(rule, time, score): boolean
getTripleSevenEffect(rollbackStock, stats): TripleSevenEffect
isPinkRibbon(scores): boolean
isTripleSeven(scores): boolean
isMultiWon(scores): boolean
isAmbulance(tuples): boolean
getTime(rule, iSecond1): number
```

### 9. Rolls (`src/game/rolls.ts`)

**責務**: 役の定義（純粋データ）。PixiJS 移行で**変更なし**。

```typescript
export interface Roll {
  name: string
  desc: string
  rule: string
  f: 'multi' | 'add'
  odds: number | null
  judge: (tuple: number[], mod: number) => boolean
  calcGain: (src: number, tuple: number[], mod: number) => number
  won?: boolean
}
```

- `RollTableMulti`: 乗算系 7 種
- `RollTableMe`: 加算系 3 種
- `RollTableKabu`: カブ系 9 種

### 10. GameState (`src/game/GameState.ts`)

**責務**: 任意局面起動用のスナップショット型

```typescript
export interface GameState {
  rule: RuleType
  mode: GameMode
  elapsedTime: number; betTimes: number; totalScore: number
  speed: number; iCombo: number; iScore1000: number
  bulletTime: boolean; revolution: boolean
  zoneSeconds: number; rollbackStock: number
  reserveChangeBGM: boolean; reserveStartZone: boolean; reserveFinishZone: boolean
  rings: { ns: number[]; color: string }[]
  stats: GameStats
}

defaultState(rule): GameState
parseStateFromUrl(): GameState | null    // ?state=<base64-json>
```

`MainScene` コンストラクタに `initial?: GameState` を渡すと、`applyState()` が内部状態を復元、`restoreRingVisuals()` がリング表示を当てる。スコア表示側（tuples/mods/scores の sprite 群）は次のスピンで再構築される割り切り。

### 11. AssetLoader (`src/game/assets.ts`)

`import.meta.glob` で `src/assets/**/*.{png,ogg}` を eager 取得し、PIXI.Assets と Howl に渡す URL マップを生成する。BGM ファイル名 (`minimal_004.ogg` 等) は `BGM_FILE_TO_KEY` テーブルで `bgm_1` 等のキーに正規化する。

## データフロー

### ゲーム開始

```
main.ts: bootstrap()
  ↓
App.init(): PIXI 起動 + アセット 全ロード（進捗バー）
  ↓
App.start(): ?state= があれば MainScene、なければ TitleScene
```

### スピン

```
'first'  → onFirst()      ready ボイス 1/2/3 を 500/1700/1300/700ms で
'ready'  → onReady()      bgm_1 + se_rotate 再生開始
'rotate_3' → click/space → 'braking_3' → onBraking3() (async)
                            ↓ await ringSprites1.brake()
                            ↓ ringSprites1.stop()
                            ↓ 'braked_3'
'braked_3' → onBraked3()  opacity 調整 → 'rotate_2'
... (rotate_2/braking_2/braked_2 → rotate_1/braking_1/braked_1) ...
'braked_1' → onBraked1()  tuples計算 → zone判定 → mods表示 → scores計算
                          rollback判定 → ロールバック or showScoresAndWait
'shown_scores' → onShownScores()  isAchieved ? finishGame : 次スピン準備
```

### スコア計算

```
calcScores(tuples, mods, revolution)
  ↓
各ライン (a〜k) に対して:
  ├─ Step 1: Multi 判定（マッチ → 確定）
  ├─ Step 2: Me 判定（加算系、マッチ → 確定）
  └─ Step 3: Kabu 判定（mod 10、不一致 → ブタ）
  ↓
calcCurrentScores: [me, kabu, multi, combo] 集計
  ↓
revolution なら multi 2倍
  ↓
addComboScore: combo 倍率適用
  ↓
calcTotalScore で総スコア加算
```

## brake() の同期問題と対策

旧 Phaser 版では `RingSprites.brake()` が:

```typescript
this.scene.time.delayedCall(maxDuration, callback) // 計算上の最大時間で発火
```

を使っていたが、`maxDuration` は理論値のため tween 実完了と数 ms ズレる可能性があった。

PixiJS 版では gsap tween の完了を `Promise.all()` で待ち合わせる:

```typescript
async brake(_speed: number): Promise<void> {
  const tweens: ReturnType<typeof this.scene.tween>[] = []
  this.sprites.forEach((sprite, i) => {
    /* destY / destDy を計算 */
    if (destDy === 0) {
      // 既にスナップ位置にある場合、zero-duration tween は
      // onComplete 発火が不安定なので tween を作らず即スナップ
      this.transform(sprite)
      return
    }
    tweens.push(this.scene.tween(sprite, {
      y: destY, duration, ease: 'expo.out',
      onUpdate: () => this.transform(sprite),
    }))
  })
  if (tweens.length === 0) return
  // gsap 3 tween は thenable。.then() で待つことで Scene.trackTween が
  // 設定したクリーンアップ onComplete を上書きせずに済む
  await Promise.all(tweens.map(t => t.then()))
}
```

呼び出し側（`MainScene.onBraking3` 等）は `await ringSprites.brake()` するだけで完了同期できる。

**zero-duration tween のフリーズ問題（修正済み）**:
40 sprite が同じ初期位置・同じ速度で動いているため、ユーザーがクリックした瞬間に sprite.y が偶然 42px グリッド上にある場合は `destDy === 0` → `duration === 0` の tween が生まれる。gsap の `eventCallback('onComplete', r)` でこれを待つと、zero-duration tween では発火しないことがあり `Promise.all` が永久に解決されない（= スロット停止時のフリーズ）。対策として `destDy === 0` の sprite は tween を作らず即スナップし、残りは `tween.then()` で待つ。

## パフォーマンス

### アセット管理

- `import.meta.glob` で manifest 自動生成 → Vite が hash 付きで bundle に取込（cache-busting 自動）
- PIXI.Assets / Howl による preload を進捗報告つきで実行
- 起動時に画像 50% / 音声 50% の進捗バー表示

### レンダリング

- `Container.sortableChildren = true` で `zIndex` 制御
- `RingSprites.rotate()` は毎フレーム 3 × 40 = 120 sprite を更新（疑似 3D 変形）
- アルファブレンドは gsap の opacity tween

### メモリ管理

- `Scene.destroy()` が timer / tween / ticker callback を一括 cancel
- シーン切替時に `Container.destroy({ children: true })` で sprite 全破棄

## テスト戦略

### 単体テスト

`rule.ts` / `rolls.ts` は純粋関数なので、フレームワーク非依存で書ける:

```typescript
import { Rule } from './rule'

describe('Rule.calcScores', () => {
  it('should detect pinzoro', () => {
    const tuples = [[1, 1, 1]]
    const mods = [3]
    const scores = Rule.calcScores(tuples, mods, false)
    expect(scores[0].won).toBe(true)
  })
})
```

### 統合テスト（手動）

1. タイトル → ルール選択 → ゲーム開始
2. リール回転 → 停止 → スコア表示
3. ゾーン発動 → 効果適用
4. クリア条件達成 → リザルト表示

### URL ステート復元テスト

```js
const s = { rule: 'rule_1_2943', mode: 'rotate_3' /* ... */ }
location.search = '?state=' + btoa(JSON.stringify(s))
```

## デプロイ

```bash
npm run build    # dist/ に静的ファイル
```

- Vite の `base: '/cee-lo-rings/'` が GitHub Pages 用パスを設定
- GitHub Actions の `deploy.yml` で自動デプロイ

## トラブルシューティング

### 音が出ない

- ブラウザの autoplay ポリシー。`AudioManager.resumeContext()` は初回 pointerdown/keydown で発火する
- それでも鳴らない場合は Howler の onloaderror がコンソールに出ているか確認

### リングのタイミングがズレる / 停止時にフリーズする

- `RingSprites.brake()` で `destDy === 0` の sprite が tween を作らず即スナップしているか確認（zero-duration tween は `onComplete` が発火しないことがあり、`Promise.all` が永久 await する原因になる）
- 残りの tween は `tween.then()` で待つ（`eventCallback('onComplete', r)` だと `Scene.trackTween` のクリーンアップが上書きされる）
- `Scene.destroy()` 後のコールバックは `disposed` フラグでガードされる

### スコアが合わない

- `Rule.calcScores()` の評価順序 (Multi → Me → Kabu) を確認
- `revolution` フラグの伝播を確認

## 拡張性

### 新しいルールの追加

1. `rule.ts` の `RuleType` と `isAchieved()` に条件を追加
2. `TitleScene.ts` の `RULE_CONFIGS` にエントリ追加
3. `src/assets/image/title/` に画像追加（glob が自動で拾う）

### 新しい役の追加

1. `rolls.ts` の Roll テーブルに追加
2. `src/assets/image/score/roll_*.png` を追加

### 新しいエフェクトの追加

1. `src/assets/image/effect/` に画像追加
2. `EffectSprites` に case を追加
3. 必要なら `src/assets/sound/` に音声を追加

## ライセンスと著作権

- オリジナル: [tin-tilo-rings](https://github.com/kako-jun/tin-tilo-rings) by kako-jun
- 現フレームワーク: PixiJS 8（MIT License）
- 本実装: TypeScript 移植版
