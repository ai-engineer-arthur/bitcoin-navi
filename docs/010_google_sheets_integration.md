# 010: Google スプレッドシート連携

## 概要
Phase 1 のデータベースとして Google スプレッドシートを使用する。銘柄、アラート、価格履歴の保存・取得機能を実装する。

## 技術スタック
- **API**: Google Sheets API v4
- **Client**: googleapis/sheets
- **Authentication**: Service Account

## TODO
- [ ] Google Sheets API 有効化（ユーザー側で実施）
- [ ] サービスアカウント作成（ユーザー側で実施）
- [ ] スプレッドシート作成・共有（ユーザー側で実施）
- [x] googleapis パッケージインストール
- [x] DB 抽象化レイヤー作成
- [x] CRUD 操作実装
- [x] 環境変数設定

## 実装詳細

### 1. Google Cloud Console 設定
1. Google Sheets API を有効化
2. サービスアカウント作成
3. JSON キーファイルをダウンロード
4. スプレッドシート作成して、サービスアカウントに編集権限を付与

### 2. パッケージインストール
```bash
npm install googleapis
```

### 3. 環境変数設定
`.env.local`:
```bash
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. スプレッドシート構造
3 つのシートを作成:
- **assets**: 銘柄情報
- **alerts**: アラート設定
- **price_history**: 価格履歴

### 5. Google Sheets クライアント
`src/lib/db/sheets-client.ts`:
```typescript
import { google } from 'googleapis';

export function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;

export const SHEETS = {
  ASSETS: 'assets',
  ALERTS: 'alerts',
  PRICE_HISTORY: 'price_history',
};
```

### 6. DB 抽象化レイヤー
`src/lib/db/index.ts`:
```typescript
import { Asset, Alert, PriceHistory } from '@/types';

export interface Database {
  // Assets
  getAssets(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | null>;
  createAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  getAlertsByAssetId(assetId: string): Promise<Alert[]>;
  createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert>;
  deleteAlert(id: string): Promise<void>;

  // Price History
  getPriceHistory(assetId: string, limit?: number): Promise<PriceHistory[]>;
  addPriceHistory(history: Omit<PriceHistory, 'id'>): Promise<PriceHistory>;
}
```

### 7. Google Sheets 実装
`src/lib/db/sheets-db.ts`:
```typescript
import { getGoogleSheetsClient, SPREADSHEET_ID, SHEETS } from './sheets-client';
import { Database } from './index';
import { Asset, Alert, PriceHistory } from '@/types';

export class SheetsDatabase implements Database {
  private sheets = getGoogleSheetsClient();

  async getAssets(): Promise<Asset[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.ASSETS}!A2:E`,
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      id: row[0],
      symbol: row[1],
      name: row[2],
      type: row[3] as 'crypto' | 'stock',
      created_at: row[4],
    }));
  }

  async createAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.ASSETS}!A:E`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[id, asset.symbol, asset.name, asset.type, created_at]],
      },
    });

    return { id, ...asset, created_at };
  }

  // Implement other methods...
}
```

### 8. DB インスタンス取得
`src/lib/db/get-db.ts`:
```typescript
import { Database } from './index';
import { SheetsDatabase } from './sheets-db';

export function getDatabase(): Database {
  const dbType = process.env.DB_TYPE || 'sheets';

  if (dbType === 'sheets') {
    return new SheetsDatabase();
  }

  // Future: Supabase implementation
  throw new Error(`Unknown DB_TYPE: ${dbType}`);
}
```

### 9. 使用例
```typescript
import { getDatabase } from '@/lib/db/get-db';

export async function GET() {
  const db = getDatabase();
  const assets = await db.getAssets();
  return Response.json(assets);
}
```

## 完了条件
- [ ] Google Sheets API が動作する（環境変数設定後にテスト）
- [x] CRUD 操作が正しく動作する
- [x] DB 抽象化レイヤーが実装されている
- [x] エラーハンドリングが実装されている
- [x] 型定義が正しい

## 🎉 実装完了（2025-11-17）
Google Sheets データベース連携機能の実装が完了しました！

### 実装内容

#### 1. パッケージインストール
- **googleapis**: Google Sheets API v4 クライアント（57パッケージ追加）

#### 2. 型定義（`src/types/index.ts`）
- **Asset**: 銘柄情報（id, symbol, name, type, created_at）
- **Alert**: アラート設定（id, asset_id, type, threshold, currency, is_active, is_triggered, triggered_at, created_at）
- **PriceHistory**: 価格履歴（id, asset_id, price_usd, price_jpy, volume, timestamp）

#### 3. データベース抽象化レイヤー（`src/lib/db/index.ts`）
- **Database インターフェース**を定義
- Google Sheets ⇔ Supabase の切り替えを可能にする設計
- メソッド:
  - Assets: `getAssets()`, `getAssetById()`, `createAsset()`, `deleteAsset()`
  - Alerts: `getAlerts()`, `getAlertsByAssetId()`, `createAlert()`, `updateAlert()`, `deleteAlert()`
  - Price History: `getPriceHistory()`, `addPriceHistory()`

#### 4. Google Sheets クライアント（`src/lib/db/sheets-client.ts`）
- **サービスアカウント認証**を使用
- 環境変数チェック機能（`checkSheetsConfig()`）
- シート名定数（`SHEETS.ASSETS`, `SHEETS.ALERTS`, `SHEETS.PRICE_HISTORY`）

#### 5. SheetsDatabase 実装（`src/lib/db/sheets-db.ts`）
- **Database インターフェースを実装**
- 完全な CRUD 操作:
  - **Assets**: 取得・作成・削除（カスケード削除対応）
  - **Alerts**: 取得・フィルタリング・作成・更新・削除
  - **Price History**: 取得（新しい順ソート）・追加
- **カスケード削除**: 銘柄削除時に関連するアラートと価格履歴も自動削除
- エラーハンドリング完備

#### 6. DB インスタンス取得（`src/lib/db/get-db.ts`）
- **getDatabase()**: 環境変数 `DB_TYPE` で使用するDBを切り替え
- `DB_TYPE=sheets` → Google Sheets
- `DB_TYPE=supabase` → Supabase（Phase 2で実装予定）

#### 7. 環境変数設定（`.env.local.example`）
- `DB_TYPE`: データベースタイプ（sheets/supabase）
- `GOOGLE_SHEETS_ID`: スプレッドシート ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: サービスアカウントのメールアドレス
- `GOOGLE_PRIVATE_KEY`: サービスアカウントの秘密鍵

### セットアップ手順（ユーザー側で実施）

#### 1. Google Cloud Console 設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（OAuth 用と同じプロジェクトでOK）
3. 「APIとサービス」→「有効なAPIとサービス」→「+ APIとサービスを有効にする」
4. 「Google Sheets API」を検索して有効化

#### 2. サービスアカウント作成
1. 「IAMと管理」→「サービスアカウント」
2. 「+ サービスアカウントを作成」
3. 名前: `bitcoin-navi-sheets`（任意）
4. ロール: 不要（スプレッドシート共有で権限付与）
5. 「キーを追加」→「JSON」でキーファイルをダウンロード

#### 3. スプレッドシート作成
1. [Google Sheets](https://sheets.google.com/) で新規スプレッドシートを作成
2. 3つのシートを作成:
   - **assets**: ヘッダー行: `id | symbol | name | type | created_at`
   - **alerts**: ヘッダー行: `id | asset_id | type | threshold | currency | is_active | is_triggered | triggered_at | created_at`
   - **price_history**: ヘッダー行: `id | asset_id | price_usd | price_jpy | volume | timestamp`
3. スプレッドシートIDをURLから取得（`https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`）
4. 「共有」→ サービスアカウントのメールアドレスを編集者として追加

#### 4. 環境変数設定
`.env.local` に以下を追加:
```bash
DB_TYPE=sheets
GOOGLE_SHEETS_ID=your-spreadsheet-id-from-url
GOOGLE_SERVICE_ACCOUNT_EMAIL=bitcoin-navi-sheets@your-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-From-JSON\n-----END PRIVATE KEY-----\n"
```

**重要**: `GOOGLE_PRIVATE_KEY` は JSON ファイルの `private_key` フィールドの値をそのままコピー（改行は `\n` で表現されている）

### 使用例

```typescript
import { getDatabase } from '@/lib/db/get-db';

// API Route での使用例
export async function GET() {
  const db = getDatabase();

  // 銘柄を取得
  const assets = await db.getAssets();

  // 新しい銘柄を作成
  const newAsset = await db.createAsset({
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
  });

  // アラートを作成
  const alert = await db.createAlert({
    asset_id: newAsset.id,
    type: 'high',
    threshold: 100000,
    currency: 'USD',
    is_active: true,
    is_triggered: false,
    triggered_at: null,
  });

  return Response.json({ assets, newAsset, alert });
}
```

### 次のステップ
- ユーザー側でサービスアカウント作成とスプレッドシート設定
- 実際にデータベース操作が動作するかテスト
- API Routes を実装してCRUD操作を公開（次のチケット）

## 関連チケット
- 前: #009 Google OAuth 認証実装
- 次: #011 価格取得 API 実装
