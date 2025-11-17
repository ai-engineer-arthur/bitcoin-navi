'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Bitcoin, Activity } from 'lucide-react';

interface BitcoinData {
  currentPrice: {
    usd: number;
    jpy: number;
    usd_24h_change: number;
    jpy_24h_change: number;
  };
  chartData: Array<{
    timestamp: number;
    price: number;
  }>;
}

// カウントアップアニメーション用のカスタムフック
function useAnimatedNumber(value: number, duration: number = 1000) {
  const spring = useSpring(value, { duration });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return spring;
}

export function BitcoinPriceWidget() {
  const [data, setData] = useState<BitcoinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / rect.width;
    const y = (e.clientY - centerY) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const fetchBitcoinPrice = async () => {
    try {
      console.log('Fetching Bitcoin price from API...');
      const res = await fetch('/api/prices/bitcoin');
      console.log('API response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API error:', errorData);
        throw new Error(`API Error: ${errorData.details || errorData.error}`);
      }

      const json = await res.json();
      console.log('Bitcoin data received:', json);

      // 前回の価格を保存
      if (data) {
        setPrevPrice(data.currentPrice.jpy);
      }

      setData(json);
      setError(null);

      // 初回ロード完了後、少し待ってから表示
      if (isInitialLoad) {
        setTimeout(() => {
          setIsInitialLoad(false);
          setLoading(false);
        }, 300); // データ取得後300ms待つ
      } else {
        setLoading(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load Bitcoin price';
      setError(errorMsg);
      console.error('Fetch error:', err);
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();
    const interval = setInterval(fetchBitcoinPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // アニメーション付き価格（初回は短く、2回目以降は長め）
  const animationDuration = isInitialLoad ? 800 : 1200;
  const animatedJPY = useAnimatedNumber(data?.currentPrice.jpy || 0, animationDuration);
  const animatedUSD = useAnimatedNumber(data?.currentPrice.usd || 0, animationDuration);

  if (loading) {
    return (
      <div className="glass-strong rounded-3xl p-8 md:p-12 animate-pulse">
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-foreground-muted">Loading Bitcoin data...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-strong rounded-3xl p-8 md:p-12">
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-foreground-muted">{error}</div>
        </div>
      </div>
    );
  }

  const isPositive = data.currentPrice.jpy_24h_change >= 0;
  const priceChanged = prevPrice !== null && Math.abs(data.currentPrice.jpy - prevPrice) > 0;

  const chartData = data.chartData.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    price: item.price,
  }));

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="glass-strong rounded-3xl p-8 md:p-12 border border-primary/30 relative overflow-hidden group hover:border-primary/60 transition-all duration-500"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* クロマティックアバレーション エフェクト */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-primary/5 mix-blend-screen translate-x-[2px]" />
        <div className="absolute inset-0 bg-secondary/5 mix-blend-screen -translate-x-[2px]" />
      </div>

      {/* Background glow effect - 強化 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Animated gradient border glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-3xl" />

      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center relative"
              animate={{
                boxShadow: [
                  '0 0 20px oklch(0.82 0.06 172 / 0.4)',
                  '0 0 40px oklch(0.82 0.06 172 / 0.7)',
                  '0 0 20px oklch(0.82 0.06 172 / 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bitcoin className="h-8 w-8 text-black" />

              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <div>
              <h3 className="text-3xl font-black text-foreground flex items-center gap-2">
                Bitcoin
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Activity className="h-5 w-5 text-primary" />
                </motion.div>
              </h3>
              <p className="text-foreground-muted text-sm font-medium">BTC/JPY · Live</p>
            </div>
          </div>

          {/* 24h Change */}
          <motion.div
            className={`flex items-center gap-2 px-5 py-3 rounded-xl backdrop-blur-sm ${
              isPositive ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {isPositive ? (
              <TrendingUp className="h-6 w-6 text-green-400" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-400" />
            )}
            <span
              className={`text-xl font-black ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {data.currentPrice.jpy_24h_change.toFixed(2)}%
            </span>
          </motion.div>
        </div>

        {/* Price Display - カウントアップアニメーション */}
        <div className="mb-10">
          <motion.div
            className="text-7xl md:text-8xl font-black text-gradient mb-3 relative"
            animate={priceChanged ? {
              textShadow: [
                '0 0 20px oklch(0.82 0.06 172 / 0.4)',
                '0 0 60px oklch(0.82 0.06 172 / 0.9)',
                '0 0 20px oklch(0.82 0.06 172 / 0.4)',
              ],
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <motion.span>
              ¥{animatedJPY.get().toLocaleString('ja-JP', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </motion.span>

            {/* Chromatic aberration on text */}
            <span className="absolute inset-0 text-gradient opacity-30 blur-[1px] -translate-x-[1px]" aria-hidden>
              ¥{animatedJPY.get().toLocaleString('ja-JP', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </motion.div>

          <motion.div
            className="text-2xl text-foreground-muted font-semibold"
          >
            ${animatedUSD.get().toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </motion.div>
        </div>

        {/* Chart */}
        <div className="h-72 -mx-4 mb-6" style={{ minHeight: '288px', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={288}>
            <AreaChart data={chartData}>
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
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <XAxis
                dataKey="time"
                stroke="oklch(0.55 0.01 240 / 0.5)"
                strokeWidth={1}
                tick={{ fill: 'oklch(0.55 0.01 240)', fontSize: 13, fontWeight: 500 }}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                stroke="oklch(0.55 0.01 240 / 0.5)"
                strokeWidth={1}
                tick={{ fill: 'oklch(0.55 0.01 240)', fontSize: 13, fontWeight: 500 }}
                tickLine={false}
                tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`}
                domain={['dataMin - 500', 'dataMax + 500']}
              />

              <Tooltip
                contentStyle={{
                  background: 'oklch(0.25 0.05 180 / 0.95)',
                  border: '1px solid oklch(0.82 0.06 172 / 0.35)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(16px)',
                  color: 'oklch(0.98 0.005 240)',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  padding: '12px 16px',
                  boxShadow: '0 0 30px oklch(0.82 0.06 172 / 0.3)',
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
                strokeWidth={4}
                fill="url(#colorPrice)"
                animationDuration={1500}
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-sm font-medium">
          <span className="text-foreground-muted">Last 24 hours</span>

          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30"
              animate={{
                borderColor: ['oklch(0.82 0.06 172 / 0.3)', 'oklch(0.82 0.06 172 / 0.6)', 'oklch(0.82 0.06 172 / 0.3)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-primary font-bold text-xs">LIVE</span>
            </motion.div>

            <span className="text-foreground-muted text-xs">Updates every 30s</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
