# 004: ログイン画面 UI

## 概要
Google OAuth を使用したログイン画面の UI を実装する。シンプルで使いやすいログインフローを提供する。

## 技術スタック
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## TODO
- [x] ログインページ作成（`src/app/(auth)/login/page.tsx`）
- [x] Google ログインボタンコンポーネント作成
- [x] ログインレイアウト作成
- [x] ローディング状態の UI
- [x] エラーメッセージ表示

## 実装詳細

### 1. Auth Layout
`src/app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

### 2. ログインページ
`src/app/(auth)/login/page.tsx`:
```typescript
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bitcoin } from 'lucide-react';

export default function LoginPage() {
  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Bitcoin size={48} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Bitcoin Navi</h1>
        <p className="text-muted-foreground">
          Sign in to monitor your crypto and stock assets
        </p>
      </div>

      <div className="space-y-4">
        <Button
          className="w-full"
          onClick={() => {
            // Google OAuth will be implemented in #009
            console.log('Google login clicked');
          }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            {/* Google Icon SVG */}
          </svg>
          Sign in with Google
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-6">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </Card>
  );
}
```

### 3. Google ログインボタン
`src/components/features/google-login-button.tsx`:
```typescript
'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Authentication logic will be added in #009
      console.log('Initiating Google login...');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <span className="loading-spinner mr-2" />
          Signing in...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            {/* Google Icon */}
          </svg>
          Sign in with Google
        </>
      )}
    </Button>
  );
}
```

### 4. ローディングスピナー
`src/components/ui/loading-spinner.tsx`:
```typescript
export function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]}`}
    />
  );
}
```

## 完了条件
- [x] ログインページが表示される
- [x] Google ログインボタンが配置されている
- [x] デザインが統一されている
- [x] レスポンシブ対応している
- [x] ローディング状態が表示される

## 🎉 実装完了（2025-11-10）
ログイン画面UIの実装が完了しました！

### 実装内容
- **Auth Layout**: 認証ページ共通のレイアウト（背景エフェクト、フッター）
- **GoogleLoginButton**: ローディング状態を管理する再利用可能なボタンコンポーネント
  - ローディングスピナー表示
  - エラーハンドリング
  - 開発モードでダッシュボードへ自動遷移
- **ログインページ**: 充実したUI
  - アニメーション付きロゴ（float + ping）
  - エラーメッセージ表示機能
  - 機能リスト（リアルタイム監視、アラート、AI分析）
  - 利用規約リンク
  - 開発用の注記

## 関連チケット
- 前: #003 レイアウトとナビゲーション実装
- 次: #005 ダッシュボード UI
- 関連: #009 Google OAuth 認証実装
