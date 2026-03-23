'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from '../../../src/contexts/TranslationContext';

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useTranslations();

  const handleLanguageChange = (newLocale: string) => {
    // Update the locale in the translation context
    setLocale(newLocale);
    
    // Navigate to the same page with the new locale
    const currentPath = pathname.replace(/^\/(en|ar)/, '');
    router.push(`/${newLocale}${currentPath}`);
  };

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
          locale === 'en'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
          locale === 'ar'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
