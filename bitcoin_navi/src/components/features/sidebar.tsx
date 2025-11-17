'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bitcoin,
  Bell,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Bitcoin },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-72 h-screen
          glass-strong border-r border-border
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-black text-gradient">
              Bitcoin Navi
            </h1>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-secondary/10 text-primary border border-primary/30 glow-primary'
                      : 'text-foreground-muted hover:bg-primary/5 hover:text-foreground border border-transparent'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-foreground-muted mb-1">
              Powered by
            </p>
            <p className="text-sm font-bold text-gradient">
              Gemini AI & Vercel
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
