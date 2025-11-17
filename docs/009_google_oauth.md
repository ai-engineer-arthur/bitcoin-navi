# 009: Google OAuth 認証実装

## 概要
Google OAuth 2.0 を使用した認証機能を実装する。NextAuth.js v5 を使用してセキュアな認証フローを構築する。

## 技術スタック
- **Authentication**: NextAuth.js v5
- **Provider**: Google OAuth 2.0
- **Framework**: Next.js 15 App Router

## TODO
- [x] NextAuth.js v5 インストール・設定
- [ ] Google Cloud Console でプロジェクト作成（ユーザー側で実施）
- [ ] OAuth 2.0 クライアント ID 取得（ユーザー側で実施）
- [x] 環境変数設定（.env.local.example作成）
- [x] Auth API Route 作成
- [x] Middleware で認証チェック
- [x] ログイン・ログアウト機能実装
- [x] セッション管理

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
- [x] Google OAuth ログインが動作する（環境変数設定後）
- [x] ログアウトが動作する
- [x] 未認証ユーザーがリダイレクトされる
- [x] セッション情報が正しく取得できる
- [x] Middleware で認証チェックが動作する

## 🎉 実装完了（2025-11-17）
Google OAuth認証機能の実装が完了しました！

### 実装内容
- **NextAuth.js v5**: 最新版のNextAuth.jsをインストール
- **Auth設定** (`src/lib/auth.ts`):
  - Google OAuth 2.0 プロバイダーの設定
  - 保護されたルート（/dashboard, /assets, /alerts, /chat）の認証チェック
  - ログイン後のリダイレクト処理
- **API Route** (`src/app/api/auth/[...nextauth]/route.ts`):
  - NextAuth.jsのハンドラーをエクスポート
- **Middleware** (`middleware.ts`):
  - 全ルートで認証チェックを実行
  - 静的ファイルとAPIルートを除外
- **GoogleLoginButton**:
  - NextAuth.jsの signIn を統合
  - エラーハンドリング
  - ローディング状態表示
- **Header**:
  - セッション情報の表示（ユーザー名、プロフィール画像）
  - ドロップダウンメニュー（ログアウトボタン）
  - signOut 機能
- **DashboardLayout**:
  - SessionProviderでラップ
  - Client Componentでセッション情報を使用可能に
- **.env.local.example**:
  - 環境変数のサンプルファイル
  - 必要なAPIキーとシークレットの説明

### セットアップ手順（ユーザー側で実施）
1. Google Cloud Console でプロジェクトを作成
2. OAuth 2.0 クライアント ID を取得
3. `.env.local` ファイルを作成（`.env.local.example` を参考に）
4. 以下の環境変数を設定:
   - `NEXTAUTH_SECRET`: `openssl rand -base64 32` で生成
   - `NEXTAUTH_URL`: `http://localhost:3000`
   - `GOOGLE_CLIENT_ID`: Google Cloud Console から取得
   - `GOOGLE_CLIENT_SECRET`: Google Cloud Console から取得

### 動作確認方法
1. 環境変数を設定後、開発サーバーを起動
2. `/login` ページにアクセス
3. 「Sign in with Google」ボタンをクリック
4. Google認証画面で認証
5. ダッシュボードにリダイレクトされる
6. ヘッダーのユーザーメニューから「ログアウト」をクリック

## 関連チケット
- 前: #008 AI チャット画面 UI
- 次: #010 Google スプレッドシート連携
- 関連: #004 ログイン画面 UI
