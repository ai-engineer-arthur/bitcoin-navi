/**
 * CoinGecko API クライアント
 * 暗号通貨の価格情報を取得
 *
 * API Docs: https://www.coingecko.com/en/api/documentation
 * Rate Limit: 月 10,000 リクエスト（無料プラン）
 */

/**
 * CoinGecko API のレスポンス型
 */
interface CoinGeckoPrice {
  [coinId: string]: {
    usd: number;
    jpy: number;
    usd_24h_change: number;
  };
}

/**
 * 価格データの戻り値型
 */
export interface CryptoPriceData {
  price_usd: number;
  price_jpy: number;
  change_24h: number;
}

/**
 * 暗号通貨の価格を取得
 *
 * @param symbol 暗号通貨のシンボル（例: BTC, ETH）
 * @returns 価格データ（USD、JPY、24時間変動率）
 */
export async function getCryptoPrice(symbol: string): Promise<CryptoPriceData> {
  const coinId = getCoinId(symbol);

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  COINGECKO_API_KEY is not set. Using demo mode (rate-limited).');
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,jpy&include_24hr_change=true`;

  const response = await fetch(url, {
    headers: apiKey
      ? {
          'x-cg-demo-api-key': apiKey,
        }
      : {},
    next: { revalidate: 300 }, // 5分間キャッシュ
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `CoinGecko API error (${response.status}): ${errorText}`
    );
  }

  const data: CoinGeckoPrice = await response.json();
  const coinData = data[coinId];

  if (!coinData) {
    throw new Error(
      `No price data found for ${symbol} (coinId: ${coinId}). Check if the symbol mapping is correct.`
    );
  }

  return {
    price_usd: coinData.usd,
    price_jpy: coinData.jpy,
    change_24h: coinData.usd_24h_change,
  };
}

/**
 * シンボルから CoinGecko の coin ID に変換
 *
 * @param symbol 暗号通貨のシンボル（例: BTC）
 * @returns CoinGecko の coin ID（例: bitcoin）
 */
function getCoinId(symbol: string): string {
  const mapping: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    BNB: 'binancecoin',
    XRP: 'ripple',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    SOL: 'solana',
    DOT: 'polkadot',
    MATIC: 'matic-network',
    LINK: 'chainlink',
    // 追加の暗号通貨はここに追加
  };

  return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
}

/**
 * 暗号通貨の履歴データを取得
 *
 * @param symbol 暗号通貨のシンボル
 * @param days 過去何日分のデータを取得するか（デフォルト: 7日）
 * @returns 価格履歴データ（タイムスタンプ、USD、JPY）
 */
export async function getCryptoHistory(
  symbol: string,
  days: number = 7
): Promise<
  Array<{
    timestamp: number;
    price_usd: number;
    price_jpy: number;
  }>
> {
  const coinId = getCoinId(symbol);
  const apiKey = process.env.COINGECKO_API_KEY;

  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;

  const response = await fetch(url, {
    headers: apiKey
      ? {
          'x-cg-demo-api-key': apiKey,
        }
      : {},
    next: { revalidate: 3600 }, // 1時間キャッシュ
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `CoinGecko API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  const prices = data.prices as Array<[number, number]>; // [timestamp, price]

  // USD/JPY レート取得（簡易実装 - 本番環境では為替APIを使用）
  const USD_TO_JPY = 150;

  return prices.map(([timestamp, price_usd]) => ({
    timestamp,
    price_usd,
    price_jpy: price_usd * USD_TO_JPY,
  }));
}
