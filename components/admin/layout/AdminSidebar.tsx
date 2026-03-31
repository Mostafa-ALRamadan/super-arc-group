'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from '../../../src/contexts/TranslationContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose, position = 'left' }) => {
  const pathname = usePathname();
  const isRight = position === 'right';
  const { t, locale } = useTranslations();
  
  const navigation = [
    { name: t('admin.sidebar.dashboard'), href: `/${locale}/admin`, icon: '📊' },
    { name: t('admin.sidebar.blogPosts'), href: `/${locale}/admin/blog`, icon: '📝' },
    { name: t('admin.sidebar.projects'), href: `/${locale}/admin/projects`, icon: '🏗️' },
    { name: t('admin.sidebar.companies'), href: `/${locale}/admin/companies`, icon: '🏢' },
    { name: t('admin.sidebar.employees'), href: `/${locale}/admin/employees`, icon: '👥' },
    { name: t('admin.sidebar.leadership'), href: `/${locale}/admin/leadership`, icon: '👔' },
    { name: t('admin.sidebar.categories'), href: `/${locale}/admin/categories`, icon: '🏷️' },
    { name: t('admin.settings.title'), href: `/${locale}/admin/settings`, icon: '⚙️' }
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href || pathname === `${href}/`;
    }
    return pathname.startsWith(href);
  };

  // Position classes for mobile and desktop
  const mobilePositionClasses = isRight 
    ? 'fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden'
    : 'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden';
  
  const desktopPositionClasses = isRight ? 'right-0 border-l border-gray-700' : 'left-0 border-r border-gray-700';

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`
        ${mobilePositionClasses}
        ${isOpen ? 'translate-x-0' : isRight ? 'translate-x-full' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <span className={`text-xl font-bold text-gray-900`}>
            {locale === 'ar' ? 'المسؤول' : 'Admin'}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors duration-150
                  ${isActive(item.href)
                    ? 'bg-primary-light text-primary border-r-2 border-primary'
                    : 'text-muted hover:bg-primary-light hover:text-primary'
                  }
                `}
              >
                <span className={`${isRight ? 'ml-3' : 'mr-3'} text-lg`}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className={`fixed inset-y-0 z-50 hidden lg:block w-64 bg-text-main ${desktopPositionClasses} shadow-xl`}>
        <div className="flex items-center h-16 px-6 border-b border-text-main/80">
          <span className={`text-xl font-bold text-white`}>
            {locale === 'ar' ? 'المسؤول' : 'Admin'}
          </span>
        </div>

        <nav className="mt-8">
          <div className="px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors duration-150
                  ${isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-text-main/80 hover:text-white'
                  }
                `}
              >
                <span className={`${isRight ? 'ml-3' : 'mr-3'} text-lg`}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
