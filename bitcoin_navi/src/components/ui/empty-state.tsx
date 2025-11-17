import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

/**
 * 空状態表示コンポーネント
 * データが存在しない時に表示される親切なメッセージエリア
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* アイコン */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 glow-primary animate-pulse-glow">
        <Icon className="text-primary" size={40} />
      </div>

      {/* タイトル */}
      <h3 className="text-xl lg:text-2xl font-bold text-gradient mb-3">
        {title}
      </h3>

      {/* 説明文 */}
      <p className="text-foreground-muted text-center mb-8 max-w-md text-sm lg:text-base">
        {description}
      </p>

      {/* アクションボタン（オプション） */}
      {action}
    </div>
  );
}
