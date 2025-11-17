import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

/**
 * NextAuth.js v5 認証設定
 * Google OAuth 2.0 を使用したセキュアな認証フロー
 *
 * 注意: 環境変数が未設定の場合、認証機能は無効になります
 */

// 環境変数が設定されているかチェック
const hasGoogleCredentials =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: hasGoogleCredentials ? [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ] : [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // 開発環境で認証情報が未設定の場合、認証チェックをスキップ
      if (!hasGoogleCredentials && process.env.NODE_ENV === 'development') {
        return true;
      }

      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAssets = nextUrl.pathname.startsWith('/assets');
      const isOnAlerts = nextUrl.pathname.startsWith('/alerts');
      const isOnChat = nextUrl.pathname.startsWith('/chat');

      // 保護されたルート
      const isProtectedRoute = isOnDashboard || isOnAssets || isOnAlerts || isOnChat;

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // 未認証ユーザーをログインページにリダイレクト
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        // ログイン済みユーザーがログインページにアクセスした場合、ダッシュボードにリダイレクト
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
});
