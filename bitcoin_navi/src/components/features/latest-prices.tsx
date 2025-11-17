import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin, TrendingUp, TrendingDown } from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  price: string;
  change: string;
  trend: 'up' | 'down';
  currency: string;
}

// ダミーデータ（後で実際のAPIから取得）
const mockAssets: Asset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '¥16,330,347',
    change: '+1.42%',
    trend: 'up',
    currency: 'JPY',
  },
  {
    symbol: 'BBAI',
    name: 'BigBear.ai',
    price: '$12.34',
    change: '-1.23%',
    trend: 'down',
    currency: 'USD',
  },
];

export function LatestPrices() {
  return (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="text-gradient flex items-center gap-2">
          <Bitcoin className="h-6 w-6 text-primary" />
          Latest Prices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAssets.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all duration-200 group border border-transparent hover:border-primary/30"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
                  <span className="font-bold text-black text-lg">
                    {asset.symbol.slice(0, 2)}
                  </span>
                </div>

                {/* Name & Symbol */}
                <div>
                  <p className="font-semibold text-foreground group-hover:text-gradient transition-colors">
                    {asset.name}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {asset.symbol} · {asset.currency}
                  </p>
                </div>
              </div>

              {/* Price & Change */}
              <div className="text-right">
                <p className="font-bold text-lg text-gradient">{asset.price}</p>
                <div
                  className={`flex items-center gap-1 justify-end text-sm ${
                    asset.trend === 'up' ? 'text-primary' : 'text-accent-pink'
                  }`}
                >
                  {asset.trend === 'up' ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  <span className="font-semibold">{asset.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-foreground-muted text-center">
            💡 価格は30秒ごとに自動更新されます（API統合後）
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
