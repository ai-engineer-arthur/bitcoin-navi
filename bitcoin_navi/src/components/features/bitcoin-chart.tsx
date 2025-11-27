'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BitcoinChartData {
  timestamp: number;
  price: number;
}

interface BitcoinChartProps {
  height?: number;
}

/**
 * Bitcoin Price Chart Component
 * Displays a 24-hour price chart using Recharts
 */
export function BitcoinChart({ height = 256 }: BitcoinChartProps) {
  const [chartData, setChartData] = useState<BitcoinChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/prices/bitcoin');
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }

        const data = await response.json();
        setChartData(data.chartData || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Chart data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
    // 30秒ごとに更新
    const interval = setInterval(fetchChartData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-primary/5 rounded-lg border border-primary/20"
        style={{ height }}
      >
        <p className="text-foreground-muted text-sm">Loading chart...</p>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-primary/5 rounded-lg border border-primary/20"
        style={{ height }}
      >
        <p className="text-foreground-muted text-sm">
          {error || 'No chart data available'}
        </p>
      </div>
    );
  }

  // Format chart data for Recharts
  const formattedData = chartData.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    price: item.price,
  }));

  return (
    <div style={{ height, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="oklch(0.82 0.06 172)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="oklch(0.82 0.06 172)"
                stopOpacity={0.05}
              />
            </linearGradient>

            {/* Glow effect for line */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <XAxis
            dataKey="time"
            stroke="oklch(0.55 0.01 240 / 0.5)"
            strokeWidth={1}
            tick={{ fill: 'oklch(0.55 0.01 240)', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            stroke="oklch(0.55 0.01 240 / 0.5)"
            strokeWidth={1}
            tick={{ fill: 'oklch(0.55 0.01 240)', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`}
            domain={['dataMin - 500', 'dataMax + 500']}
          />

          <Tooltip
            contentStyle={{
              background: 'oklch(0.25 0.05 180 / 0.95)',
              border: '1px solid oklch(0.82 0.06 172 / 0.35)',
              borderRadius: '12px',
              backdropFilter: 'blur(16px)',
              color: 'oklch(0.98 0.005 240)',
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '8px 12px',
              boxShadow: '0 0 20px oklch(0.82 0.06 172 / 0.3)',
            }}
            formatter={(value: number) => {
              return [
                `¥${value.toLocaleString('ja-JP', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`,
                'Price',
              ];
            }}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke="oklch(0.82 0.06 172)"
            strokeWidth={3}
            fill="url(#colorPrice)"
            animationDuration={1500}
            filter="url(#glow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
