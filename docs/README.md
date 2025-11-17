# Bitcoin Navi - Development Tickets

このディレクトリには、Bitcoin Navi プロジェクトの開発チケットが連番で管理されています。

## 📋 チケット一覧

### 🎨 Phase 1: UI Implementation (001-008)
UI から固めていく戦略で、フロントエンドの実装を優先します。

| # | チケット | 説明 | ステータス |
|---|---------|------|----------|
| 001 | [Project Setup](./001_project_setup.md) | Next.js 15 + TypeScript + Tailwind CSS v4 のセットアップ | ✅ |
| 002 | [Darkmode UI Foundation](./002_darkmode_ui_foundation.md) | ダークモード UI デザインシステム構築 | ✅ |
| 003 | [Layout & Navigation](./003_layout_navigation.md) | レイアウトとナビゲーション実装 | ✅ |
| 004 | [Login Page UI](./004_login_page_ui.md) | ログイン画面 UI | ✅ |
| 005 | [Dashboard UI](./005_dashboard_ui.md) | ダッシュボード UI（グラフ表示エリア） | ✅ |
| 006 | [Assets Page UI](./006_assets_page_ui.md) | 銘柄管理画面 UI | ✅ |
| 007 | [Alerts Page UI](./007_alerts_page_ui.md) | アラート設定画面 UI | ⬜ |
| 008 | [Chat Page UI](./008_chat_page_ui.md) | AI チャット画面 UI | ⬜ |

### 🔐 Phase 2: Authentication & Database (009-010)
認証とデータベース連携を実装します。

| # | チケット | 説明 | ステータス |
|---|---------|------|----------|
| 009 | [Google OAuth](./009_google_oauth.md) | Google OAuth 2.0 認証実装 | ⬜ |
| 010 | [Google Sheets Integration](./010_google_sheets_integration.md) | Google スプレッドシート連携 | ⬜ |

### 📊 Phase 3: Core Features (011-015)
価格取得、グラフ表示、アラート通知などのコア機能を実装します。

| # | チケット | 説明 | ステータス |
|---|---------|------|----------|
| 011 | [Price API Implementation](./011_price_api_implementation.md) | CoinGecko & Alpha Vantage 価格取得 API | ⬜ |
| 012 | [Chart Implementation](./012_chart_implementation.md) | Recharts を使ったグラフ表示機能 | ⬜ |
| 013 | [Alert Notification](./013_alert_notification.md) | Resend を使ったメール通知機能 | ⬜ |
| 014 | [Vercel Cron Jobs](./014_vercel_cron_jobs.md) | 定期的な価格チェック自動化 | ⬜ |
| 015 | [Historical Data Loader](./015_historical_data_loader.md) | 過去データ初期ロード機能 | ⬜ |

### 🤖 Phase 4: AI Features (016-018)
Vertex AI Gemini を使った AI チャット機能を実装します。

| # | チケット | 説明 | ステータス |
|---|---------|------|----------|
| 016 | [Vertex AI Integration](./016_vertex_ai_integration.md) | Vertex AI Gemini 統合 | ⬜ |
| 017 | [Grounding Implementation](./017_grounding_implementation.md) | Google Search との統合（Grounding） | ⬜ |
| 018 | [Chat Functionality](./018_chat_functionality.md) | チャット機能完成（ストリーミング、履歴） | ⬜ |

## 🎉 完了済み追加実装

### ランディングページ UI（2025-11-09完了）
`src/app/page.tsx` にて豪華なランディングページを実装しました：
- ✅ **ヒーローセクション**: 大きなタイトル + グラデーションテキスト
- ✅ **Bitcoin Price Widget**: リアルタイム価格表示 + Recharts エリアチャート
- ✅ **Features Grid**: 4つのコア機能紹介カード（Price Tracking, Smart Alerts, AI Chat, Analytics）
- ✅ **Tech Stack Section**: 使用技術の紹介（Next.js, Supabase, Gemini AI, Vercel）
- ✅ **Stats Section**: 24/7 監視、AI、無制限アラート
- ✅ **CTA Section**: "Launch Dashboard" ボタン
- ✅ **装飾要素**: フローティングオーブ + 右側の積み重なるブラーブロック
- ✅ **Footer**: プライバシー・利用規約リンク

### API & コンポーネント（部分実装）
価格取得機能の基礎実装が完了：
- ✅ **Bitcoin Price API**: `/api/prices/bitcoin/route.ts` - CoinGecko API 連携
- ✅ **Bitcoin Price Widget**: `src/components/features/bitcoin-price-widget.tsx` - Recharts でエリアチャート表示
- 📝 **Note**: BigBear.ai 株価 API、アラート機能は今後実装予定（#011～#013）

## 🚀 開発の進め方

### 1. UI ファースト戦略
まず UI を固めてから、バックエンド機能を実装していきます。
- **利点**: 早い段階でプロダクトの見た目を確認できる
- **利点**: UI/UX の問題を早期に発見できる

### 2. チケットの進め方
各チケットには以下の情報が含まれています：

- **概要**: チケットの目的
- **技術スタック**: 使用する技術
- **TODO**: 実装するタスク一覧（`[ ]` でチェックボックス管理）
- **実装詳細**: コードサンプル付きの実装ガイド
- **完了条件**: このチケットが完了したと言える条件
- **関連チケット**: 前後のチケットや関連するチケット

### 3. TODO の管理
各チケット内の TODO は以下のように管理します：

```markdown
## TODO
- [ ] タスク1（未完了）
- [x] タスク2（完了）
- [ ] タスク3（未完了）
```

タスクが完了したら `[ ]` を `[x]` に変更してください。

### 4. 推奨順序
以下の順序で進めることを推奨します：

1. **001-008**: UI を先に完成させる
2. **009-010**: 認証とデータベースを接続
3. **011-015**: コア機能を実装
4. **016-018**: AI 機能を追加

## 📝 各チケットの使い方

### チケットを開始するとき
1. チケットファイルを開く
2. TODO リストを確認
3. 実装詳細を読んで理解
4. コードを書き始める

### タスクを完了したとき
```markdown
<!-- Before -->
- [ ] Next.js 15 プロジェクト作成

<!-- After -->
- [x] Next.js 15 プロジェクト作成
```

### チケットを完了したとき
1. すべての TODO が `[x]` になっていることを確認
2. 完了条件をすべて満たしていることを確認
3. README の該当チケットを `✅` に更新

## 🎯 開発目標

### Phase 1 完了（001-008）
- すべての画面の UI が完成
- ダークモードが実装されている
- レスポンシブ対応完了

### Phase 2 完了（009-010）
- Google OAuth でログインできる
- Google スプレッドシートにデータが保存される

### Phase 3 完了（011-015）
- 価格が自動取得される
- グラフが表示される
- アラートメールが送信される
- Cron Jobs が動作する

### Phase 4 完了（016-018）
- AI チャットが動作する
- Web 検索結果が統合される
- 引用元が表示される

## 📚 参考資料

- [CLAUDE.md](../CLAUDE.md): プロジェクト全体のガイドライン
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)

## 🤝 コントリビューション

各チケットで実装したコードは、以下の基準を満たすようにしてください：

- TypeScript strict モード対応
- ESLint エラーなし
- 主要処理に日本語コメント
- レスポンシブ対応
- アクセシビリティ対応（ARIA ラベルなど）

## ⚡ Quick Start

```bash
# 1. プロジェクトセットアップ（チケット001）
cd bitcoin_navi
npm install

# 2. 開発サーバー起動
npm run dev

# 3. ブラウザで確認
open http://localhost:3000
```

## 🎉 完了後

全 18 チケットが完了したら、Bitcoin Navi の MVP が完成です！

次のステップ：
- Phase 3: 拡張機能（Supabase 対応、銘柄追加、etc.）
- パフォーマンス最適化
- テスト追加
- ドキュメント整備

---

**Happy Coding! 🚀**
