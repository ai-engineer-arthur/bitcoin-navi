# 012: グラフ表示機能実装

## 概要
Recharts を使用して、価格推移を可視化するグラフ機能を実装する。時間軸の切り替えやレスポンシブ対応を含む。

## 技術スタック
- **Charting Library**: Recharts
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4

## TODO
- [ ] Recharts インストール
- [ ] 折れ線グラフコンポーネント作成
- [ ] 時間軸切り替え機能（24h, 7d, 30d, 1y）
- [ ] データフォーマット処理
- [ ] ツールチップカスタマイズ
- [ ] レスポンシブ対応
- [ ] ローディング状態

## 実装詳細

### 1. パッケージインストール
```bash
npm install recharts
```

### 2. グラフコンポーネント
`src/components/features/price-chart.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface PriceChartProps {
  assetId: string;
  symbol: string;
  title: string;
}

type Timeframe = '24h' | '7d' | '30d' | '1y';

export function PriceChart({ assetId, symbol, title }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [timeframe, assetId]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/prices/${symbol}/history?timeframe=${timeframe}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <TimeframeSelector
          value={timeframe}
          onChange={setTimeframe}
        />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis
            dataKey="timestamp"
            stroke="#888"
            fontSize={12}
            tickFormatter={(value) => formatTimestamp(value, timeframe)}
          />
          <YAxis
            stroke="#888"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#22C55E', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="price_usd"
            stroke="#22C55E"
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
        <button
          onClick={fetchChartData}
          className="text-primary hover:underline"
        >
          Refresh
        </button>
      </div>
    </Card>
  );
}
```

### 3. 時間軸セレクター
`src/components/features/timeframe-selector.tsx`:
```typescript
interface TimeframeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  const options = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '1y', label: '1Y' },
  ];

  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            value === option.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

### 4. カスタムツールチップ
`src/components/features/custom-tooltip.tsx`:
```typescript
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm text-muted-foreground mb-2">
        {new Date(label).toLocaleString()}
      </p>
      <p className="text-lg font-bold">
        ${data.price_usd.toLocaleString()}
      </p>
      {data.price_jpy && (
        <p className="text-sm text-muted-foreground">
          ¥{data.price_jpy.toLocaleString()}
        </p>
      )}
      {data.change_24h && (
        <p className={`text-sm ${
          data.change_24h >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {data.change_24h >= 0 ? '+' : ''}
          {data.change_24h.toFixed(2)}%
        </p>
      )}
    </div>
  );
}
```

### 5. 履歴データ取得 API
`src/app/api/prices/[symbol]/history/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '24h';

    const db = getDatabase();
    const assets = await db.getAssets();
    const asset = assets.find((a) => a.symbol === params.symbol);

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const limit = getLimit(timeframe);
    const history = await db.getPriceHistory(asset.id, limit);

    return NextResponse.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

function getLimit(timeframe: string): number {
  switch (timeframe) {
    case '24h':
      return 288; // Every 5 minutes
    case '7d':
      return 168; // Every hour
    case '30d':
      return 360; // Every 2 hours
    case '1y':
      return 365; // Every day
    default:
      return 100;
  }
}
```

### 6. タイムスタンプフォーマット
`src/lib/utils/format-timestamp.ts`:
```typescript
export function formatTimestamp(timestamp: string, timeframe: string): string {
  const date = new Date(timestamp);

  switch (timeframe) {
    case '24h':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    case '7d':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case '30d':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case '1y':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
    default:
      return date.toLocaleDateString();
  }
}
```

### 7. スケルトンローディング
`src/components/features/chart-skeleton.tsx`:
```typescript
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ChartSkeleton() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-[300px] w-full" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
    </Card>
  );
}
```

## 完了条件
- [ ] グラフが正しく表示される
- [ ] 時間軸の切り替えが動作する
- [ ] ツールチップが表示される
- [ ] レスポンシブ対応している
- [ ] ローディング状態が表示される
- [ ] データが正しくフォーマットされている

## 関連チケット
- 前: #011 価格取得 API 実装
- 次: #013 アラート通知機能実装
- 関連: #005 ダッシュボード UI
