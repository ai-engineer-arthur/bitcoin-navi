'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
  assetSymbol: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/**
 * 銘柄削除確認ダイアログ
 * 危険な操作のため、赤色の警告デザインで確認を促す
 */
export function DeleteAssetDialog({
  isOpen,
  onClose,
  assetName,
  assetSymbol,
  onConfirm,
  isDeleting = false,
}: DeleteAssetDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md p-6 animate-fade-in animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー - 警告アイコン付き */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Delete Asset</h2>
              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* 警告メッセージ */}
        <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-sm">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-primary">
              {assetSymbol}
            </span>{' '}
            ({assetName})?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All associated price history and alerts will also be deleted.
          </p>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
