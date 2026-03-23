'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from '../../../src/contexts/TranslationContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import LanguageSwitcher from '../layout/LanguageSwitcher';

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
  sidebarPosition?: 'left' | 'right';
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onMenuClick, sidebarPosition = 'left' }) => {
  const router = useRouter();
  const { t, locale } = useTranslations();
  const { logout } = useAuth();
  const isRightSidebar = sidebarPosition === 'right';
  const isRTL = locale === 'ar';

  const handleLogout = () => {
    // Clear auth tokens and redirect to login
    logout();
    
    // Remove admin-page class and show public header/footer
    document.body.classList.remove('admin-page');
    
    const showPublicElements = () => {
      const publicHeader = document.querySelector('header.fixed.top-0.left-0.right-0') as HTMLElement;
      const publicFooter = document.querySelector('footer') as HTMLElement;
      const headerSpacer = document.querySelector('div[style*="height: 80px"]') as HTMLElement;
      
      if (publicHeader) publicHeader.style.display = '';
      if (publicFooter) publicFooter.style.display = '';
      if (headerSpacer) headerSpacer.style.display = '';
    };
    
    showPublicElements();
    
    // Redirect to login immediately (login page will handle showing header/footer)
    router.push(`/${locale}/admin/auth`);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[72px] sm:h-16">
          {/* Left side - Mobile menu button and page title */}
          <div className="flex items-center flex-1 min-w-0">
            {/* Mobile menu button - always on left for both LTR and RTL */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page title - responsive sizing and truncation */}
            <h1 className={`ml-3 lg:ml-0 text-lg sm:text-xl lg:text-2xl font-bold text-main truncate ${isRightSidebar ? 'order-last' : ''}`}>
              {title}
            </h1>
          </div>

          {/* Right side - User name, logout, and language switcher */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 sm:space-x-4 flex-shrink-0`}>
            {/* Language Switcher - smaller on mobile */}
            <div className="scale-90 sm:scale-100">
              <LanguageSwitcher />
            </div>

            {/* User name - no avatar */}
            <span className="hidden md:block text-sm font-medium text-main px-2">
              {locale === 'ar' ? 'المسؤول' : 'Admin'}
            </span>

            {/* Logout button - icon only on mobile, full on larger screens */}
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-2 sm:px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 flex-shrink-0"
            >
              <svg className={`w-4 h-4 ${isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">{t('admin.header.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
