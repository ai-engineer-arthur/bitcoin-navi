# 002: ダークモード UI 基盤構築

## 概要
ダークモードを基本とした UI デザインシステムを構築する。Tailwind CSS v4 の機能を活用し、統一感のあるデザインを実現する。

## 技術スタック
- **Styling**: Tailwind CSS v4
- **Design Reference**: https://v0.app/templates/dashboard-m-o-n-k-y-b7GDYVxuoGC
- **Color Scheme**: Dark mode first

## TODO
- [x] グローバル CSS でダークモード設定
- [x] カラーパレット定義（OKLCH カラーシステム）
- [x] 基本 UI コンポーネント作成（Button, Card, Input, Badge, Loading Spinner）
- [x] レスポンシブブレークポイント設定
- [x] タイポグラフィ設定
- [x] スペーシングシステム定義
- [x] グラスモーフィズム実装
- [x] アニメーションシステム構築
- [x] Near-Future グラデーション背景実装

## 実装詳細

### 1. グローバル CSS 設定
`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 142.1 76.2% 36.3%;
    --primary-foreground: 355.7 100% 97.3%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --border: 0 0% 14.9%;
    --ring: 142.1 76.2% 36.3%;
  }
}

body {
  @apply bg-background text-foreground;
}
```

### 2. 基本 UI コンポーネント

#### Button Component
`src/components/ui/button.tsx`:
```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`button-${variant} button-${size} ${className}`}
        {...props}
      />
    );
  }
);
```

#### Card Component
`src/components/ui/card.tsx`:
```typescript
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
```

#### Input Component
`src/components/ui/input.tsx`:
```typescript
export function Input({ className = '', ...props }) {
  return (
    <input
      className={`bg-muted border border-border rounded-md px-3 py-2 text-foreground ${className}`}
      {...props}
    />
  );
}
```

### 3. カラーパレット
- **Background**: `#0A0A0A` (ダークグレー)
- **Foreground**: `#FAFAFA` (ライトグレー)
- **Primary**: `#22C55E` (グリーン - ビットコインのイメージ)
- **Muted**: `#262626` (グレー)
- **Border**: `#262626` (グレー)

## 完了条件
- [x] ダークモードが正しく動作する
- [x] 基本 UI コンポーネントが作成され、動作する
- [x] デザインリファレンスと近い見た目になっている
- [x] レスポンシブ対応できている

## 🎉 実装完了（2025-11-09）
未来的なダークモード UI デザインシステムが完成しました！
- **OKLCH カラーシステム**: メタリックシルバー×グリーンの配色
- **Near-Future グラデーション背景**: 左上から差し込む光の表現
- **グラスモーフィズム**: 透明度とブラー効果を活用
- **アニメーション**: float, fade-in, glow, pulse など多数実装
- **UI コンポーネント**: Button, Card, Input, Badge, Loading Spinner
- **レスポンシブ**: モバイルファースト対応
- **アクセシビリティ**: prefers-reduced-motion 対応

## 関連チケット
- 前: #001 Project Setup
- 次: #003 レイアウトとナビゲーション実装
