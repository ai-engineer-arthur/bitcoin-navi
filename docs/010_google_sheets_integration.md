# 010: Google スプレッドシート連携

## 概要
Phase 1 のデータベースとして Google スプレッドシートを使用する。銘柄、アラート、価格履歴の保存・取得機能を実装する。

## 技術スタック
- **API**: Google Sheets API v4
- **Client**: googleapis/sheets
- **Authentication**: Service Account

## TODO
- [ ] Google Sheets API 有効化
- [ ] サービスアカウント作成
- [ ] スプレッドシート作成・共有
- [ ] googleapis パッケージインストール
- [ ] DB 抽象化レイヤー作成
- [ ] CRUD 操作実装
- [ ] 環境変数設定

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
- [ ] Google Sheets API が動作する
- [ ] CRUD 操作が正しく動作する
- [ ] DB 抽象化レイヤーが実装されている
- [ ] エラーハンドリングが実装されている
- [ ] 型定義が正しい

## 関連チケット
- 前: #009 Google OAuth 認証実装
- 次: #011 価格取得 API 実装
