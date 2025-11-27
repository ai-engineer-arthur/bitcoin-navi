import { StatCard } from '@/components/features/stat-card';
import { LatestPrices } from '@/components/features/latest-prices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Bitcoin, DollarSign, Bell } from 'lucide-react';
import { fetchBitcoinPrice } from '@/lib/bitcoin-api';

export default async function DashboardPage() {
  // ビットコイン価格を取得（日本円）
  let bitcoinPrice = null;
  try {
    bitcoinPrice = await fetchBitcoinPrice();
  } catch (error) {
    console.error('Failed to fetch Bitcoin price:', error);
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Bitcoin (BTC)"
          value={
            bitcoinPrice
              ? `¥${bitcoinPrice.jpy.toLocaleString('ja-JP')}`
              : 'Loading...'
          }
          change={
            bitcoinPrice
              ? `${bitcoinPrice.jpy_24h_change >= 0 ? '+' : ''}${bitcoinPrice.jpy_24h_change.toFixed(2)}%`
              : undefined
          }
          trend={
            bitcoinPrice && bitcoinPrice.jpy_24h_change >= 0 ? 'up' : 'down'
          }
          icon={Bitcoin}
        />

        <StatCard
          title="BigBear.ai (BBAI)"
          value="$12.34"
          change="-1.23%"
          trend="down"
          icon={DollarSign}
          note="API実装予定 (#011)"
        />

        <StatCard
          title="Active Alerts"
          value="3"
          icon={Bell}
        />

        <StatCard
          title="Total Gain"
          value="+$1,234.56"
          change="+5.67%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Price Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-strong border border-primary/20">
          <CardHeader>
            <CardTitle className="text-gradient flex items-center gap-2">
              <Bitcoin className="h-6 w-6 text-primary" />
              Bitcoin (BTC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center bg-primary/5 rounded-lg border border-primary/20 gap-4">
              <TrendingUp className="h-12 w-12 text-primary opacity-50" />
              <p className="text-foreground-muted text-center">
                価格チャートは <strong className="text-primary">#012</strong> で実装予定
                <br />
                <span className="text-xs">Recharts を使用した7日間の価格推移</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-strong border border-primary/20">
          <CardHeader>
            <CardTitle className="text-gradient flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              BigBear.ai (BBAI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center bg-primary/5 rounded-lg border border-primary/20 gap-4">
              <TrendingUp className="h-12 w-12 text-primary opacity-50" />
              <p className="text-foreground-muted text-center">
                価格チャートは <strong className="text-primary">#012</strong> で実装予定
                <br />
                <span className="text-xs">Alpha Vantage API統合後に表示</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Prices */}
      <LatestPrices />
    </div>
  );
}
