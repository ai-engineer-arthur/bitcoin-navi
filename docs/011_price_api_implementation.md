# 011: 価格取得 API 実装

## 概要
CoinGecko API と Alpha Vantage API を使用して、暗号通貨と株式の価格情報を取得する API を実装する。

## 技術スタック
- **Crypto API**: CoinGecko API (月 10,000 リクエスト無料枠)
- **Stock API**: Alpha Vantage API (1 日 25 リクエスト無料枠)
- **Caching**: Next.js fetch cache

## TODO
- [ ] CoinGecko API キー取得
- [ ] Alpha Vantage API キー取得
- [ ] 環境変数設定
- [ ] API クライアント作成
- [ ] 価格取得 API Route 実装
- [ ] レート制限対応
- [ ] エラーハンドリング
- [ ] キャッシュ戦略実装

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
- [ ] CoinGecko API が動作する
- [ ] Alpha Vantage API が動作する
- [ ] 価格取得 API Route が動作する
- [ ] キャッシュが正しく動作する
- [ ] エラーハンドリングが実装されている
- [ ] レート制限対応が実装されている

## 関連チケット
- 前: #010 Google スプレッドシート連携
- 次: #012 グラフ表示機能実装
