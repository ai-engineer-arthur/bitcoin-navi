import { handlers } from '@/lib/auth';

/**
 * NextAuth.js API Route
 * すべての認証リクエスト（ログイン、ログアウト、セッション確認など）を処理
 */
export const { GET, POST } = handlers;
