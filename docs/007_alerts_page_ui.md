# 007: アラート設定画面 UI

## 概要
価格アラートを設定・管理する画面の UI を実装する。アラートの追加・編集・削除・有効/無効の切り替え機能を提供する。

## 技術スタック
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## TODO
- [x] アラート管理ページ作成
- [x] アラートリストコンポーネント作成
- [x] アラート追加フォーム UI
- [x] アラート編集モーダル
- [x] トグルスイッチコンポーネント
- [x] アラート履歴表示

## 実装詳細

### 1. アラート管理ページ
`src/app/(dashboard)/alerts/page.tsx`:
```typescript
import { AlertList } from '@/components/features/alert-list';
import { AlertHistory } from '@/components/features/alert-history';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Set price alerts for your assets
          </p>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          New Alert
        </Button>
      </div>

      {/* Active Alerts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
        <AlertList />
      </div>

      {/* Alert History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Triggers</h2>
        <AlertHistory />
      </div>
    </div>
  );
}
```

### 2. アラートリストコンポーネント
`src/components/features/alert-list.tsx`:
```typescript
import { Card } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';

const mockAlerts = [
  {
    id: '1',
    assetSymbol: 'BTC',
    assetName: 'Bitcoin',
    type: 'high',
    threshold: 50000,
    currency: 'USD',
    isActive: true,
  },
  {
    id: '2',
    assetSymbol: 'BBAI',
    assetName: 'BigBear.ai',
    type: 'low',
    threshold: 10,
    currency: 'USD',
    isActive: false,
  },
];

export function AlertList() {
  return (
    <div className="space-y-3">
      {mockAlerts.map((alert) => (
        <Card key={alert.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-3 rounded-full ${
                alert.type === 'high'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {alert.type === 'high' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">
                  {alert.assetSymbol} {alert.type === 'high' ? 'above' : 'below'} ${alert.threshold}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {alert.assetName} • {alert.currency}
                </p>
              </div>

              <Toggle isActive={alert.isActive} />

              <button className="p-1 hover:bg-muted rounded">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 3. トグルスイッチコンポーネント
`src/components/ui/toggle.tsx`:
```typescript
'use client';

interface ToggleProps {
  isActive: boolean;
  onChange?: (isActive: boolean) => void;
}

export function Toggle({ isActive, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange?.(!isActive)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        isActive ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
```

### 4. アラート追加フォーム
`src/components/features/add-alert-form.tsx`:
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddAlertFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAlertForm({ isOpen, onClose }: AddAlertFormProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create New Alert</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Asset
            </label>
            <select className="w-full bg-muted border border-border rounded-md px-3 py-2">
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="BBAI">BigBear.ai (BBAI)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Alert Type
            </label>
            <select className="w-full bg-muted border border-border rounded-md px-3 py-2">
              <option value="high">Price Above (High)</option>
              <option value="low">Price Below (Low)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Threshold Price
            </label>
            <Input type="number" placeholder="e.g., 50000" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Currency
            </label>
            <select className="w-full bg-muted border border-border rounded-md px-3 py-2">
              <option value="USD">USD</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Alert
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

### 5. アラート履歴表示
`src/components/features/alert-history.tsx`:
```typescript
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const mockHistory = [
  {
    id: '1',
    assetSymbol: 'BTC',
    message: 'Bitcoin price reached $50,000',
    triggeredAt: '2 hours ago',
  },
  {
    id: '2',
    assetSymbol: 'BBAI',
    message: 'BigBear.ai dropped below $10',
    triggeredAt: '1 day ago',
  },
];

export function AlertHistory() {
  return (
    <Card>
      <div className="space-y-3">
        {mockHistory.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 bg-muted rounded-lg"
          >
            <div className="p-2 bg-primary/10 rounded-full">
              <Bell className="text-primary" size={16} />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.message}</p>
              <p className="text-sm text-muted-foreground">{item.triggeredAt}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

## 完了条件
- [x] アラート管理ページが表示される
- [x] アラートリストが表示される
- [x] トグルスイッチが動作する
- [x] 追加フォームが表示される
- [x] 履歴が表示される
- [x] レスポンシブ対応している

## 🎉 実装完了（2025-11-13）
アラート設定画面UIの実装が完了しました！

### 実装内容
- **Toggle**: グラデーション効果付きトグルスイッチ
  - オン/オフでスムーズにアニメーション
  - ホバーでグロー効果
- **AlertHistory**: アラート履歴表示コンポーネント
  - ベルアイコン + グロー効果
  - フェードインアニメーション
- **AlertList**: アクティブなアラートのリスト
  - トグルスイッチでオン/オフ切り替え
  - ドロップダウンメニュー（編集・削除）
  - トレンドアイコン（上昇/下降）
- **AddAlertForm**: アラート追加モーダル
  - グラス効果 + グロー + アニメーション
  - 銘柄選択、アラートタイプ、閾値価格、通貨入力
  - バリデーション + ローディング状態
  - オーバーレイクリックで閉じる
- **Alertsページ**: すべてのコンポーネントを統合
  - Client Component化（useState使用）
  - モーダル開閉状態管理
  - レスポンシブデザイン

### 未実装（後で実装予定）
- **API連携**: #009（Google OAuth）、#010（Google Sheets）で実装予定
- **メール通知**: #013（アラート通知機能）で実装予定

## 関連チケット
- 前: #006 銘柄管理画面 UI
- 次: #008 AI チャット画面 UI
- 関連: #013 アラート通知機能実装
