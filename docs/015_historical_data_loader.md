# 015: 過去データ初期ロード機能

## 概要
CoinGecko の無料版では過去 365 日までのデータしか取得できないため、初期セットアップ時に過去データを一括ロードする機能を実装する。

## 技術スタック
- **API**: CoinGecko Historical Data API
- **Framework**: Next.js 15 API Routes

## TODO
- [ ] 過去データ取得 API 実装
- [ ] バッチインポート機能
- [ ] データ検証機能
- [ ] 進捗表示 UI
- [ ] エラーハンドリング
- [ ] レート制限対応

## 実装詳細

### 1. 過去データ取得関数
`src/lib/api/coingecko-history.ts`:
```typescript
interface HistoricalData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export async function getCryptoHistoricalData(
  symbol: string,
  days: number = 365
): Promise<{ timestamp: string; price_usd: number; volume: number }[]> {
  const coinId = getCoinId(symbol);

  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
    {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data: HistoricalData = await response.json();

  return data.prices.map((item, index) => ({
    timestamp: new Date(item[0]).toISOString(),
    price_usd: item[1],
    volume: data.total_volumes[index]?.[1] || 0,
  }));
}

function getCoinId(symbol: string): string {
  const mapping: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
  };
  return mapping[symbol] || symbol.toLowerCase();
}
```

### 2. バッチインポート API
`src/app/api/import/historical/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';
import { getCryptoHistoricalData } from '@/lib/api/coingecko-history';

export async function POST(request: NextRequest) {
  try {
    const { assetId, days = 365 } = await request.json();

    const db = getDatabase();
    const asset = await db.getAssetById(assetId);

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    if (asset.type !== 'crypto') {
      return NextResponse.json(
        { error: 'Historical data only available for crypto assets' },
        { status: 400 }
      );
    }

    console.log(`Importing ${days} days of data for ${asset.symbol}...`);

    // Fetch historical data
    const historicalData = await getCryptoHistoricalData(asset.symbol, days);

    // Import in batches to avoid overwhelming the database
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < historicalData.length; i += batchSize) {
      const batch = historicalData.slice(i, i + batchSize);

      await Promise.all(
        batch.map((item) => {
          // Simple USD to JPY conversion (use real rate API in production)
          const USD_TO_JPY = 150;

          return db.addPriceHistory({
            asset_id: asset.id,
            price_usd: item.price_usd,
            price_jpy: item.price_usd * USD_TO_JPY,
            volume: item.volume,
            timestamp: item.timestamp,
          });
        })
      );

      imported += batch.length;
      console.log(`Imported ${imported}/${historicalData.length} records`);
    }

    return NextResponse.json({
      success: true,
      asset: asset.symbol,
      imported,
      days,
    });
  } catch (error) {
    console.error('Historical import error:', error);
    return NextResponse.json(
      { error: 'Failed to import historical data' },
      { status: 500 }
    );
  }
}

// Increase timeout for large imports
export const maxDuration = 60; // 60 seconds
export const runtime = 'nodejs';
```

### 3. 進捗表示 UI
`src/components/features/import-historical-data.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportHistoricalDataProps {
  assetId: string;
  assetSymbol: string;
}

export function ImportHistoricalData({
  assetId,
  assetSymbol,
}: ImportHistoricalDataProps) {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleImport = async () => {
    setImporting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/import/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, days: 365 }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(`Successfully imported ${data.imported} records`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Import failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error occurred');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Import Historical Data</h3>
          <p className="text-sm text-muted-foreground">
            Load past 365 days of price data for {assetSymbol}
          </p>
        </div>

        <Button onClick={handleImport} disabled={importing || status === 'success'}>
          {importing ? (
            <>
              <div className="loading-spinner mr-2" />
              Importing...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle size={20} className="mr-2" />
              Imported
            </>
          ) : (
            <>
              <Download size={20} className="mr-2" />
              Import Data
            </>
          )}
        </Button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            status === 'success'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}
    </Card>
  );
}
```

### 4. 一括インポート管理画面
`src/app/(dashboard)/settings/page.tsx`:
```typescript
import { ImportHistoricalData } from '@/components/features/import-historical-data';
import { getDatabase } from '@/lib/db/get-db';

export default async function SettingsPage() {
  const db = getDatabase();
  const assets = await db.getAssets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage data import and system settings
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Import Historical Data</h2>
        <div className="space-y-3">
          {assets.map((asset) => (
            <ImportHistoricalData
              key={asset.id}
              assetId={asset.id}
              assetSymbol={asset.symbol}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5. データ検証
`src/lib/utils/validate-import.ts`:
```typescript
export function validateHistoricalData(data: any[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('Data is empty or invalid format');
    return { valid: false, errors };
  }

  // Check for duplicates
  const timestamps = new Set();
  for (const item of data) {
    if (timestamps.has(item.timestamp)) {
      errors.push(`Duplicate timestamp: ${item.timestamp}`);
    }
    timestamps.add(item.timestamp);

    // Validate price
    if (typeof item.price_usd !== 'number' || item.price_usd <= 0) {
      errors.push(`Invalid price at ${item.timestamp}`);
    }
  }

  // Check data is sorted chronologically
  for (let i = 1; i < data.length; i++) {
    if (new Date(data[i].timestamp) < new Date(data[i - 1].timestamp)) {
      errors.push('Data is not sorted chronologically');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 6. レート制限対応
```typescript
// Add delay between API calls
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Use with caution to avoid rate limits
export async function importMultipleAssets(assetIds: string[]) {
  for (const assetId of assetIds) {
    await importHistoricalData(assetId);
    await delay(5000); // Wait 5 seconds between imports
  }
}
```

## 完了条件
- [ ] 過去データ取得が動作する
- [ ] バッチインポートが動作する
- [ ] 進捗表示が実装されている
- [ ] データ検証が実装されている
- [ ] エラーハンドリングが実装されている
- [ ] レート制限を考慮している

## 関連チケット
- 前: #014 Vercel Cron Jobs 設定
- 次: #016 Vertex AI Gemini 統合
- 関連: #011 価格取得 API 実装
