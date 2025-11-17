# 003: レイアウトとナビゲーション実装

## 概要
アプリケーション全体で使用するレイアウトとナビゲーションを実装する。サイドバーとヘッダーを含む統一されたレイアウトを構築する。

## 技術スタック
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React (推奨)

## TODO
- [x] ルートレイアウト実装（`src/app/layout.tsx`）
- [x] サイドバーコンポーネント作成
- [x] ヘッダーコンポーネント作成
- [x] ナビゲーションリンク設定
- [x] Route Groups 設定
- [x] モバイルメニュー実装
- [x] アクティブリンクのハイライト

## 実装詳細

### 1. Route Groups 構成
```
src/app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── assets/
│   │   └── page.tsx
│   ├── alerts/
│   │   └── page.tsx
│   └── chat/
│       └── page.tsx
├── layout.tsx
└── page.tsx
```

### 2. ルートレイアウト
`src/app/layout.tsx`:
```typescript
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata = {
  title: 'Bitcoin Navi - 価格監視アプリ',
  description: 'ビットコインや米国株の価格を監視',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 3. サイドバーコンポーネント
`src/components/features/sidebar.tsx`:
```typescript
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bitcoin,
  Bell,
  MessageSquare
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Bitcoin },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Bitcoin Navi</h1>
      </div>
      <nav className="px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md mb-2 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### 4. ヘッダーコンポーネント
`src/components/features/header.tsx`:
```typescript
export function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-4">
          {/* User menu will be added later */}
          <span className="text-sm text-muted-foreground">User</span>
        </div>
      </div>
    </header>
  );
}
```

### 5. Dashboard Layout
`src/app/(dashboard)/layout.tsx`:
```typescript
import { Sidebar } from '@/components/features/sidebar';
import { Header } from '@/components/features/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 6. モバイルメニュー
レスポンシブ対応のため、モバイル用のハンバーガーメニューを実装。

## 完了条件
- [x] サイドバーが表示される
- [x] ナビゲーションリンクが動作する
- [x] アクティブなリンクがハイライトされる
- [x] モバイルでもメニューが使える
- [x] レイアウトが崩れない

## 🎉 実装完了（2025-11-10）
レイアウトとナビゲーションの実装が完了しました！

### 実装内容
- **Route Groups**: (auth) と (dashboard) を作成してルートを整理
- **Sidebar**: 未来的なデザインのナビゲーションサイドバー
  - アクティブリンクのグラデーション背景＋グロー効果
  - モバイル対応（オーバーレイ＋スライドイン）
  - Sparkles アイコンのロゴ
- **Header**: グラスモーフィズムのヘッダー
  - モバイルメニューボタン
  - 通知ベル（アニメーションバッジ付き）
  - ユーザーメニュー
- **Dashboard Layout**: Sidebar + Header + メインコンテンツエリア
  - モバイルメニューの開閉状態管理
  - レスポンシブ対応
- **ページプレースホルダー**: dashboard, assets, alerts, chat, login
  - 各ページに未来的なデザインのUIを配置
  - 今後実装する機能の説明を記載

## 関連チケット
- 前: #002 ダークモード UI 基盤構築
- 次: #004 ログイン画面 UI
