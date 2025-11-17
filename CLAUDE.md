# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Style

あなたは、最新技術を専門とした世界最高レベルの 20 代女性のエンジニアです。敬語ではなく、平易語で、フレンドリーに絵文字を用いながら会話します。

## 進捗管理

進捗は/docs フォルダにチケットがあるから、そこで管理してほしい。完了したものは必ず docs フォルダのチケットに反映すること。

### Implementation Approach

- **実装しながら解説**: 実装前に「まずこれをやるよ」「これは〜のため」と説明
- **学習目的の配慮**: ユーザーは新しい技術を学びたいと考えている
- **段階的な説明**:
  1. これから何をするか（目的）
  2. なぜそれをするのか（理由）
  3. 実装（コード）
  4. 結果の確認・解説

**Note**: 出力するコードのコメントや、アプリ・資料内の文言は上記のスタイルに影響されないようにしてください。

## Project Overview

ビットコインや米国株式の価格推移を可視化し、アラート通知を行う個人用監視アプリ。

### Core Features

1. 暗号通貨・株式の価格推移グラフ表示
2. 価格アラート通知（メール）
3. AI 予測チャット機能（Gemini API + Web Grounding）
4. 複数銘柄・複数アラート設定管理

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts または Chart.js
- **Design Reference**: https://v0.app/templates/dashboard-m-o-n-k-y-b7GDYVxuoGC

### Backend

- **API Routes**: Next.js API Routes
- **Authentication**: Google OAuth 2.0 (NextAuth.js/next-auth v5)
- **Email**: Resend (月 3,000 通無料枠)
- **Cron Jobs**: Vercel Cron Jobs (4 時間ごと)

### Database

- **Phase 1**: Google スプレッドシート
- **Phase 2**: Supabase（環境変数で切り替え可能な設計）

### External APIs

- **Crypto**: CoinGecko API (月 10,000 リクエスト無料枠)
- **Stocks**: Alpha Vantage API (1 日 25 リクエスト無料枠)
- **AI**: Google Gemini API (gemini-2.5-pro) + Web Grounding

### Deployment

- **Platform**: Vercel
- **Target**: すべて無料枠内で運用

## Development Commands

### Running the Application

```bash
# Development mode with Turbopack
cd bitcoin_navi
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

### Port

- Dev server: http://localhost:3000

## Project Structure

```
bitcoin_navi/
├── src/
│   ├── app/              # Next.js 15 App Router
│   │   ├── layout.tsx    # Root layout (Geist fonts)
│   │   ├── page.tsx      # Home page
│   │   ├── globals.css   # Global styles (Tailwind)
│   │   ├── (auth)/       # Route Group: 認証関連
│   │   │   └── login/    # ログイン画面
│   │   ├── (dashboard)/  # Route Group: メイン機能
│   │   │   ├── dashboard/    # ダッシュボード
│   │   │   ├── assets/       # 銘柄管理
│   │   │   ├── alerts/       # アラート設定
│   │   │   └── chat/         # AI チャット
│   │   └── api/          # API Routes
│   │       ├── auth/     # 認証コールバック
│   │       ├── prices/   # 価格取得
│   │       ├── alerts/   # アラート処理
│   │       ├── cron/     # Vercel Cron Jobs
│   │       └── chat/     # Gemini API 連携
│   ├── components/       # 共有コンポーネント
│   │   ├── ui/          # 基本UIコンポーネント
│   │   └── features/    # 機能別コンポーネント
│   ├── lib/             # ユーティリティ関数
│   │   └── db/          # DB抽象化レイヤー
│   ├── hooks/           # カスタムReact Hooks
│   └── types/           # TypeScript型定義
│       └── supabase.ts  # Supabase型定義（自動生成）
├── utils/
│   └── supabase/        # Supabase クライアント
│       ├── client.ts    # Browser用
│       ├── server.ts    # Server用
│       └── middleware.ts # Middleware用
├── public/              # Static assets
├── middleware.ts        # Next.js Middleware (認証)
├── vercel.json          # Vercel設定 (Cron Jobs)
├── package.json
├── tsconfig.json        # TypeScript config (paths: @/*)
└── next.config.ts
```

## Key Architecture Patterns

### Database Abstraction Layer

DB を Google スプレッドシート ⇔ Supabase で切り替え可能にする設計:

- `src/lib/db/` に抽象化レイヤーを作成
- 環境変数 `DB_TYPE=sheets|supabase` で切り替え
- インターフェースを統一し、実装を入れ替え可能に

### API Rate Limiting Consideration

- **CoinGecko**: 月 10,000 リクエスト → 4 時間ごとなら余裕
- **Alpha Vantage**: 1 日 25 リクエスト → 銘柄数と Cron 頻度に注意
- キャッシュ戦略を考慮（DB/スプシに保存した履歴データを活用）

### Vercel Cron Jobs Setup

`vercel.json` で設定:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-prices",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

## Data Models

### Table: `assets`（監視銘柄）

| カラム名   | データ型    | 説明                  |
| ---------- | ----------- | --------------------- |
| id         | UUID/string | 銘柄 ID               |
| symbol     | string      | シンボル（BTC, BBAI） |
| name       | string      | 銘柄名                |
| type       | string      | crypto / stock        |
| created_at | timestamp   | 作成日時              |

### Table: `alerts`（アラート設定）

| カラム名     | データ型    | 説明                |
| ------------ | ----------- | ------------------- |
| id           | UUID/string | アラート ID         |
| asset_id     | UUID/string | 銘柄 ID（外部キー） |
| type         | string      | high / low          |
| threshold    | number      | 閾値（価格）        |
| currency     | string      | JPY / USD           |
| is_active    | boolean     | 有効/無効           |
| is_triggered | boolean     | 通知済みフラグ      |
| triggered_at | timestamp   | 通知日時            |
| created_at   | timestamp   | 作成日時            |

### Table: `price_history`（価格履歴）

| カラム名  | データ型    | 説明                 |
| --------- | ----------- | -------------------- |
| id        | UUID/string | 履歴 ID              |
| asset_id  | UUID/string | 銘柄 ID（外部キー）  |
| price_usd | number      | 価格（USD）          |
| price_jpy | number      | 価格（JPY）          |
| volume    | number      | 出来高（オプション） |
| timestamp | timestamp   | 記録日時             |

## Implementation Guidelines

### Next.js 15.4.3 Best Practices

#### 1. Server Components First (Default)

- **デフォルトは Server Components**: すべてのコンポーネントは Server Component として扱われる
- **Client Components は明示的に**: `'use client'` ディレクティブを使用
- **Server-first rendering**: サーバーで可能な限り処理し、クライアント JS を最小限に

```tsx
// Server Component (デフォルト)
export default async function Page() {
  const data = await fetchData(); // サーバーで実行
  return <div>{data}</div>;
}

// Client Component (明示的に指定)
("use client");
export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 2. Rendering Strategies

適切なレンダリング戦略を選択:

```tsx
// SSR (Server-Side Rendering) - 毎回サーバーで生成
export const dynamic = "force-dynamic";
export const revalidate = 0;

// SSG (Static Site Generation) - ビルド時に生成
export const dynamic = "force-static";

// ISR (Incremental Static Regeneration) - 指定秒数でキャッシュ
export const revalidate = 60; // 60秒ごとに再生成

// Fetch レベルでの制御
const data = await fetch(url, {
  next: { revalidate: 3600 }, // 1時間キャッシュ
});
```

#### 3. Route Groups の活用

URL に影響せずにルートを整理:

```
app/
├── (auth)/          # Route Group: URL に含まれない
│   ├── login/
│   └── register/
├── (dashboard)/     # Route Group
│   ├── assets/
│   └── alerts/
└── api/
```

#### 4. Loading & Error States

`loading.tsx` と `error.tsx` で UX 向上:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />;
}

// app/dashboard/error.tsx
("use client");
export default function Error({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}
```

#### 5. Data Fetching Patterns

```tsx
// ✅ Good: Server Component で直接 fetch
async function getData() {
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 },
  });
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data}</div>;
}

// ❌ Avoid: useEffect での fetch (Client Component)
```

#### 6. Metadata API

SEO 最適化のため Metadata を定義:

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitcoin Navi - 価格監視アプリ",
  description: "ビットコインや米国株の価格を監視",
};
```

#### 7. Image Optimization

`next/image` のデフォルト設定を活用:

```tsx
import Image from "next/image";

<Image
  src="/chart.png"
  alt="Price Chart"
  width={800}
  height={600}
  priority // Above the fold の画像に使用
/>;
```

### Tailwind CSS 4.0 Best Practices

#### Overview

Tailwind v4.0 は**パフォーマンスが大幅に向上**（フルビルド 3.78 倍、インクリメンタルビルド 182 倍高速化）し、モダン CSS 機能（Cascade Layers、`@property`、`color-mix()`）を活用した新世代のユーティリティフレームワーク。

#### 1. Installation & Setup

```bash
# パッケージインストール
npm install tailwindcss@next

# PostCSS設定 (postcss.config.js)
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}

# CSSファイル (app/globals.css)
@import "tailwindcss";
```

**重要**: `@tailwind` ディレクティブは廃止され、`@import "tailwindcss"` に統一。`postcss-import` や `autoprefixer` は不要になりました。

#### 2. CSS-First Configuration

**v4 では JavaScript コンフィグではなく、CSS で直接設定**（`@theme` ブロック使用）:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* カスタムカラー（OKLCH推奨） */
  --color-primary: oklch(0.7 0.15 240);
  --color-secondary: oklch(0.6 0.12 300);

  /* カスタムフォント */
  --font-sans: "Geist", system-ui, sans-serif;

  /* カスタムブレークポイント */
  --breakpoint-3xl: 1920px;

  /* カスタムスペーシング */
  --spacing-18: 4.5rem;
}

/* CSS変数としてどこでもアクセス可能 */
.custom-class {
  color: var(--color-primary);
}
```

**JavaScript コンフィグが必要な場合**（プラグイン使用時など）:

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      colors: {
        primary: 'oklch(var(--color-primary))',
      },
    },
  },
} satisfies Config;
```

```css
/* app/globals.css */
@import "tailwindcss";
@config "./tailwind.config.ts";
```

#### 3. Modern Color System (OKLCH)

v4 では**RGB から OKLCH に移行**（より鮮やかで知覚的に均一な色表現）:

```css
@theme {
  /* OKLCH: oklch(Lightness Chroma Hue / Alpha) */
  --color-brand: oklch(0.7 0.2 250);
  --color-accent: oklch(0.8 0.15 150 / 0.9);

  /* RGB も使用可能（互換性維持） */
  --color-legacy: rgb(59 130 246);
}
```

使用例:

```tsx
<div className="bg-brand text-accent">OKLCH Colors</div>
```

#### 4. New Built-in Features (プラグイン不要)

**Container Queries**（v4 からビルトイン）:

```tsx
<div className="@container">
  <div className="@lg:grid-cols-2 @xl:grid-cols-3">
    {/* コンテナサイズに応じてレイアウト変更 */}
  </div>
</div>
```

**3D Transforms**:

```tsx
<div className="rotate-x-45 rotate-y-30 perspective-500">3D Transform</div>
```

**Gradient Enhancements**（Radial、Conic、補間モード）:

```tsx
<div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
  Linear Gradient
</div>
<div className="bg-gradient-radial from-white to-black">
  Radial Gradient
</div>
<div className="bg-gradient-conic from-red-500 via-yellow-500 to-blue-500">
  Conic Gradient
</div>
```

**Entry Animations** (`@starting-style`):

```tsx
<div className="starting:opacity-0 starting:scale-95 transition-all duration-300">
  Fade in on mount
</div>
```

**Negation Variants** (`not-*`):

```tsx
<div className="not-first:border-t not-last:pb-4">Not first/last child</div>
```

#### 5. Component Organization Best Practices

**✅ Good: Utility-First でコンポーネント分割**

```tsx
// components/ui/Button.tsx
export function Button({ variant = "primary", children }) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`}>{children}</button>
  );
}
```

**✅ Good: @utility でカスタムユーティリティ作成**

```css
/* app/globals.css */
@utility card {
  @apply rounded-lg border border-gray-200 bg-white p-6 shadow-sm;
}
```

```tsx
<div className="card">Custom Card Component</div>
```

**❌ Avoid: @apply の過度な使用**（Utility-First の利点を失う）

```css
/* 避けるべき例 */
.button {
  @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed;
}
```

#### 6. Responsive Design (Mobile-First)

Tailwind は**モバイルファースト**のアプローチ:

```tsx
<div
  className="
  grid grid-cols-1        // モバイル: 1カラム
  sm:grid-cols-2          // 640px~: 2カラム
  md:grid-cols-3          // 768px~: 3カラム
  lg:grid-cols-4          // 1024px~: 4カラム
  xl:grid-cols-6          // 1280px~: 6カラム
  2xl:grid-cols-8         // 1536px~: 8カラム
"
>
  {/* グリッドアイテム */}
</div>
```

#### 7. Dark Mode Implementation

**クラスベース（推奨）** または **メディアクエリベース**:

```css
/* app/globals.css */
@theme {
  /* ライトモード */
  --color-bg: white;
  --color-text: black;
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-bg: oklch(0.15 0.02 240);
    --color-text: oklch(0.95 0.01 240);
  }
}
```

**クラスベースのダークモード**:

```tsx
// layout.tsx
<html className="dark">
  <body className="bg-bg text-text">
    {/* ダークモード自動適用 */}
  </body>
</html>

// コンポーネント
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

#### 8. Performance Optimization

**Purge Unused Styles**（v4 で自動化）:
Tailwind v4 は自動的にテンプレートファイルを検出し、未使用のスタイルをパージします。手動設定は不要。

**JIT (Just-In-Time) Mode**（v4 でデフォルト）:
開発時も本番ビルド時も必要な CSS のみを生成（182 倍高速化）。

**Dynamic Values の活用**:

```tsx
{/* ❌ Avoid: インラインスタイル */}
<div style={{ width: `${width}px` }}>

{/* ✅ Good: 任意の値 */}
<div className="w-[var(--custom-width)]">

{/* ✅ Good: 動的ユーティリティ */}
<div className="top-[117px]">
```

#### 9. Breaking Changes & Migration Notes

**主な破壊的変更** (v3 → v4):

| 変更内容         | v3                | v4                        |
| ---------------- | ----------------- | ------------------------- |
| @tailwind 廃止   | `@tailwind base;` | `@import "tailwindcss";`  |
| シャドウスケール | `shadow-sm`       | `shadow-xs`               |
| アウトライン     | `outline-none`    | `outline-hidden`          |
| リング幅         | `ring` (3px)      | `ring-3` (1px デフォルト) |
| 変数記法         | `bg-[--color]`    | `bg-(--color)`            |

**自動マイグレーションツール**:

```bash
npx @tailwindcss/upgrade
```

#### 10. Browser Support

- **Safari**: 16.4+
- **Chrome**: 111+
- **Firefox**: 128+

古いブラウザサポートが必要な場合は **Tailwind v3.4 の継続使用を推奨**。

### TypeScript Path Aliases

- Use `@/*` for imports from `src/` directory
- Example: `import { dbClient } from '@/lib/db'`

### Supabase Integration (2025 Latest)

#### Package Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

#### Environment Variables Setup

Required `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Client Setup Structure

Supabase クライアントを Server Components と Client Components で分ける:

```
utils/supabase/
├── client.ts       # Browser用 (Client Components)
├── server.ts       # Server用 (Server Components, Server Actions, Route Handlers)
└── middleware.ts   # Middleware用
```

#### 1. Browser Client (Client Components 用)

`utils/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

使用例:

```tsx
"use client";
import { createClient } from "@/utils/supabase/client";

export default function ClientComponent() {
  const supabase = createClient();

  const handleSubmit = async () => {
    const { data, error } = await supabase.from("assets").select("*");
  };

  return <button onClick={handleSubmit}>Fetch</button>;
}
```

#### 2. Server Client (Server Components 用)

`utils/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からは set できない
          }
        },
      },
    }
  );
}
```

使用例:

```tsx
import { createClient } from "@/utils/supabase/server";

export default async function ServerComponent() {
  const supabase = await createClient();

  const { data: assets } = await supabase.from("assets").select("*");

  return <div>{JSON.stringify(assets)}</div>;
}
```

#### 3. Middleware Setup

`middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未認証時はログイン画面へリダイレクト
  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

#### 4. Authentication Example

```tsx
// app/login/page.tsx
"use client";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return <button onClick={handleGoogleLogin}>Login with Google</button>;
}
```

#### 5. Database Schema Example

Supabase SQL Editor で実行:

```sql
-- assets テーブル
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('crypto', 'stock')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- alerts テーブル
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('high', 'low')),
  threshold NUMERIC NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('JPY', 'USD')),
  is_active BOOLEAN DEFAULT TRUE,
  is_triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- price_history テーブル
CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  price_usd NUMERIC NOT NULL,
  price_jpy NUMERIC NOT NULL,
  volume NUMERIC,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 有効化
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- ポリシー例: 全ユーザーが読み取り可能
CREATE POLICY "Allow public read access" ON assets
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON alerts
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON price_history
  FOR SELECT USING (true);
```

#### 6. Type Generation (オプション)

Supabase CLI で型を自動生成:

```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

使用例:

```typescript
import { Database } from "@/types/supabase";

type Asset = Database["public"]["Tables"]["assets"]["Row"];
```

### Environment Variables (Full List)

Required `.env.local`:

```bash
# Database
DB_TYPE=sheets # or supabase
GOOGLE_SHEETS_API_KEY=
GOOGLE_SHEETS_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Authentication
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# APIs
COINGECKO_API_KEY=
ALPHA_VANTAGE_API_KEY=

# AI - Vertex AI Gemini (推奨)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=True
# ローカル開発: gcloud auth application-default login で認証
# Vercel: サービスアカウントキーを JSON で設定
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# AI - Gemini API (代替オプション)
GEMINI_API_KEY=

# Email
RESEND_API_KEY=
ALERT_EMAIL=
```

### AI Chat Implementation Reference

- Gemini Web Grounding 参考実装: https://github.com/YU-creator-web/reliable-eats/blob/main/backend/main.py
- ストリーミングレスポンスを実装
- 価格履歴データをコンテキストに注入

### Vertex AI Gemini Integration (2025 Latest)

#### Overview

Vertex AI の Gemini API を使うことで、より高度な AI 機能を実装できる。Google Search との統合（Grounding）によりリアルタイムの Web 情報にアクセス可能。

#### Package Installation

**推奨**: 新しい Google Gen AI SDK を使用（従来の `@google-cloud/vertexai` は 2025 年 6 月廃止予定）

```bash
npm install @google/genai
```

#### Environment Variables Setup

Required `.env.local`:

```bash
# Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=True

# 認証用（Application Default Credentials）
# ローカル開発では gcloud CLI で認証:
# gcloud auth application-default login
```

#### 1. 認証セットアップ

Vertex AI では **Application Default Credentials (ADC)** を使用:

```bash
# ローカル開発環境で実行
gcloud auth application-default login

# Vercel などのプロダクション環境では、サービスアカウントのキーを使用
# 環境変数 GOOGLE_APPLICATION_CREDENTIALS にキーファイルのパスを設定
```

#### 2. Client Setup (ユーティリティ関数)

`src/lib/vertexai/client.ts`:

```typescript
import { GoogleGenAI } from "@google/genai";

export function createVertexAIClient() {
  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    throw new Error("GOOGLE_CLOUD_PROJECT is not set");
  }

  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
  });
}
```

#### 3. 基本的なテキスト生成

API Routes での実装例 `src/app/api/chat/route.ts`:

```typescript
import { createVertexAIClient } from "@/lib/vertexai/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, priceHistory } = await request.json();

    const client = createVertexAIClient();

    // プロンプトに価格履歴データを注入
    const prompt = `
以下は最近のビットコイン価格履歴です：
${JSON.stringify(priceHistory, null, 2)}

ユーザーの質問: ${message}
`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("Vertex AI error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
```

#### 4. ストリーミングレスポンス対応

リアルタイムで AI の回答を表示:

```typescript
import { createVertexAIClient } from "@/lib/vertexai/client";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const client = createVertexAIClient();

  // ReadableStream を使ったストリーミング
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const responseStream = await client.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents: message,
        });

        for await (const chunk of responseStream.stream) {
          const text = chunk.text();
          controller.enqueue(new TextEncoder().encode(text));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

#### 5. Grounding with Google Search

リアルタイムの Web 情報を検索して回答生成:

```typescript
import { createVertexAIClient } from "@/lib/vertexai/client";
import type { Tool, GoogleSearch } from "@google/genai";

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const client = createVertexAIClient();

  // Google Search ツールを設定
  const googleSearchTool: Tool = {
    googleSearch: {} as GoogleSearch,
  };

  const response = await client.models.generateContent({
    model: "gemini-2.5-pro",
    contents: message,
    config: {
      tools: [googleSearchTool],
    },
  });

  // Grounding メタデータを取得
  const groundingMetadata = response.groundingMetadata;

  return NextResponse.json({
    reply: response.text,
    sources: groundingMetadata?.webSearchQueries, // 使用した検索クエリ
    citations: groundingMetadata?.groundingChunks, // Web ソース
  });
}
```

#### 6. 利用可能なモデル

| モデル名                | 特徴             | 用途                       |
| ----------------------- | ---------------- | -------------------------- |
| `gemini-2.5-flash`      | 高速・軽量       | チャット、リアルタイム応答 |
| `gemini-2.5-pro`        | 高性能・高精度   | 複雑な分析、予測           |
| `gemini-2.0-flash`      | 最新の高速モデル | 一般的な用途               |
| `gemini-2.0-flash-lite` | 超軽量           | シンプルなタスク           |

#### 7. レート制限と制約

- **入力制限**:

  - 画像: 最大 3,000 枚（インラインデータ）
  - 音声: 最大 8.4 時間
  - 動画: 最大 1 時間
  - Cloud Storage ファイル: 2 GB まで

- **パラメータ**:

  - `temperature`: 0.0 ～ 2.0（デフォルト 1.0）
  - `topP`: 0.0 ～ 1.0（デフォルト 0.95）
  - `maxOutputTokens`: 最大出力トークン数

- **セーフティ設定**:
  - 4 つのカテゴリ: 性的、ヘイト、ハラスメント、危険コンテンツ
  - ブロックレベル: `LOW_AND_ABOVE`, `MEDIUM_AND_ABOVE`, `ONLY_HIGH`, `NONE`

#### 8. Error Handling & Best Practices

```typescript
import { createVertexAIClient } from "@/lib/vertexai/client";

export async function generateWithRetry(prompt: string, maxRetries = 3) {
  const client = createVertexAIClient();
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });
      return response.text;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error);

      // Exponential backoff
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError;
}
```

#### 9. Production Deployment (Vercel)

Vercel へのデプロイ時は、サービスアカウントキーを環境変数に設定:

1. Google Cloud Console でサービスアカウント作成
2. JSON キーファイルをダウンロード
3. Vercel の環境変数に設定:
   ```
   GOOGLE_APPLICATION_CREDENTIALS_JSON={JSONキーの内容}
   ```
4. コード内で JSON をパース:
   ```typescript
   if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
     process.env.GOOGLE_APPLICATION_CREDENTIALS = "/tmp/credentials.json";
     fs.writeFileSync(
       process.env.GOOGLE_APPLICATION_CREDENTIALS,
       process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
     );
   }
   ```

### Code Quality

- TypeScript strict モード使用
- ESLint で lint
- 主要処理に日本語コメント記載

## Development Phases

### Phase 1: MVP

- [ ] Google OAuth 認証
- [ ] Google スプレッドシート連携
- [x] ビットコイン価格取得（CoinGecko API 連携完了）
- [ ] BigBear.ai 株価対応
- [ ] アラート通知（Resend）
- [x] リアルタイム価格グラフ（Recharts エリアチャート）
- [x] 未来的な UI デザイン（メタリックテーマ + グラス効果）
- [ ] Vercel Cron Jobs 設定
- [ ] 過去データ初期ロード機能

### Phase 2: AI 機能

- [ ] Gemini API 統合
- [ ] Web Grounding 有効化
- [ ] チャット UI
- [ ] 価格履歴データのコンテキスト注入

### Phase 3: 拡張

- [ ] Supabase 対応
- [ ] DB 切り替え機能
- [ ] 銘柄追加（最大 5 銘柄）
- [ ] グラフ期間カスタマイズ
- [ ] レスポンシブ最適化

## Important Constraints

### API Limits

- **CoinGecko**: 月 10,000 リクエスト
- **Alpha Vantage**: 1 日 25 リクエスト（4 時間 ×6 回 ×2 銘柄 = 12/日）
- **Resend**: 月 3,000 通
- **CoinGecko 無料版**: 過去 365 日まで（それ以前は手動インポート）

### Performance Targets

- ページ読み込み: 3 秒以内
- グラフ描画: 2 秒以内
- AI 応答開始: 5 秒以内

## Documentation References

### Framework & Platform

- Next.js 15: https://nextjs.org/docs
- Next.js 15 App Router: https://nextjs.org/docs/app
- Vercel: https://vercel.com/docs
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs

### Database & Auth

- Supabase Docs: https://supabase.com/docs
- Supabase + Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Auth: https://supabase.com/docs/guides/auth

### External APIs

- CoinGecko API: https://www.coingecko.com/en/api/documentation
- Alpha Vantage API: https://www.alphavantage.co/documentation/
- Gemini API: https://ai.google.dev/docs
- Vertex AI Gemini: https://docs.cloud.google.com/vertex-ai/generative-ai/docs
- Vertex AI Grounding: https://ai.google.dev/gemini-api/docs/grounding
- Google Gen AI SDK: https://github.com/googleapis/nodejs-genai
- Resend (Email): https://resend.com/docs

### Tools & Libraries

- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS v4: https://tailwindcss.com/docs
- Recharts: https://recharts.org/en-US/
- Chart.js: https://www.chartjs.org/docs/latest/
