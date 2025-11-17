/**
 * データベース抽象化レイヤー
 * Google Sheets ⇔ Supabase を切り替え可能にするためのインターフェース
 */

import { Asset, Alert, PriceHistory } from '@/types';

/**
 * データベースインターフェース
 * このインターフェースを実装することで、どのDBでも同じ操作が可能
 */
export interface Database {
  // ========================================
  // Assets（銘柄）
  // ========================================

  /**
   * すべての銘柄を取得
   */
  getAssets(): Promise<Asset[]>;

  /**
   * IDで銘柄を取得
   * @param id 銘柄ID
   * @returns 銘柄情報、見つからない場合はnull
   */
  getAssetById(id: string): Promise<Asset | null>;

  /**
   * 新しい銘柄を作成
   * @param asset 銘柄情報（idとcreated_atは自動生成）
   * @returns 作成された銘柄情報
   */
  createAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset>;

  /**
   * 銘柄を削除（関連する価格履歴とアラートもカスケード削除）
   * @param id 銘柄ID
   */
  deleteAsset(id: string): Promise<void>;

  // ========================================
  // Alerts（アラート）
  // ========================================

  /**
   * すべてのアラートを取得
   */
  getAlerts(): Promise<Alert[]>;

  /**
   * 特定銘柄のアラートを取得
   * @param assetId 銘柄ID
   */
  getAlertsByAssetId(assetId: string): Promise<Alert[]>;

  /**
   * 新しいアラートを作成
   * @param alert アラート情報（idとcreated_atは自動生成）
   * @returns 作成されたアラート情報
   */
  createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert>;

  /**
   * アラートを更新
   * @param id アラートID
   * @param updates 更新内容
   * @returns 更新されたアラート情報
   */
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert>;

  /**
   * アラートを削除
   * @param id アラートID
   */
  deleteAlert(id: string): Promise<void>;

  // ========================================
  // Price History（価格履歴）
  // ========================================

  /**
   * 特定銘柄の価格履歴を取得
   * @param assetId 銘柄ID
   * @param limit 取得件数（デフォルト: すべて）
   * @returns 価格履歴（新しい順）
   */
  getPriceHistory(assetId: string, limit?: number): Promise<PriceHistory[]>;

  /**
   * 価格履歴を追加
   * @param history 価格履歴（idは自動生成）
   * @returns 追加された価格履歴
   */
  addPriceHistory(history: Omit<PriceHistory, 'id'>): Promise<PriceHistory>;
}
