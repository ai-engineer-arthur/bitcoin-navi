/**
 * Google Sheets API クライアント
 * サービスアカウント認証を使用してスプレッドシートにアクセス
 */

import { google } from 'googleapis';

/**
 * Google Sheets API v4 クライアントを取得
 *
 * 環境変数:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: サービスアカウントのメールアドレス
 * - GOOGLE_PRIVATE_KEY: サービスアカウントの秘密鍵（改行は\\nで表現）
 */
export function getGoogleSheetsClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) {
    throw new Error(
      'Google Sheets credentials not found. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local'
    );
  }

  // Google Auth クライアント作成
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      // \\n を実際の改行文字に変換
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // Sheets API v4 クライアントを返す
  return google.sheets({ version: 'v4', auth });
}

/**
 * スプレッドシート ID（環境変数から取得）
 */
export const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '';

/**
 * シート名の定数
 * スプレッドシート内の各シート名を定義
 */
export const SHEETS = {
  /** 銘柄情報シート */
  ASSETS: 'assets',
  /** アラート設定シート */
  ALERTS: 'alerts',
  /** 価格履歴シート */
  PRICE_HISTORY: 'price_history',
} as const;

/**
 * スプレッドシート初期化チェック
 * 必要な環境変数が設定されているか確認
 */
export function checkSheetsConfig() {
  const missingVars: string[] = [];

  if (!process.env.GOOGLE_SHEETS_ID) {
    missingVars.push('GOOGLE_SHEETS_ID');
  }
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    missingVars.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  }
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    missingVars.push('GOOGLE_PRIVATE_KEY');
  }

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing Google Sheets environment variables: ${missingVars.join(', ')}`
    );
    console.warn('   Database operations will not work until these are set.');
    return false;
  }

  return true;
}
