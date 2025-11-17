'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { DeleteAssetDialog } from '@/components/features/delete-asset-dialog';
import { MoreVertical, TrendingUp, TrendingDown, Inbox, Plus } from 'lucide-react';
import { useState } from 'react';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  price: string;
  change: string;
  trend: 'up' | 'down';
  currency: string;
}

// モックデータ（後でAPIから取得）
const mockAssets: Asset[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    price: '¥16,330,347',
    change: '+2.34%',
    trend: 'up',
    currency: 'JPY',
  },
  {
    id: '2',
    symbol: 'BBAI',
    name: 'BigBear.ai',
    type: 'stock',
    price: '$12.34',
    change: '-1.23%',
    trend: 'down',
    currency: 'USD',
  },
];

interface AssetListProps {
  filter?: 'all' | 'crypto' | 'stock';
  onAddAsset?: () => void;
}

/**
 * 銘柄リストコンポーネント
 * 監視中の銘柄をカード形式で表示
 */
export function AssetList({ filter = 'all', onAddAsset }: AssetListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 削除ボタンのクリックハンドラー
  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
    setOpenMenuId(null); // メニューを閉じる
  };

  // 削除実行ハンドラー（後でAPI連携時に実装）
  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    setIsDeleting(true);

    try {
      // TODO: API連携時にここで削除処理を実装
      // await deleteAsset(assetToDelete.id);

      // デモ用の遅延
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`Deleted asset: ${assetToDelete.symbol}`);

      // ダイアログを閉じる
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error('Failed to delete asset:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // フィルター適用
  const filteredAssets =
    filter === 'all'
      ? mockAssets
      : mockAssets.filter((asset) => asset.type === filter);

  // 空状態の表示
  if (filteredAssets.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="銘柄が見つかりません"
        description="監視する暗号通貨や株式を追加して、リアルタイムで価格をトラッキングしましょう。"
        action={
          onAddAsset && (
            <Button onClick={onAddAsset} className="gap-2">
              <Plus size={20} />
              銘柄を追加
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {filteredAssets.map((asset) => (
        <Card
          key={asset.id}
          className="glass-strong hover:scale-105 transition-all duration-300 group border border-transparent hover:border-primary/30"
        >
          <CardContent className="p-6">
            {/* ヘッダー: アイコン + 銘柄名 + メニューボタン */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* アイコン */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
                  <span className="font-bold text-black text-lg">
                    {asset.symbol.slice(0, 1)}
                  </span>
                </div>

                {/* 銘柄名 */}
                <div>
                  <h3 className="font-bold text-lg text-gradient">
                    {asset.symbol}
                  </h3>
                  <p className="text-sm text-foreground-muted">{asset.name}</p>
                </div>
              </div>

              {/* メニューボタン */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === asset.id ? null : asset.id)
                  }
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <MoreVertical size={20} className="text-foreground-muted" />
                </button>

                {/* ドロップダウンメニュー */}
                {openMenuId === asset.id && (
                  <div className="absolute right-0 mt-2 w-48 glass-strong border border-primary/20 rounded-lg shadow-lg z-10">
                    <button className="w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors">
                      詳細を見る
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors">
                      アラート設定
                    </button>
                    <button
                      onClick={() => handleDeleteClick(asset)}
                      className="w-full text-left px-4 py-2 hover:bg-accent-pink/10 text-accent-pink transition-colors"
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 価格情報 */}
            <div className="space-y-3">
              {/* 現在価格 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">価格</span>
                <span className="font-bold text-lg text-gradient">
                  {asset.price}
                </span>
              </div>

              {/* 24時間変動 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">24h 変動</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    asset.trend === 'up' ? 'text-primary' : 'text-accent-pink'
                  }`}
                >
                  {asset.trend === 'up' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {asset.change}
                </span>
              </div>

              {/* タイプ */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">タイプ</span>
                <span className="text-sm capitalize px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {asset.type === 'crypto' ? '暗号通貨' : '株式'}
                </span>
              </div>
            </div>

            {/* 詳細ボタン */}
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full text-sm hover:text-primary hover:bg-primary/10"
              >
                チャートを見る →
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 削除確認ダイアログ */}
      {assetToDelete && (
        <DeleteAssetDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          assetName={assetToDelete.name}
          assetSymbol={assetToDelete.symbol}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
