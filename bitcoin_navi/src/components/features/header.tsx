'use client';

import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  description?: string;
  onMenuClick?: () => void;
}

/**
 * ダッシュボードヘッダーコンポーネント
 * セッション情報の表示とログアウト機能を提供
 */
export function Header({
  title = 'Dashboard',
  description = 'リアルタイム価格監視ダッシュボード',
  onMenuClick
}: HeaderProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="glass border-b border-border px-4 lg:px-6 py-4 sticky top-0 z-30 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-foreground" />
          </button>

          {/* Page Title */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gradient">
              {title}
            </h2>
            <p className="text-xs text-foreground-muted hidden lg:block">
              {description}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105 group"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-foreground-muted group-hover:text-primary transition-colors" />
            {/* Notification Badge */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-accent-pink rounded-full animate-pulse" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-2 lg:px-4 lg:py-2 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105 group"
              aria-label="User menu"
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
                  <User size={16} className="text-black" />
                </div>
              )}
              <span className="text-sm font-medium text-foreground hidden lg:block">
                {session?.user?.name || 'User'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-strong border border-primary/20 rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-foreground-muted truncate">
                    {session?.user?.email || ''}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-accent-pink/10 text-accent-pink transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
