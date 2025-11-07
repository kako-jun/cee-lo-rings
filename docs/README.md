# Tin! Tilo! Rings! - 開発者ドキュメント

## はじめに

このディレクトリには、Tin! Tilo! Rings!の開発者向けドキュメントが含まれています。

## ドキュメント一覧

### [GAME_SPEC.md](./GAME_SPEC.md)

ゲームの仕様書です。以下の内容を含みます：

- ゲームの基本構造
- ゲームルール（9種類）
- リング（リール）システム
- スコアリングシステム
- 特殊機能（リーチ、ゾーン、トリプルセブン）
- デバッグ・テスト方法

**対象読者**: 企画者、QAエンジニア、新規開発者

### [ARCHITECTURE.md](./ARCHITECTURE.md)

技術的なアーキテクチャドキュメントです。以下の内容を含みます：

- 技術スタック
- プロジェクト構造
- コアコンポーネントの詳細
- データフロー
- パフォーマンス最適化
- テスト戦略
- トラブルシューティング

**対象読者**: 開発者、アーキテクト

## クイックスタート

### 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで開く
# http://localhost:3000/cee-lo-rings/
```

### ビルド

```bash
# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

## ディレクトリ構造

```
cee-lo-rings/
├── docs/                # このディレクトリ
│   ├── README.md        # このファイル
│   ├── GAME_SPEC.md     # ゲーム仕様書
│   └── ARCHITECTURE.md  # アーキテクチャドキュメント
├── public/
│   └── assets/          # ゲームアセット
├── src/
│   ├── components/      # Reactコンポーネント
│   └── game/            # Phaserゲームコード
└── dist/                # ビルド成果物
```

## 開発ガイドライン

### コーディング規約

- TypeScript Strict モードを使用
- ESLintルールに従う
- Prettierでフォーマット

### コミットメッセージ

- 英語で記述
- プレフィックスを使用（feat:, fix:, docs:, refactor:, test:）

### プルリクエスト

- 機能単位で分割
- テストを含める
- ドキュメントを更新

## トラブルシューティング

### よくある問題

**Q: 音が出ない**
A: ブラウザの自動再生ポリシーにより、ユーザーインタラクション前は音声が再生されません。ゲーム開始後は正常に再生されます。

**Q: ビルドエラーが出る**
A: `node_modules`を削除して`npm install`を再実行してください。

**Q: 画像が表示されない**
A: `public/assets/`ディレクトリに必要なアセットが配置されているか確認してください。

## 貢献

バグ報告や機能要望は、GitHubのIssuesで受け付けています。

## ライセンス

オリジナル: [tin-tilo-rings](https://github.com/kako-jun/tin-tilo-rings)

## 参考リンク

- [Phaser 3 公式ドキュメント](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript公式サイト](https://www.typescriptlang.org/)
- [Vite公式サイト](https://vitejs.dev/)
