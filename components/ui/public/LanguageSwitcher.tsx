'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSwitcher({ textColor = 'text-main' }: { textColor?: string }) {
  const [currentLocale, setCurrentLocale] = useState('en');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine hover background based on text color
  const hoverBg = textColor === 'text-white' ? 'hover:bg-white/10' : 'hover:bg-primary-light';

  useEffect(() => {
    setMounted(true);
    const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
    setCurrentLocale(locale);
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  // Show the NEXT language, not the current one
  const nextLanguage = currentLocale === 'en' 
    ? languages.find(lang => lang.code === 'ar') 
    : languages.find(lang => lang.code === 'en');

  const handleLanguageToggle = () => {
    const newLocale = currentLocale === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(/^\/(en|ar)/, `/${newLocale}`);
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${newPath}?${queryString}` : newPath;
    router.push(fullUrl);
  };

  return (
    <div className="relative">
      <button
        onClick={handleLanguageToggle}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${textColor} ${hoverBg} rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
        aria-label="Toggle language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{nextLanguage?.flag}</span>
        <span className="hidden md:inline">{nextLanguage?.name}</span>
      </button>
    </div>
  );
}