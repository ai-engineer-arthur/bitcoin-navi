/**
 * 単一銘柄の価格取得 API Route
 * GET /api/prices/[symbol]
 *
 * 指定された銘柄の現在価格を取得し、データベースに履歴を保存します。
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';
import { getAssetPrice } from '@/lib/api/prices';

/**
 * 単一銘柄の価格を取得
 *
 * @param request Next.js Request
 * @param params { symbol: string } - 銘柄シンボル
 * @returns JSON レスポンス（価格データ）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    // データベースから銘柄情報を取得
    const db = getDatabase();
    const assets = await db.getAssets();
    const asset = assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());

    if (!asset) {
      return NextResponse.json(
        { error: `Asset not found: ${symbol}` },
        { status: 404 }
      );
    }

    // 外部APIから価格を取得
    const priceData = await getAssetPrice(asset.symbol, asset.type);

    // 価格履歴をデータベースに保存
    await db.addPriceHistory({
      asset_id: asset.id,
      price_usd: priceData.price_usd,
      price_jpy: priceData.price_jpy,
      volume: null, // Optional: 出来高データがある場合はここに設定
      timestamp: new Date().toISOString(),
    });

    // レスポンスを返す
    return NextResponse.json({
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      price_usd: priceData.price_usd,
      price_jpy: priceData.price_jpy,
      change_24h: priceData.change_24h,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Price fetch error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch price',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
