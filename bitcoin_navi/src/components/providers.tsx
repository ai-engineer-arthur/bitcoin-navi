'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Providers Component
 * Client Componentとして、SessionProviderをラップ
 * これによりServer ComponentであるRoot Layoutからセッション機能を提供できる
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
