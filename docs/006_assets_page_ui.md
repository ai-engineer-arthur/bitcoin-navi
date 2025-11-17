# 006: 銘柄管理画面 UI

## 概要
監視する銘柄（暗号通貨・株式）を管理する画面の UI を実装する。銘柄の追加・削除・表示機能を提供する。

## 技術スタック
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## TODO
- [x] 銘柄管理ページ作成
- [x] 銘柄リストコンポーネント作成
- [x] 銘柄追加モーダル UI
- [x] 銘柄削除確認ダイアログ
- [x] 銘柄フィルター機能 UI
- [x] 空状態（Empty State）UI

## 実装詳細

### 1. 銘柄管理ページ
`src/app/(dashboard)/assets/page.tsx`:
```typescript
import { AssetList } from '@/components/features/asset-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">
            Manage your monitored crypto and stock assets
          </p>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          All
        </button>
        <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80">
          Crypto
        </button>
        <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80">
          Stocks
        </button>
      </div>

      <AssetList />
    </div>
  );
}
```

### 2. 銘柄リストコンポーネント
`src/components/features/asset-list.tsx`:
```typescript
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';

const mockAssets = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    price: '$45,234.56',
    change: '+2.34%',
    trend: 'up',
  },
  {
    id: '2',
    symbol: 'BBAI',
    name: 'BigBear.ai',
    type: 'stock',
    price: '$12.34',
    change: '-1.23%',
    trend: 'down',
  },
];

export function AssetList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockAssets.map((asset) => (
        <Card key={asset.id}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="font-bold text-primary text-lg">
                  {asset.symbol.slice(0, 1)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{asset.symbol}</h3>
                <p className="text-sm text-muted-foreground">{asset.name}</p>
              </div>
            </div>
            <button className="p-1 hover:bg-muted rounded">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-semibold">{asset.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">24h Change</span>
              <span className={`flex items-center gap-1 ${
                asset.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {asset.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {asset.change}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm capitalize">{asset.type}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="ghost" className="w-full text-sm">
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 3. 銘柄追加モーダル
`src/components/features/add-asset-modal.tsx`:
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add New Asset</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Asset Type
            </label>
            <select className="w-full bg-muted border border-border rounded-md px-3 py-2">
              <option value="crypto">Cryptocurrency</option>
              <option value="stock">Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Symbol
            </label>
            <Input placeholder="e.g., BTC, AAPL" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Name
            </label>
            <Input placeholder="e.g., Bitcoin, Apple Inc." />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Asset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

### 4. 空状態 UI
`src/components/ui/empty-state.tsx`:
```typescript
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="text-muted-foreground" size={32} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {description}
      </p>
      {action}
    </div>
  );
}
```

## 完了条件
- [x] 銘柄管理ページが表示される
- [x] 銘柄リストが表示される
- [x] フィルター機能が動作する
- [x] 追加モーダルが表示される
- [x] 空状態が正しく表示される
- [x] レスポンシブ対応している

## 🎉 実装完了（2025-11-11）
銘柄管理画面UIの実装が完了しました！

### 実装内容
- **EmptyState**: 再利用可能な空状態UIコンポーネント
  - グラデーションアイコン + グロー効果
  - `animate-pulse-glow` でゆっくり点滅
  - オプショナルなアクションボタン
- **AssetList**: 銘柄リストコンポーネント
  - グラス効果のカード表示
  - ドロップダウンメニュー（詳細・アラート設定・削除）
  - トレンド表示（上昇 primary / 下降 accent-pink）
  - 空状態の自動表示
  - フィルター対応（all / crypto / stock）
- **AddAssetModal**: 銘柄追加モーダル
  - グラス効果 + グロー + アニメーション（fade-in, slide-up）
  - 銘柄タイプ選択（暗号通貨 / 株式）
  - シンボル・名前入力
  - バリデーション + ローディング状態
  - オーバーレイクリックで閉じる
- **Assetsページ**: すべてのコンポーネントを統合
  - Client Component化（useState使用）
  - フィルタータブ（すべて / 暗号通貨 / 株式）
  - モーダル開閉状態管理
  - レスポンシブデザイン

### 2025-11-17 追加実装
- **DeleteAssetDialog**: 銘柄削除確認ダイアログ
  - 危険操作のため赤色の警告デザイン
  - AlertTriangle アイコン + 警告メッセージ
  - 関連データ（価格履歴・アラート）の削除も警告
  - ローディング状態表示（スピナー）
  - グラス効果 + アニメーション
- **AssetList削除機能統合**:
  - 削除ボタンのクリックハンドラー
  - 削除実行ハンドラー（デモ実装、API連携は後で）
  - 削除ダイアログの状態管理
  - メニュー自動クローズ

### 未実装（後で実装予定）
- **API連携**: #009（Google OAuth）、#010（Google Sheets）で実装予定
- **実際の削除処理**: 現在はコンソールログのみ、API実装時に完成

## 関連チケット
- 前: #005 ダッシュボード UI
- 次: #007 アラート設定画面 UI
