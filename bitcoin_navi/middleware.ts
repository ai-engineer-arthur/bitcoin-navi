export { auth as middleware } from '@/lib/auth';

/**
 * Middleware設定
 * すべてのルート（API、静的ファイル以外）で認証チェックを実行
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
