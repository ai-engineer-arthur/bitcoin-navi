'use client';

import { Button } from '@/components/ui/button';
import { AssetList } from '@/components/features/asset-list';
import { AddAssetModal } from '@/components/features/add-asset-modal';
import { Plus } from 'lucide-react';
import { useState } from 'react';

type FilterType = 'all' | 'crypto' | 'stock';

/**
 * 銘柄管理ページ
 * 監視中の暗号通貨・株式を一覧表示
 */
export default function AssetsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddAsset = (asset: { type: string; symbol: string; name: string }) => {
    console.log('新しい銘柄を追加:', asset);
    // TODO: API連携後に実装（#010 Google Sheets / Supabase）
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gradient mb-2">
            Assets
          </h1>
          <p className="text-foreground-muted">
            監視中の暗号通貨・株式を管理
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 glow-primary"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">銘柄を追加</span>
          <span className="sm:hidden">追加</span>
        </Button>
      </div>

      {/* フィルタータブ */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-primary to-secondary text-black glow-primary'
              : 'bg-muted text-foreground-muted hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter('crypto')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'crypto'
              ? 'bg-gradient-to-r from-primary to-secondary text-black glow-primary'
              : 'bg-muted text-foreground-muted hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          🪙 暗号通貨
        </button>
        <button
          onClick={() => setFilter('stock')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'stock'
              ? 'bg-gradient-to-r from-primary to-secondary text-black glow-primary'
              : 'bg-muted text-foreground-muted hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          📈 株式
        </button>
      </div>

      {/* 銘柄リスト */}
      <AssetList filter={filter} onAddAsset={() => setIsModalOpen(true)} />

      {/* 銘柄追加モーダル */}
      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddAsset}
      />
    </div>
  );
}
