import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

/**
 * NextAuth.js v5 認証設定
 * Google OAuth 2.0 を使用したセキュアな認証フロー
 */
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
