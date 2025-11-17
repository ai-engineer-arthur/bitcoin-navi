/**
 * 全銘柄の価格取得 API Route
 * GET /api/prices
 *
 * 登録されているすべての銘柄の現在価格を一括取得します。
 */

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';
import { getAssetPrice } from '@/lib/api/prices';

/**
 * 全銘柄の価格を一括取得
 *
 * @returns JSON レスポンス（全銘柄の価格データ配列）
 */
export async function GET() {
  try {
    // データベースから全銘柄を取得
    const db = getDatabase();
    const assets = await db.getAssets();

    if (assets.length === 0) {
      return NextResponse.json({
        message: 'No assets found in database',
        prices: [],
      });
    }

    // 各銘柄の価格を取得（並列処理）
    const prices = await Promise.all(
      assets.map(async (asset) => {
        try {
          // 外部APIから価格を取得
          const priceData = await getAssetPrice(asset.symbol, asset.type);

          // 価格履歴をデータベースに保存（バックグラウンドで）
          // エラーが発生してもレスポンスには影響しない
          db.addPriceHistory({
            asset_id: asset.id,
            price_usd: priceData.price_usd,
            price_jpy: priceData.price_jpy,
            volume: null,
            timestamp: new Date().toISOString(),
          }).catch((error) => {
            console.error(`Failed to save price history for ${asset.symbol}:`, error);
          });

          return {
            symbol: asset.symbol,
            name: asset.name,
            type: asset.type,
            price_usd: priceData.price_usd,
            price_jpy: priceData.price_jpy,
            change_24h: priceData.change_24h,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Failed to fetch price for ${asset.symbol}:`, error);

          // エラーが発生した銘柄は null を返す
          return null;
        }
      })
    );

    // null（エラー）を除外したデータを返す
    const successfulPrices = prices.filter((price) => price !== null);
    const failedCount = prices.length - successfulPrices.length;

    return NextResponse.json({
      success: true,
      total: assets.length,
      fetched: successfulPrices.length,
      failed: failedCount,
      prices: successfulPrices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Batch prices fetch error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch prices',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
