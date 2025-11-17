/**
 * Google Sheets データベース実装
 * Database インターフェースを実装し、スプレッドシートに対してCRUD操作を実行
 */

import { getGoogleSheetsClient, SPREADSHEET_ID, SHEETS } from './sheets-client';
import { Database } from './index';
import { Asset, Alert, PriceHistory } from '@/types';

/**
 * SheetsDatabase クラス
 * Google Sheets API を使ってデータベース操作を実装
 */
export class SheetsDatabase implements Database {
  private sheets = getGoogleSheetsClient();

  // ========================================
  // Assets（銘柄）
  // ========================================

  async getAssets(): Promise<Asset[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.ASSETS}!A2:E`, // ヘッダー行を除く
      });

      const rows = response.data.values || [];
      return rows.map((row) => ({
        id: row[0] || '',
        symbol: row[1] || '',
        name: row[2] || '',
        type: (row[3] || 'crypto') as 'crypto' | 'stock',
        created_at: row[4] || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error getting assets:', error);
      return [];
    }
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const assets = await this.getAssets();
    return assets.find((asset) => asset.id === id) || null;
  }

  async createAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.ASSETS}!A:E`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[id, asset.symbol, asset.name, asset.type, created_at]],
      },
    });

    return { id, ...asset, created_at };
  }

  async deleteAsset(id: string): Promise<void> {
    // 1. 銘柄の行番号を取得
    const assets = await this.getAssets();
    const assetIndex = assets.findIndex((asset) => asset.id === id);

    if (assetIndex === -1) {
      throw new Error(`Asset with id ${id} not found`);
    }

    // 2. 行を削除（ヘッダー行を考慮して+2）
    const rowNumber = assetIndex + 2;
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await this.getSheetId(SHEETS.ASSETS),
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    });

    // 3. カスケード削除：関連するアラートと価格履歴を削除
    await this.deleteAlertsByAssetId(id);
    await this.deletePriceHistoryByAssetId(id);
  }

  // ========================================
  // Alerts（アラート）
  // ========================================

  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.ALERTS}!A2:I`,
      });

      const rows = response.data.values || [];
      return rows.map((row) => ({
        id: row[0] || '',
        asset_id: row[1] || '',
        type: (row[2] || 'high') as 'high' | 'low',
        threshold: parseFloat(row[3] || '0'),
        currency: (row[4] || 'USD') as 'JPY' | 'USD',
        is_active: row[5] === 'true' || row[5] === '1',
        is_triggered: row[6] === 'true' || row[6] === '1',
        triggered_at: row[7] || null,
        created_at: row[8] || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  async getAlertsByAssetId(assetId: string): Promise<Alert[]> {
    const alerts = await this.getAlerts();
    return alerts.filter((alert) => alert.asset_id === assetId);
  }

  async createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.ALERTS}!A:I`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            id,
            alert.asset_id,
            alert.type,
            alert.threshold,
            alert.currency,
            alert.is_active,
            alert.is_triggered,
            alert.triggered_at || '',
            created_at,
          ],
        ],
      },
    });

    return { id, ...alert, created_at };
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    // 1. アラートを取得
    const alerts = await this.getAlerts();
    const alertIndex = alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      throw new Error(`Alert with id ${id} not found`);
    }

    const alert = alerts[alertIndex];
    const updatedAlert = { ...alert, ...updates };

    // 2. 行を更新（ヘッダー行を考慮して+2）
    const rowNumber = alertIndex + 2;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.ALERTS}!A${rowNumber}:I${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            updatedAlert.id,
            updatedAlert.asset_id,
            updatedAlert.type,
            updatedAlert.threshold,
            updatedAlert.currency,
            updatedAlert.is_active,
            updatedAlert.is_triggered,
            updatedAlert.triggered_at || '',
            updatedAlert.created_at,
          ],
        ],
      },
    });

    return updatedAlert;
  }

  async deleteAlert(id: string): Promise<void> {
    const alerts = await this.getAlerts();
    const alertIndex = alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      throw new Error(`Alert with id ${id} not found`);
    }

    const rowNumber = alertIndex + 2;
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await this.getSheetId(SHEETS.ALERTS),
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    });
  }

  // ========================================
  // Price History（価格履歴）
  // ========================================

  async getPriceHistory(assetId: string, limit?: number): Promise<PriceHistory[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.PRICE_HISTORY}!A2:G`,
      });

      const rows = response.data.values || [];
      const history = rows
        .map((row) => ({
          id: row[0] || '',
          asset_id: row[1] || '',
          price_usd: parseFloat(row[2] || '0'),
          price_jpy: parseFloat(row[3] || '0'),
          volume: row[4] ? parseFloat(row[4]) : null,
          timestamp: row[5] || new Date().toISOString(),
        }))
        .filter((h) => h.asset_id === assetId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // 新しい順

      return limit ? history.slice(0, limit) : history;
    } catch (error) {
      console.error('Error getting price history:', error);
      return [];
    }
  }

  async addPriceHistory(history: Omit<PriceHistory, 'id'>): Promise<PriceHistory> {
    const id = crypto.randomUUID();

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.PRICE_HISTORY}!A:G`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            id,
            history.asset_id,
            history.price_usd,
            history.price_jpy,
            history.volume || '',
            history.timestamp,
          ],
        ],
      },
    });

    return { id, ...history };
  }

  // ========================================
  // 内部ヘルパーメソッド
  // ========================================

  /**
   * シート名からシートIDを取得
   * @param sheetName シート名
   */
  private async getSheetId(sheetName: string): Promise<number> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = response.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );

    if (!sheet || sheet.properties?.sheetId === undefined) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    return sheet.properties.sheetId;
  }

  /**
   * 特定銘柄のアラートをすべて削除（カスケード削除用）
   * @param assetId 銘柄ID
   */
  private async deleteAlertsByAssetId(assetId: string): Promise<void> {
    const alerts = await this.getAlertsByAssetId(assetId);
    for (const alert of alerts) {
      await this.deleteAlert(alert.id);
    }
  }

  /**
   * 特定銘柄の価格履歴をすべて削除（カスケード削除用）
   * @param assetId 銘柄ID
   */
  private async deletePriceHistoryByAssetId(assetId: string): Promise<void> {
    const history = await this.getPriceHistory(assetId);
    const sheetId = await this.getSheetId(SHEETS.PRICE_HISTORY);

    // すべての価格履歴データを取得
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.PRICE_HISTORY}!A2:G`,
    });

    const rows = response.data.values || [];
    const deleteRequests = [];

    // 削除する行番号を特定（逆順で削除しないとインデックスがずれる）
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i][1] === assetId) {
        const rowNumber = i + 2; // ヘッダー行を考慮
        deleteRequests.push({
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        });
      }
    }

    // 一括削除
    if (deleteRequests.length > 0) {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: deleteRequests,
        },
      });
    }
  }
}
