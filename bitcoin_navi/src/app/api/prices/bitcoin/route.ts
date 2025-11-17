import { NextResponse } from 'next/server';
import { fetchBitcoinPrice, fetchBitcoinChartData } from '@/lib/bitcoin-api';

export async function GET() {
  try {
    const [currentPrice, chartData] = await Promise.all([
      fetchBitcoinPrice(),
      fetchBitcoinChartData(7),
    ]);

    // レスポンス整形
    const response = {
      currentPrice,
      chartData: chartData.map((item: [number, number]) => ({
        timestamp: item[0],
        price: item[1],
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch Bitcoin price:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch Bitcoin price',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
