# 005: ダッシュボード UI

## 概要
メインダッシュボードの UI を実装する。価格グラフ表示エリア、統計情報、最新価格表示などを含む。

## 技術スタック
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts または Chart.js（後で実装）
- **Icons**: Lucide React

## TODO
- [x] ダッシュボードページ作成
- [x] 統計カードコンポーネント作成
- [x] グラフ表示エリア作成（プレースホルダー）
- [x] 最新価格表示コンポーネント
- [x] レスポンシブグリッドレイアウト
- [x] スケルトンローディング UI

## 実装詳細

### 1. ダッシュボードページ
`src/app/(dashboard)/dashboard/page.tsx`:
```typescript
import { StatCard } from '@/components/features/stat-card';
import { PriceChart } from '@/components/features/price-chart';
import { LatestPrices } from '@/components/features/latest-prices';
import { TrendingUp, TrendingDown, Bitcoin, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your monitored assets
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bitcoin"
          value="$45,234.56"
          change="+2.34%"
          trend="up"
          icon={Bitcoin}
        />
        <StatCard
          title="BigBear.ai"
          value="$12.34"
          change="-1.23%"
          trend="down"
          icon={DollarSign}
        />
        <StatCard
          title="Active Alerts"
          value="3"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Gain"
          value="+$1,234.56"
          change="+5.67%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Price Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceChart
          title="Bitcoin (BTC)"
          symbol="BTC"
          timeframe="24h"
        />
        <PriceChart
          title="BigBear.ai (BBAI)"
          symbol="BBAI"
          timeframe="24h"
        />
      </div>

      {/* Latest Prices Table */}
      <LatestPrices />
    </div>
  );
}
```

### 2. 統計カードコンポーネント
`src/components/features/stat-card.tsx`:
```typescript
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
}

export function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {change}
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="text-primary" size={24} />
        </div>
      </div>
    </Card>
  );
}
```

### 3. グラフ表示エリア（プレースホルダー）
`src/components/features/price-chart.tsx`:
```typescript
import { Card } from '@/components/ui/card';

interface PriceChartProps {
  title: string;
  symbol: string;
  timeframe: string;
}

export function PriceChart({ title, symbol, timeframe }: PriceChartProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <select className="bg-muted border border-border rounded px-3 py-1 text-sm">
          <option>24h</option>
          <option>7d</option>
          <option>30d</option>
          <option>1y</option>
        </select>
      </div>

      {/* Placeholder for chart */}
      <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Chart will be implemented in #012</p>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Last updated: 2 min ago</span>
        <span className="text-primary font-semibold">View Details →</span>
      </div>
    </Card>
  );
}
```

### 4. 最新価格表示
`src/components/features/latest-prices.tsx`:
```typescript
import { Card } from '@/components/ui/card';

export function LatestPrices() {
  const mockPrices = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$45,234.56', change: '+2.34%', trend: 'up' },
    { symbol: 'BBAI', name: 'BigBear.ai', price: '$12.34', change: '-1.23%', trend: 'down' },
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Latest Prices</h3>
      <div className="space-y-3">
        {mockPrices.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="font-bold text-primary">{item.symbol.slice(0, 1)}</span>
              </div>
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{item.price}</p>
              <p className={`text-sm ${
                item.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {item.change}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

### 5. スケルトンローディング
`src/components/ui/skeleton.tsx`:
```typescript
export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  );
}
```

## 完了条件
- [x] ダッシュボードページが表示される
- [x] 統計カードが表示される
- [x] グラフエリアのプレースホルダーが表示される
- [x] 最新価格が表示される
- [x] レスポンシブレイアウトが動作する
- [x] スケルトンローディングが実装されている

## 🎉 実装完了（2025-11-10）
ダッシュボードUIの実装が完了しました！

### 実装内容
- **StatCard**: 再利用可能な統計カードコンポーネント
  - アイコン、タイトル、値、変動率、トレンド表示
  - ホバーエフェクト（スケール、グロー）
  - オプショナルな注記表示
- **LatestPrices**: 最新価格表示コンポーネント
  - 監視中の資産一覧（BTC、BBAI）
  - 価格、変動率、トレンド表示
  - ホバーエフェクト
- **ダッシュボードページ**: StatCardとLatestPricesを統合
  - ビットコイン価格を実データで表示（日本円）
  - 4つの統計カード（Bitcoin、BigBear.ai、Active Alerts、Total Gain）
  - 価格チャートのプレースホルダー（#012で実装予定）
  - レスポンシブグリッドレイアウト

## 関連チケット
- 前: #004 ログイン画面 UI
- 次: #006 銘柄管理画面 UI
- 関連: #012 グラフ表示機能実装
