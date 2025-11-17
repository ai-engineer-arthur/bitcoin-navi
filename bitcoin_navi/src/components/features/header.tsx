'use client';

import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = 'Dashboard', onMenuClick }: HeaderProps) {
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
              リアルタイム価格監視ダッシュボード
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
          <button
            className="flex items-center gap-2 p-2 lg:px-4 lg:py-2 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105 group"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
              <User size={16} className="text-black" />
            </div>
            <span className="text-sm font-medium text-foreground hidden lg:block">
              User
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
