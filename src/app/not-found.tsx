'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);

  const content = {
    en: {
      title: 'Page Not Found',
      subtitle: 'Oops! The page you\'re looking for doesn\'t exist.',
      description: 'The page you are trying to access might have been removed, had its name changed, or is temporarily unavailable.',
      buttonText: 'Go Back Home',
      helpfulLinks: 'Helpful Links',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Who We Are', href: '/who-we-are' },
        { label: 'Services', href: '/services' },
        { label: 'Projects', href: '/projects' },
        { label: 'Blog', href: '/blog' },
        { label: 'Our Clients', href: '/clients' },
        { label: 'Contact', href: '/contact' }
      ]
    },
    ar: {
      title: 'الصفحة غير موجودة',
      subtitle: 'عذراً! الصفحة التي تبحث عنها غير موجودة.',
      description: 'الصفحة التي تحاول الوصول إليها قد تم حذفها، أو تغير اسمها، أو غير متاحة مؤقتاً.',
      buttonText: 'العودة للرئيسية',
      helpfulLinks: 'روابط مفيدة',
      links: [
        { label: 'الرئيسية', href: '/' },
        { label: 'من نحن', href: '/who-we-are' },
        { label: 'الخدمات', href: '/services' },
        { label: 'المشاريع', href: '/projects' },
        { label: 'المدونة', href: '/blog' },
        { label: 'عملاؤنا', href: '/clients' },
        { label: 'اتصل بنا', href: '/contact' }
      ]
    }
  };

  useEffect(() => {
    setMounted(true);
    const pathname = window.location.pathname;
    
    if (pathname.startsWith('/ar')) {
      setLocale('ar');
    } else if (pathname.startsWith('/en')) {
      setLocale('en');
    } else {
      setLocale('en');
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const t = content[locale];
  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
        </div>

        {/* Error Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className={`text-3xl font-bold text-text-main mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.title}
          </h2>
          
          <p className={`text-xl text-text-muted mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.subtitle}
          </p>
          
          <p className={`text-text-muted mb-8 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.description}
          </p>

          {/* Action Button */}
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium"
          >
            {isRTL ? (
              <>
                {t.buttonText}
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t.buttonText}
              </>
            )}
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className={`text-lg font-semibold text-text-main mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.helpfulLinks}
          </h3>
          
          <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.links.map((link, index) => (
              <Link
                key={index}
                href={link.href.startsWith('#') ? `/${locale}${link.href}` : link.href.startsWith('/') ? `/${locale}${link.href}` : `/${locale}/${link.href}`}
                className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-text-muted text-sm">
            {locale === 'en' 
              ? 'If you believe this is an error, please contact our support team.'
              : 'إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع فريق الدعم.'
            }
          </p>
          <a 
            href="mailto:info@superarc.net" 
            className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium mt-2 inline-block"
          >
            info@superarc.net
          </a>
          <p className="text-text-muted text-sm mt-2">
            {locale === 'en' 
              ? (
                <>
                  <a href="tel:+971 547 2020 14" className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium">
                    +971 547 2020 14
                  </a> | <a href="tel:+963 947 964 829" className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium">
                    +963 947 964 829
                  </a>
                </>
              )
              : (
                <>
                  <a href="tel:+971 547 2020 14" className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium">
                    +971 547 2020 14
                  </a> | <a href="tel:+963 947 964 829" className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium">
                    +963 947 964 829
                  </a>
                </>
              )
            }
          </p>
        </div>
      </div>
    </div>
  );
}
