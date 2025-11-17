/**
 * Alpha Vantage API クライアント
 * 株式の価格情報を取得
 *
 * API Docs: https://www.alphavantage.co/documentation/
 * Rate Limit: 1日 25 リクエスト（無料プラン）、1分 5 リクエスト
 */

/**
 * Alpha Vantage API のレスポンス型（GLOBAL_QUOTE）
 */
interface AlphaVantageQuote {
  'Global Quote': {
    '01. symbol': string;
    '05. price': string;
    '09. change': string;
    '10. change percent': string;
  };
}

/**
 * Alpha Vantage API のレスポンス型（TIME_SERIES_DAILY）
 */
interface AlphaVantageTimeSeries {
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

/**
 * 株価データの戻り値型
 */
export interface StockPriceData {
  price_usd: number;
  change_percent: number;
}

/**
 * 株式の現在価格を取得
 *
 * @param symbol 株式シンボル（例: AAPL, BBAI）
 * @returns 価格データ（USD、変動率）
 */
export async function getStockPrice(symbol: string): Promise<StockPriceData> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ALPHA_VANTAGE_API_KEY is not set in environment variables'
    );
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

  const response = await fetch(url, {
    next: { revalidate: 300 }, // 5分間キャッシュ
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Alpha Vantage API error (${response.status}): ${errorText}`
    );
  }

  const data: AlphaVantageQuote = await response.json();
  const quote = data['Global Quote'];

  if (!quote || !quote['05. price']) {
    throw new Error(
      `No data found for symbol: ${symbol}. This may be due to rate limiting or an invalid symbol.`
    );
  }

  return {
    price_usd: parseFloat(quote['05. price']),
    change_percent: parseFloat(quote['10. change percent'].replace('%', '')),
  };
}

/**
 * 株式の履歴データを取得
 *
 * @param symbol 株式シンボル
 * @param days 過去何日分のデータを取得するか（デフォルト: 30日）
 * @returns 価格履歴データ（日付、終値、出来高）
 */
export async function getStockHistory(
  symbol: string,
  days: number = 30
): Promise<
  Array<{
    date: string;
    close: number;
    volume: number;
  }>
> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ALPHA_VANTAGE_API_KEY is not set in environment variables'
    );
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // 1時間キャッシュ
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Alpha Vantage API error (${response.status}): ${errorText}`
    );
  }

  const data: AlphaVantageTimeSeries = await response.json();
  const timeSeries = data['Time Series (Daily)'];

  if (!timeSeries) {
    throw new Error(
      `No historical data found for symbol: ${symbol}. This may be due to rate limiting.`
    );
  }

  // 日付でソート（新しい順）して、指定された日数分だけ取得
  const history = Object.entries(timeSeries)
    .map(([date, values]) => ({
      date,
      close: parseFloat(values['4. close']),
      volume: parseFloat(values['5. volume']),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, days);

  return history;
}

/**
 * レート制限チェック（簡易実装）
 *
 * Alpha Vantage は 1日 25 リクエスト、1分 5 リクエストの制限があります。
 * この関数は、アプリケーション側でレート制限を管理するためのヘルパーです。
 */
class RateLimiter {
  private requests: number[] = [];

  /**
   * リクエストが許可されるかチェック
   * @param maxRequests 最大リクエスト数
   * @param windowMs 時間窓（ミリ秒）
   * @returns リクエスト可能かどうか
   */
  canMakeRequest(maxRequests: number, windowMs: number): boolean {
    const now = Date.now();

    // 時間窓外のリクエストを除外
    this.requests = this.requests.filter((time) => now - time < windowMs);

    if (this.requests.length >= maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  /**
   * 次のリクエストまでの待機時間を取得（ミリ秒）
   */
  getWaitTime(maxRequests: number, windowMs: number): number {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < windowMs);

    if (this.requests.length < maxRequests) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    return windowMs - (now - oldestRequest);
  }
}

/**
 * Alpha Vantage のレート制限管理インスタンス
 * - 1分間に最大 5 リクエスト
 * - 1日に最大 25 リクエスト
 */
export const alphaVantageLimiter = new RateLimiter();
