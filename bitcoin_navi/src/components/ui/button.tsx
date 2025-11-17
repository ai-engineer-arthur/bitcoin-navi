import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

    const variants = {
      primary:
        'btn-primary bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary)] text-black hover:shadow-[0_6px_25px_rgba(0,255,136,0.5)] hover:-translate-y-0.5',
      secondary:
        'bg-gradient-to-br from-[var(--secondary-dark)] to-[var(--secondary)] text-black hover:shadow-[0_6px_25px_rgba(0,217,255,0.5)] hover:-translate-y-0.5',
      ghost:
        'btn-ghost bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--glass-bg)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
      danger:
        'bg-gradient-to-br from-red-600 to-red-500 text-white hover:shadow-[0_6px_25px_rgba(239,68,68,0.5)] hover:-translate-y-0.5',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'cursor-wait',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
