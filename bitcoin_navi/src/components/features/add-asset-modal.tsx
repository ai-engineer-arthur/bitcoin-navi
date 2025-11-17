'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (asset: { type: string; symbol: string; name: string }) => void;
}

/**
 * 銘柄追加モーダルコンポーネント
 * 新しい監視銘柄を追加するためのフォーム
 */
export function AddAssetModal({ isOpen, onClose, onAdd }: AddAssetModalProps) {
  const [type, setType] = useState<'crypto' | 'stock'>('crypto');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // モック処理（後でAPI連携）
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (onAdd) {
      onAdd({ type, symbol, name });
    }

    // リセット
    setSymbol('');
    setName('');
    setIsSubmitting(false);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-md glass-strong border border-primary/30 glow-primary animate-slide-up">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gradient flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              銘柄を追加
            </CardTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              type="button"
            >
              <X size={20} className="text-foreground-muted" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 銘柄タイプ選択 */}
            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">
                銘柄タイプ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('crypto')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    type === 'crypto'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border hover:border-primary/50 text-foreground-muted'
                  }`}
                >
                  🪙 暗号通貨
                </button>
                <button
                  type="button"
                  onClick={() => setType('stock')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    type === 'stock'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border hover:border-primary/50 text-foreground-muted'
                  }`}
                >
                  📈 株式
                </button>
              </div>
            </div>

            {/* シンボル入力 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                シンボル <span className="text-accent-pink">*</span>
              </label>
              <Input
                placeholder="例: BTC, AAPL, TSLA"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                required
                className="uppercase"
              />
              <p className="text-xs text-foreground-muted mt-1">
                {type === 'crypto'
                  ? 'CoinGecko で対応している暗号通貨のシンボルを入力'
                  : 'Alpha Vantage で対応している株式のシンボルを入力'}
              </p>
            </div>

            {/* 名前入力 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                名前 <span className="text-accent-pink">*</span>
              </label>
              <Input
                placeholder="例: Bitcoin, Apple Inc., Tesla"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* ボタングループ */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isSubmitting || !symbol || !name}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    追加中...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    追加する
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
