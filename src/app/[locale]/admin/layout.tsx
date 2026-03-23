'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '../../../contexts/TranslationContext';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  
  // Don't protect the auth page itself to avoid circular redirect
  const isAuthPage = pathname?.includes('/admin/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute fallbackPath={`/${locale}/admin/auth`}>
      {children}
    </ProtectedRoute>
  );
}
