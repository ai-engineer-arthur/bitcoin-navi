import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'neon';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default:
        'bg-[var(--background-tertiary)] text-[var(--foreground)] border border-[var(--border)]',
      success:
        'bg-green-500/10 text-green-500 border border-green-500/30',
      error:
        'bg-red-500/10 text-red-500 border border-red-500/30',
      warning:
        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
      info:
        'bg-blue-500/10 text-blue-500 border border-blue-500/30',
      neon:
        'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 glow-primary',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
