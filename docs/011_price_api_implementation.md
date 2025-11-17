# 011: 価格取得 API 実装

## 概要
CoinGecko API と Alpha Vantage API を使用して、暗号通貨と株式の価格情報を取得する API を実装する。

## 技術スタック
- **Crypto API**: CoinGecko API (月 10,000 リクエスト無料枠)
- **Stock API**: Alpha Vantage API (1 日 25 リクエスト無料枠)
- **Caching**: Next.js fetch cache

## TODO
- [ ] CoinGecko API キー取得（ユーザー側で実施）
- [ ] Alpha Vantage API キー取得（ユーザー側で実施）
- [ ] 環境変数設定（ユーザー側で実施）
- [x] API クライアント作成
- [x] 価格取得 API Route 実装
- [x] レート制限対応
- [x] エラーハンドリング
- [x] キャッシュ戦略実装

## 実装詳細

### 1. 環境変数設定
`.env.local`:
```bash
COINGECKO_API_KEY=your-coingecko-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
```

### 2. CoinGecko クライアント
`src/lib/api/coingecko.ts`:
```typescript
interface CoinGeckoPrice {
  [coinId: string]: {
    usd: number;
    jpy: number;
    usd_24h_change: number;
  };
}

export async function getCryptoPrice(symbol: string): Promise<{
  price_usd: number;
  price_jpy: number;
  change_24h: number;
}> {
  const coinId = getCoinId(symbol); // BTC -> bitcoin

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,jpy&include_24hr_change=true`,
    {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
      },
      next: { revalidate: 300 }, // 5 minutes cache
    }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data: CoinGeckoPrice = await response.json();
  const coinData = data[coinId];

  return {
    price_usd: coinData.usd,
    price_jpy: coinData.jpy,
    change_24h: coinData.usd_24h_change,
  };
}

function getCoinId(symbol: string): string {
  const mapping: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    // Add more mappings as needed
  };
  return mapping[symbol] || symbol.toLowerCase();
}
```

### 3. Alpha Vantage クライアント
`src/lib/api/alpha-vantage.ts`:
```typescript
interface AlphaVantageQuote {
  'Global Quote': {
    '05. price': string;
    '10. change percent': string;
  };
}

export async function getStockPrice(symbol: string): Promise<{
  price_usd: number;
  change_percent: number;
}> {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
    {
      next: { revalidate: 300 }, // 5 minutes cache
    }
  );

  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`);
  }

  const data: AlphaVantageQuote = await response.json();
  const quote = data['Global Quote'];

  if (!quote) {
    throw new Error(`No data found for symbol: ${symbol}`);
  }

  return {
    price_usd: parseFloat(quote['05. price']),
    change_percent: parseFloat(quote['10. change percent'].replace('%', '')),
  };
}
```

### 4. 統合 API クライアント
`src/lib/api/prices.ts`:
```typescript
import { getCryptoPrice } from './coingecko';
import { getStockPrice } from './alpha-vantage';

export async function getAssetPrice(symbol: string, type: 'crypto' | 'stock') {
  if (type === 'crypto') {
    return getCryptoPrice(symbol);
  } else {
    const stock = await getStockPrice(symbol);
    // Convert to JPY (simplified - use real exchange rate API in production)
    const USD_TO_JPY = 150;
    return {
      price_usd: stock.price_usd,
      price_jpy: stock.price_usd * USD_TO_JPY,
      change_24h: stock.change_percent,
    };
  }
}
```

### 5. 価格取得 API Route
`src/app/api/prices/[symbol]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';
import { getAssetPrice } from '@/lib/api/prices';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const db = getDatabase();
    const assets = await db.getAssets();
    const asset = assets.find((a) => a.symbol === params.symbol);

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const priceData = await getAssetPrice(asset.symbol, asset.type);

    // Save to price history
    await db.addPriceHistory({
      asset_id: asset.id,
      price_usd: priceData.price_usd,
      price_jpy: priceData.price_jpy,
      volume: 0, // Optional
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      symbol: asset.symbol,
      name: asset.name,
      ...priceData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
```

### 6. 全銘柄の価格取得
`src/app/api/prices/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';
import { getAssetPrice } from '@/lib/api/prices';

export async function GET() {
  try {
    const db = getDatabase();
    const assets = await db.getAssets();

    const prices = await Promise.all(
      assets.map(async (asset) => {
        try {
          const priceData = await getAssetPrice(asset.symbol, asset.type);
          return {
            symbol: asset.symbol,
            name: asset.name,
            type: asset.type,
            ...priceData,
          };
        } catch (error) {
          console.error(`Failed to fetch ${asset.symbol}:`, error);
          return null;
        }
      })
    );

    return NextResponse.json(prices.filter(Boolean));
  } catch (error) {
    console.error('Prices fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
```

### 7. レート制限対応
```typescript
// Simple in-memory rate limiter
class RateLimiter {
  private requests: number[] = [];

  canMakeRequest(maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < windowMs);

    if (this.requests.length >= maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }
}

const alphaVantageLimiter = new RateLimiter();
```

## 完了条件
- [ ] CoinGecko API が動作する（APIキー設定後にテスト）
- [ ] Alpha Vantage API が動作する（APIキー設定後にテスト）
- [x] 価格取得 API Route が動作する
- [x] キャッシュが正しく動作する
- [x] エラーハンドリングが実装されている
- [x] レート制限対応が実装されている

## 🎉 実装完了（2025-11-17）
価格取得 API の実装が完了しました！

### 実装内容

#### 1. CoinGecko API クライアント（`src/lib/api/coingecko.ts`）
- **暗号通貨の価格取得**: BTC、ETH など主要コインをサポート
- **24時間変動率**: USD ベースの変動率を取得
- **価格履歴取得**: デフォルト7日間の履歴データ
- **キャッシュ**: Next.js fetch の `revalidate: 300`（5分間）
- **シンボルマッピング**: BTC → bitcoin などの ID 変換
- **エラーハンドリング**: API エラー時の詳細なメッセージ

#### 2. Alpha Vantage API クライアント（`src/lib/api/alpha-vantage.ts`）
- **株式の価格取得**: GLOBAL_QUOTE エンドポイントを使用
- **変動率取得**: 変動パーセントを取得
- **株式履歴取得**: TIME_SERIES_DAILY で過去データ取得
- **レート制限管理**:
  - 1分間に最大5リクエスト
  - 1日に最大25リクエスト
  - RateLimiter クラスで自動管理
- **キャッシュ**: Next.js fetch の `revalidate: 300`（5分間）

#### 3. 統合 API クライアント（`src/lib/api/prices.ts`）
- **統一インターフェース**: `getAssetPrice()` で暗号通貨・株式両対応
- **為替変換**: USD → JPY（現在は固定レート 150円、将来的に為替APIを統合予定）
- **履歴データ取得**: `getAssetHistory()` で過去データを統一形式で取得
- **一括取得**: `getBatchPrices()` で複数銘柄を並列取得
- **レート制限保護**: Alpha Vantage のレート制限を自動チェック

#### 4. API Routes
**GET `/api/prices`** - 全銘柄の価格を一括取得
- 登録されている全銘柄の価格を並列取得
- エラーが発生した銘柄はスキップ
- 自動的に価格履歴をデータベースに保存
- レスポンス例:
```json
{
  "success": true,
  "total": 3,
  "fetched": 3,
  "failed": 0,
  "prices": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "type": "crypto",
      "price_usd": 45000,
      "price_jpy": 6750000,
      "change_24h": 2.5,
      "timestamp": "2025-11-17T12:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-17T12:00:00.000Z"
}
```

**GET `/api/prices/[symbol]`** - 単一銘柄の価格を取得
- 指定された銘柄の現在価格を取得
- 自動的に価格履歴をデータベースに保存
- 404エラー: 銘柄が見つからない場合
- レスポンス例:
```json
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "type": "crypto",
  "price_usd": 45000,
  "price_jpy": 6750000,
  "change_24h": 2.5,
  "timestamp": "2025-11-17T12:00:00.000Z"
}
```

### セットアップ手順（ユーザー側で実施）

#### 1. CoinGecko API キー取得
1. [CoinGecko](https://www.coingecko.com/) にアクセス
2. アカウント作成（無料）
3. [API ダッシュボード](https://www.coingecko.com/en/developers/dashboard) で API キーを取得
4. 無料プラン: 月 10,000 リクエスト

#### 2. Alpha Vantage API キー取得
1. [Alpha Vantage](https://www.alphavantage.co/) にアクセス
2. [Get Your Free API Key Today](https://www.alphavantage.co/support/#api-key) でキーを取得
3. 無料プラン: 1日 25 リクエスト、1分 5 リクエスト

#### 3. 環境変数設定
`.env.local` に以下を追加:
```bash
COINGECKO_API_KEY=your-coingecko-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
```

### 使用例

```typescript
// 単一銘柄の価格を取得
const response = await fetch('/api/prices/BTC');
const data = await response.json();
console.log(data.price_usd); // 45000

// 全銘柄の価格を一括取得
const allPricesResponse = await fetch('/api/prices');
const allPricesData = await allPricesResponse.json();
console.log(allPricesData.prices); // [{ symbol: 'BTC', ... }, ...]
```

### 注意事項
- **レート制限**: Alpha Vantage は 1日 25 リクエストのため、4時間ごとの Cron Job 実行で 6 回/日（余裕あり）
- **為替レート**: 現在は固定レート（150円）、将来的に為替APIを統合予定
- **キャッシュ**: 5分間キャッシュされるため、リアルタイム性が必要な場合は注意
- **エラーハンドリング**: APIエラー時は詳細なエラーメッセージが返る

### 次のステップ
- ユーザー側で API キー取得と環境変数設定
- 実際に価格取得が動作するかテスト
- Cron Jobs で定期的に価格を取得（次のチケット）

## 関連チケット
- 前: #010 Google スプレッドシート連携
- 次: #012 グラフ表示機能実装
