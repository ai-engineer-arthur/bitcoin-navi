/**
 * 統合価格取得 API クライアント
 * 暗号通貨（CoinGecko）と株式（Alpha Vantage）の両方に対応
 */

import { getCryptoPrice, getCryptoHistory } from './coingecko';
import { getStockPrice, getStockHistory, alphaVantageLimiter } from './alpha-vantage';

/**
 * 統一された価格データ型
 */
export interface AssetPriceData {
  /** 価格（米ドル） */
  price_usd: number;
  /** 価格（日本円） */
  price_jpy: number;
  /** 24時間変動率（%） */
  change_24h: number;
}

/**
 * 統一された履歴データ型
 */
export interface AssetHistoryData {
  /** タイムスタンプまたは日付 */
  timestamp: number | string;
  /** 価格（米ドル） */
  price_usd: number;
  /** 価格（日本円） */
  price_jpy: number;
  /** 出来高（オプション） */
  volume?: number;
}

/**
 * 銘柄の現在価格を取得（暗号通貨 or 株式）
 *
 * @param symbol 銘柄シンボル
 * @param type 銘柄タイプ（crypto または stock）
 * @returns 統一された価格データ
 */
export async function getAssetPrice(
  symbol: string,
  type: 'crypto' | 'stock'
): Promise<AssetPriceData> {
  if (type === 'crypto') {
    // 暗号通貨の場合は CoinGecko API を使用
    return await getCryptoPrice(symbol);
  } else {
    // 株式の場合は Alpha Vantage API を使用
    // レート制限チェック（1分間に5リクエスト）
    if (!alphaVantageLimiter.canMakeRequest(5, 60 * 1000)) {
      const waitTime = alphaVantageLimiter.getWaitTime(5, 60 * 1000);
      throw new Error(
        `Alpha Vantage rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    const stock = await getStockPrice(symbol);

    // 為替レート取得（簡易実装 - 本番環境では為替APIを使用）
    const USD_TO_JPY = await getUsdToJpyRate();

    return {
      price_usd: stock.price_usd,
      price_jpy: stock.price_usd * USD_TO_JPY,
      change_24h: stock.change_percent,
    };
  }
}

/**
 * 銘柄の履歴データを取得（暗号通貨 or 株式）
 *
 * @param symbol 銘柄シンボル
 * @param type 銘柄タイプ（crypto または stock）
 * @param days 過去何日分のデータを取得するか
 * @returns 統一された履歴データ
 */
export async function getAssetHistory(
  symbol: string,
  type: 'crypto' | 'stock',
  days: number = 7
): Promise<AssetHistoryData[]> {
  if (type === 'crypto') {
    // 暗号通貨の履歴を取得
    return await getCryptoHistory(symbol, days);
  } else {
    // 株式の履歴を取得
    if (!alphaVantageLimiter.canMakeRequest(5, 60 * 1000)) {
      const waitTime = alphaVantageLimiter.getWaitTime(5, 60 * 1000);
      throw new Error(
        `Alpha Vantage rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    const history = await getStockHistory(symbol, days);
    const USD_TO_JPY = await getUsdToJpyRate();

    return history.map((item) => ({
      timestamp: item.date,
      price_usd: item.close,
      price_jpy: item.close * USD_TO_JPY,
      volume: item.volume,
    }));
  }
}

/**
 * USD から JPY への為替レートを取得
 *
 * 簡易実装: 固定レート 150円
 * 本番環境では為替APIを使用（例: https://exchangeratesapi.io/）
 *
 * @returns USD/JPY レート
 */
async function getUsdToJpyRate(): Promise<number> {
  // TODO: 本番環境では為替APIから取得
  // 例: https://api.exchangeratesapi.io/latest?base=USD&symbols=JPY

  // 簡易実装: 固定レート
  return 150;
}

/**
 * 複数銘柄の価格を一括取得
 *
 * @param assets 銘柄リスト（symbol と type を含む）
 * @returns 各銘柄の価格データ（エラー時は null）
 */
export async function getBatchPrices(
  assets: Array<{ symbol: string; type: 'crypto' | 'stock' }>
): Promise<Array<(AssetPriceData & { symbol: string }) | null>> {
  return await Promise.all(
    assets.map(async ({ symbol, type }) => {
      try {
        const priceData = await getAssetPrice(symbol, type);
        return { symbol, ...priceData };
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error);
        return null;
      }
    })
  );
}
