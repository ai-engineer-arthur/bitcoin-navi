'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/features/sidebar';
import { Header } from '@/components/features/header';

// Page configurations
const PAGE_CONFIG: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'リアルタイム価格監視ダッシュボード',
  },
  '/assets': {
    title: 'Assets',
    description: '監視銘柄の管理',
  },
  '/alerts': {
    title: 'Alerts',
    description: 'アラート設定と通知履歴',
  },
  '/chat': {
    title: 'AI Chat',
    description: 'リアルタイムの価格やニュースを回答します。',
  },
};

/**
 * ダッシュボードレイアウト
 * 認証情報はルートレイアウトのSessionProviderから提供される
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Get current page config
  const currentPage = PAGE_CONFIG[pathname] || PAGE_CONFIG['/dashboard'];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={currentPage.title}
          description={currentPage.description}
          onMenuClick={toggleSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
