/**
 * データベース型定義
 * Asset（銘柄）、Alert（アラート）、PriceHistory（価格履歴）の型を定義
 */

/**
 * 銘柄情報
 */
export interface Asset {
  /** 銘柄ID */
  id: string;
  /** シンボル（例: BTC, BBAI） */
  symbol: string;
  /** 銘柄名（例: Bitcoin, BigBear.ai） */
  name: string;
  /** 種類: 暗号通貨 or 株式 */
  type: 'crypto' | 'stock';
  /** 作成日時（ISO 8601形式） */
  created_at: string;
}

/**
 * アラート設定
 */
export interface Alert {
  /** アラートID */
  id: string;
  /** 銘柄ID（外部キー） */
  asset_id: string;
  /** アラートタイプ: 高値 or 安値 */
  type: 'high' | 'low';
  /** 閾値（価格） */
  threshold: number;
  /** 通貨単位: 日本円 or 米ドル */
  currency: 'JPY' | 'USD';
  /** 有効/無効フラグ */
  is_active: boolean;
  /** 通知済みフラグ */
  is_triggered: boolean;
  /** 通知日時（ISO 8601形式、オプション） */
  triggered_at: string | null;
  /** 作成日時（ISO 8601形式） */
  created_at: string;
}

/**
 * 価格履歴
 */
export interface PriceHistory {
  /** 履歴ID */
  id: string;
  /** 銘柄ID（外部キー） */
  asset_id: string;
  /** 価格（米ドル） */
  price_usd: number;
  /** 価格（日本円） */
  price_jpy: number;
  /** 出来高（オプション） */
  volume: number | null;
  /** 記録日時（ISO 8601形式） */
  timestamp: string;
}
