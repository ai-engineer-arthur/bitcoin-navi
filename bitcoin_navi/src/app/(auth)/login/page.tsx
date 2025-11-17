'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleLoginButton } from '@/components/features/google-login-button';
import { Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="glass-strong animate-fade-in border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardHeader className="text-center space-y-6 pb-8">
        {/* Logo with animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary animate-float">
              <Sparkles className="w-10 h-10 text-black" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-30" />
          </div>
        </div>

        {/* Title */}
        <div>
          <CardTitle className="text-4xl font-black text-gradient mb-3">
            Bitcoin Navi
          </CardTitle>
          <p className="text-foreground-muted text-lg">
            次世代の暗号通貨・株価モニタリング
          </p>
        </div>

        {/* Badge */}
        <Badge className="glass px-4 py-2 text-sm font-medium border border-primary/30 mx-auto">
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          <span className="text-gradient">Powered by AI & Web3</span>
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="glass-strong border border-accent-pink/50 rounded-xl p-4 animate-fade-in">
            <p className="text-accent-pink text-sm text-center">{error}</p>
          </div>
        )}

        {/* Google Login Button */}
        <GoogleLoginButton onError={setError} />

        {/* Features List */}
        <div className="pt-6 border-t border-border space-y-3">
          <p className="text-xs text-foreground-muted text-center mb-4 font-medium">
            ログイン後に利用できる機能
          </p>
          {[
            { icon: Zap, text: 'リアルタイム価格監視' },
            { icon: Shield, text: '価格アラート通知' },
            { icon: Globe, text: 'AI市場分析' },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm text-foreground-muted"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Terms */}
        <p className="text-xs text-center text-foreground-muted pt-4">
          ログインすることで、
          <a href="#" className="text-primary hover:underline">
            利用規約
          </a>
          と
          <a href="#" className="text-primary hover:underline">
            プライバシーポリシー
          </a>
          に同意したことになります
        </p>
      </CardContent>
    </Card>
  );
}
