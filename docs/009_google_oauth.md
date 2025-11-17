# 009: Google OAuth 認証実装

## 概要
Google OAuth 2.0 を使用した認証機能を実装する。NextAuth.js v5 を使用してセキュアな認証フローを構築する。

## 技術スタック
- **Authentication**: NextAuth.js v5
- **Provider**: Google OAuth 2.0
- **Framework**: Next.js 15 App Router

## TODO
- [ ] NextAuth.js v5 インストール・設定
- [ ] Google Cloud Console でプロジェクト作成
- [ ] OAuth 2.0 クライアント ID 取得
- [ ] 環境変数設定
- [ ] Auth API Route 作成
- [ ] Middleware で認証チェック
- [ ] ログイン・ログアウト機能実装
- [ ] セッション管理

## 実装詳細

### 1. パッケージインストール
```bash
npm install next-auth@beta
```

### 2. Google Cloud Console 設定
1. https://console.cloud.google.com/ にアクセス
2. プロジェクト作成
3. 「APIとサービス」→「認証情報」
4. OAuth 2.0 クライアント ID を作成
5. 承認済みリダイレクト URI に `http://localhost:3000/api/auth/callback/google` を追加

### 3. 環境変数設定
`.env.local`:
```bash
NEXTAUTH_SECRET=your-secret-key # openssl rand -base64 32 で生成
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Auth 設定
`src/lib/auth.ts`:
```typescript
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
});
```

### 5. API Route
`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

### 6. Middleware
`middleware.ts`:
```typescript
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 7. ログインページ更新
`src/app/(auth)/login/page.tsx`:
```typescript
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('google', { redirectTo: '/dashboard' });
      }}
    >
      <Button type="submit">
        Sign in with Google
      </Button>
    </form>
  );
}
```

### 8. ログアウト機能
`src/components/features/user-menu.tsx`:
```typescript
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
      }}
    >
      <Button type="submit" variant="ghost">
        Sign Out
      </Button>
    </form>
  );
}
```

### 9. セッション取得
Server Component で:
```typescript
import { auth } from '@/lib/auth';

export default async function Dashboard() {
  const session = await auth();

  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
    </div>
  );
}
```

Client Component で:
```typescript
'use client';

import { useSession } from 'next-auth/react';

export function UserProfile() {
  const { data: session } = useSession();

  return <p>{session?.user?.name}</p>;
}
```

## 完了条件
- [ ] Google OAuth ログインが動作する
- [ ] ログアウトが動作する
- [ ] 未認証ユーザーがリダイレクトされる
- [ ] セッション情報が正しく取得できる
- [ ] Middleware で認証チェックが動作する

## 関連チケット
- 前: #008 AI チャット画面 UI
- 次: #010 Google スプレッドシート連携
- 関連: #004 ログイン画面 UI
