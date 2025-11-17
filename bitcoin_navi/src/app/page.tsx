import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BitcoinPriceWidget } from "@/components/features/bitcoin-price-widget";
import {
  Bitcoin,
  TrendingUp,
  Bell,
  MessageSquare,
  Sparkles,
  LineChart,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Floating orbs for extra visual flair - 控えめに */}
      <div className="fixed top-20 left-10 w-80 h-80 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-gradient-radial from-secondary/8 to-transparent rounded-full blur-3xl animate-float delay-200 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent-purple/5 to-transparent rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Decorative blurred blocks - 右側の装飾（画面下部右から左上に積み重なる） */}
      {/* 一番下 - 画面下部の右側 */}
      <div
        className="fixed bottom-[4%] right-[6%] w-52 h-44 bg-gradient-to-br from-primary/62 to-secondary/36 rounded-3xl border border-primary/42 pointer-events-none animate-float delay-100 backdrop-blur-sm"
        style={{
          transform: "rotate(-18deg)",
          filter: "blur(13px)",
          opacity: 0.72,
          zIndex: 1,
        }}
      />
      {/* 真ん中 - 少し上で少し左 */}
      <div
        className="fixed bottom-[18%] right-[3%] w-48 h-48 bg-gradient-to-br from-secondary/58 to-primary/32 rounded-2xl border border-secondary/38 pointer-events-none animate-float delay-300 backdrop-blur-sm"
        style={{
          transform: "rotate(8deg)",
          filter: "blur(12px)",
          opacity: 0.74,
          zIndex: 2,
        }}
      />
      {/* 一番上 - もっと上でもっと左 */}
      <div
        className="fixed bottom-[32%] right-[1%] w-44 h-46 bg-gradient-to-br from-primary/60 to-primary-light/34 rounded-3xl border border-primary/40 pointer-events-none animate-float delay-500 backdrop-blur-sm"
        style={{
          transform: "rotate(14deg)",
          filter: "blur(14px)",
          opacity: 0.7,
          zIndex: 3,
        }}
      />

      {/* Hero Section - シンプル化 */}
      <section className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <Badge className="glass px-6 py-2 text-sm font-medium border border-primary/30">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="text-gradient">
                Near-Future Monitoring Platform
              </span>
            </Badge>
          </div>

          {/* Hero Title with enhanced styling */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 animate-fade-in delay-100 leading-none">
            <span className="text-gradient glow-text inline-block hover:scale-105 transition-transform duration-300">
              Bitcoin Navi
            </span>
          </h1>

          {/* Subtitle with improved typography */}
          <p className="text-xl md:text-3xl text-foreground-secondary/90 mb-16 max-w-3xl mx-auto animate-fade-in delay-200 leading-relaxed font-light">
            次世代の暗号通貨・株価モニタリングダッシュボード
          </p>
        </div>
      </section>

      {/* Bitcoin Price Widget - 最上部に配置 */}
      <section className="container mx-auto px-4 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <BitcoinPriceWidget />
        </div>
      </section>

      {/* Features Grid with enhanced cards */}
      <section className="container mx-auto px-4 py-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Core Features</span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
            最先端のテクノロジーで、あなたの投資をサポート
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: TrendingUp,
              title: "Price Tracking",
              description:
                "リアルタイムで暗号通貨・株価を追跡。美しいグラフで可視化します。",
              gradient: "from-primary to-secondary",
              glow: "glow-primary",
            },
            {
              icon: Bell,
              title: "Smart Alerts",
              description: "価格アラートを設定して、重要な変動を見逃しません。",
              gradient: "from-secondary to-primary-dark",
              glow: "glow-secondary",
            },
            {
              icon: MessageSquare,
              title: "AI Chat",
              description: "Gemini AI が市場分析をサポート。Web 検索と統合。",
              gradient: "from-accent-purple to-accent-pink",
              glow: "glow-purple",
            },
            {
              icon: LineChart,
              title: "Analytics",
              description: "高度な分析ツールで、トレンドを先読みします。",
              gradient: "from-accent-orange to-accent-pink",
              glow: "hover:shadow-orange-500/50",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass-strong rounded-2xl p-6 group hover:scale-105 transition-all duration-300 hover:border-primary/50 border border-transparent animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:${feature.glow} group-hover:rotate-6 transition-all duration-300`}
              >
                <feature.icon className="h-7 w-7 text-black" />
              </div>

              <h3 className="text-xl font-bold mb-3 text-foreground">
                {feature.title}
              </h3>

              <p className="text-foreground-muted leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass-strong rounded-3xl p-12 md:p-16 text-center">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">
                Powered by Cutting-Edge Tech
              </span>
            </h2>
            <p className="text-foreground-muted text-lg">
              最新のテクノロジースタックで構築
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: "Next.js 15", desc: "App Router" },
              { icon: Shield, label: "Supabase", desc: "Database" },
              { icon: Sparkles, label: "Gemini AI", desc: "Analysis" },
              { icon: Globe, label: "Vercel", desc: "Hosting" },
            ].map((tech, i) => (
              <div
                key={i}
                className="glass rounded-xl p-6 hover:bg-primary/5 transition-all duration-300 hover:scale-105 group"
              >
                <tech.icon className="h-10 w-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <div className="font-bold text-lg mb-1">{tech.label}</div>
                <div className="text-sm text-foreground-muted">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with enhanced design */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "⚡",
              label: "リアルタイム監視",
              value: "24/7",
              desc: "途切れることのない価格追跡",
            },
            {
              icon: "🤖",
              label: "Powered by Gemini",
              value: "AI",
              desc: "高度な市場分析を提供",
            },
            {
              icon: "🔔",
              label: "アラート設定",
              value: "∞",
              desc: "無制限のアラート管理",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-strong rounded-2xl p-8 text-center group hover:scale-105 transition-all duration-300 hover:border-primary/50 border border-transparent"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-6xl font-black text-gradient mb-3 group-hover:glow-text transition-all">
                {stat.value}
              </div>
              <div className="text-xl font-semibold mb-2">{stat.label}</div>
              <div className="text-foreground-muted text-sm">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="glass-strong rounded-3xl p-16 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-gradient">Ready to Start?</span>
            </h2>

            <p className="text-xl md:text-2xl text-foreground-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
              今すぐ Bitcoin Navi で、あなたの投資を次のレベルへ
            </p>

            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary-dark text-black font-bold px-12 py-7 text-xl rounded-2xl hover:shadow-2xl hover:shadow-primary/60 transition-all duration-300 hover:scale-110 animate-glow"
            >
              <span className="relative z-10 flex items-center">
                <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                Launch Dashboard
                <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>

            <p className="mt-8 text-foreground-muted text-sm">
              無料で始める · クレジットカード不要 · 即座にアクセス
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-foreground-muted text-sm">
            © 2025 Bitcoin Navi. Powered by AI & Web3.
          </div>

          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-foreground-muted hover:text-primary transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-foreground-muted hover:text-primary transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-foreground-muted hover:text-primary transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
