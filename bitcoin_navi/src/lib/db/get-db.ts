/**
 * データベースインスタンス取得
 * 環境変数 DB_TYPE によって使用するデータベースを切り替え
 */

import { Database } from './index';
import { SheetsDatabase } from './sheets-db';

/**
 * データベースインスタンスを取得
 *
 * 環境変数 DB_TYPE で切り替え:
 * - 'sheets' (デフォルト): Google Sheets
 * - 'supabase': Supabase (将来実装予定)
 *
 * @returns Database インスタンス
 */
export function getDatabase(): Database {
  const dbType = process.env.DB_TYPE || 'sheets';

  switch (dbType) {
    case 'sheets':
      return new SheetsDatabase();

    case 'supabase':
      // TODO: Supabase 実装（Phase 2）
      throw new Error('Supabase implementation is not available yet. Coming in Phase 2.');

    default:
      throw new Error(
        `Unknown DB_TYPE: ${dbType}. Supported values: 'sheets', 'supabase'`
      );
  }
}
