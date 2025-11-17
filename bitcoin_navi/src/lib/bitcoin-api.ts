// CoinGecko APIからビットコイン価格を取得する共有関数
export async function fetchBitcoinPrice() {
  const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

  try {
    console.log('Fetching Bitcoin price from CoinGecko API...');

    // 現在価格を取得
    const currentPriceResponse = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=bitcoin&vs_currencies=usd,jpy&include_24hr_change=true`,
      { next: { revalidate: 60 } } // 60秒キャッシュ
    );

    if (!currentPriceResponse.ok) {
      throw new Error(
        `Failed to fetch current price: ${currentPriceResponse.status}`
      );
    }

    const currentPriceData = await currentPriceResponse.json();

    return {
      usd: currentPriceData.bitcoin.usd,
      usd_24h_change: currentPriceData.bitcoin.usd_24h_change,
      jpy: currentPriceData.bitcoin.jpy,
      jpy_24h_change: currentPriceData.bitcoin.jpy_24h_change,
    };
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    throw error;
  }
}

// チャートデータを取得する関数
export async function fetchBitcoinChartData(days: number = 7) {
  const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

  try {
    const chartDataResponse = await fetch(
      `${COINGECKO_API_BASE}/coins/bitcoin/market_chart?vs_currency=jpy&days=${days}`,
      { next: { revalidate: 300 } } // 5分キャッシュ
    );

    if (!chartDataResponse.ok) {
      throw new Error(
        `Failed to fetch chart data: ${chartDataResponse.status}`
      );
    }

    const chartDataJson = await chartDataResponse.json();
    return chartDataJson.prices;
  } catch (error) {
    console.error('Error fetching Bitcoin chart data:', error);
    throw error;
  }
}
