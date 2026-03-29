'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from '../ui/public/LanguageSwitcher';
import Logo from '../brand/Logo';

const translations = {
  en: {
    navigation: {
      home: 'Home',
      about: 'About',
      companies: 'Companies',
      services: 'Services',
      projects: 'Projects',
      blog: 'Blog',
      contact: 'Contact',
    },
    header: {
      cta: 'Get in Touch',
      menu: 'Menu',
      close: 'Close',
    },
  },
  ar: {
    navigation: {
      home: 'الرئيسية',
      about: 'من نحن',
      companies: 'الشركات',
      services: 'الخدمات',
      projects: 'المشاريع',
      blog: 'المدونة',
      contact: 'اتصل بنا',
    },
    header: {
      cta: 'تواصل معنا',
      menu: 'القائمة',
      close: 'إغلاق',
    },
  },
};

export default function Header() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const pathLocale = window.location.pathname.startsWith('/ar') ? 'ar' : 'en';
    setLocale(pathLocale);

    // Set initial scroll state
    setIsScrolled(window.scrollY > 50);

    // Trigger header animation after mount
    const animationTimer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(animationTimer);
    };
  }, []);

  const isRTL = locale === 'ar';
  const t = translations[locale];

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const navItems = [
    { href: '#home', label: t.navigation.home, isSection: true },
    { href: '#about', label: t.navigation.about, isSection: true },
    { href: '#companies', label: t.navigation.companies, isSection: true },
    { href: '#services', label: t.navigation.services, isSection: true },
    { href: '#projects', label: t.navigation.projects, isSection: true },
    { href: `/${locale}/blog`, label: t.navigation.blog },
    { href: '#contact', label: t.navigation.contact, isSection: true },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full will-change-transform transition-all duration-200 ease-out ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg py-3'
            : 'bg-transparent py-5'
        }`}
        style={{ 
          opacity: isAnimated ? 1 : 0,
          transform: isAnimated ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.6s ease-out'
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}`}
              className="flex items-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
              aria-label="Super Arc Group - Home"
              style={{ 
                opacity: isAnimated ? 1 : 0,
                transform: isAnimated ? 'translateX(0)' : 'translateX(-30px)',
                transition: 'all 0.6s ease-out 0.1s'
              }}
            >
              <Logo size="xxxl" className="flex-shrink-0" showBackground={!isScrolled} />
            </Link>

            <nav className="max-xl:hidden xl:flex items-center gap-1" style={{ 
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.6s ease-out 0.2s'
            }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.isSection ? `/${locale}${item.href}` : item.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isScrolled 
                      ? 'text-muted hover:text-primary hover:bg-primary-light focus:ring-primary' 
                      : 'text-white hover:text-white/80 hover:bg-white/10 focus:ring-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4" style={{ 
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateX(0)' : 'translateX(30px)',
              transition: 'all 0.6s ease-out 0.3s'
            }}>
              <LanguageSwitcher textColor={isScrolled ? 'text-muted' : 'text-white'} />
              
              <Link
                href={`/${locale}#contact`}
                className="hidden xl:block bg-secondary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-secondary-dark hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                {t.header.cta}
              </Link>
              
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`xl:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isScrolled 
                    ? 'text-muted hover:bg-primary-light focus:ring-primary' 
                    : 'text-white hover:bg-white/10 focus:ring-white'
                }`}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-text-main/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div 
            className={`fixed top-0 z-[80] h-full w-[320px] bg-white shadow-2xl flex flex-col ${
              isRTL ? 'right-0 animate-sag-slide-in-left' : 'left-0 animate-sag-slide-in-right'
            }`}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <span className="font-bold text-main text-lg">{t.header.menu}</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-muted hover:bg-primary-light rounded-lg transition-colors"
                aria-label={t.header.close}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.isSection ? `/${locale}${item.href}` : item.href}
                  className="px-4 py-3 text-base font-bold text-muted hover:text-primary hover:bg-primary-light rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <Link
                href={`/${locale}#contact`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-secondary-dark hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out text-center block"
              >
                {t.header.cta}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}