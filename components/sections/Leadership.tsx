'use client';

import { useState, useEffect } from 'react';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';

const translations = {
  en: {
    title: "Our Leadership",
    subtitle: "Meet the visionaries behind Super Arc Group",
    description: "Our leadership team brings decades of combined experience in engineering, construction, and business development.",
    comingSoon: "Leadership team profiles coming soon...",
  },
  ar: {
    title: "قيادتنا",
    subtitle: "تعرّف على القادة وراء مجموعة سوبر آرك",
    description: "فريق قيادتنا يجلب عقوداً من الخبرة المشتركة في الهندسة والبناء وتطوير الأعمال.",
    comingSoon: "ملفات فريق القيادة قريباً...",
  },
};

export default function Leadership() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const { isVisible, setElement } = useScrollAnimation(0.1);

  useEffect(() => {
    const pathname = window.location.pathname;
    
    if (pathname.startsWith('/ar')) {
      setLocale('ar');
    } else if (pathname.startsWith('/en')) {
      setLocale('en');
    } else {
      setLocale('en');
    }
  }, []);

  const t = translations[locale];
  const isRTL = locale === 'ar';

  return (
    <section 
      ref={setElement}
      className="py-20 bg-gray-50 scroll-mt-20"
    > 
      <div id="leadership" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 border-[1px] rounded-full px-4 py-2 backdrop-blur-[16px] mb-2" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">
              {t.title}
            </span>
          </div>
          <h3 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 relative"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
              transition: 'all 0.8s ease-out 0.2s' 
            }}
          >
            {t.subtitle}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-secondary rounded-full"></div>
          </h3>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center py-20" style={{ 
          opacity: isVisible ? 1 : 0, 
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)', 
          transition: 'all 1s ease-out 0.4s' 
        }}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-main mb-4">
            {t.comingSoon}
          </h3>
          <p className="text-muted max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>
      </div>
    </section>
  );
}
