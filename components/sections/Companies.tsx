'use client';

import { useState, useEffect } from 'react';
import { companiesService, Company } from '../../src/services/entities/companies.service';
import { useRouter } from 'next/navigation';

const translations = {
  en: {
    sectionLabel: 'Super Arc Group',
    title: 'Our Companies',
    description: 'Super Arc Group operates through specialized subsidiaries that collectively deliver comprehensive engineering, contracting, and development solutions.',
    viewCompany: 'View Company'
  },
  ar: {
    sectionLabel: 'مجموعة سوبر آرك',
    title: 'شركاتنا',
    description: 'تعمل مجموعة سوبر آرك من خلال شركات متخصصة تتكامل فيما بينها لتقديم حلول هندسية وإنشائية وتطويرية شاملة.',
    viewCompany: 'عرض الشركة'
  }
};

export default function Companies() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [screenSize, setScreenSize] = useState('mobile');
  const router = useRouter();

  const isRTL = locale === 'ar';
  const t = translations[locale];

  useEffect(() => {
    setMounted(true);
    const pathname = window.location.pathname;
    
    // Extract locale from pathname
    if (pathname.startsWith('/ar')) {
      setLocale('ar');
    } else if (pathname.startsWith('/en')) {
      setLocale('en');
    } else {
      // Default to English for root path or any other path
      setLocale('en');
    }

    // Fetch companies from API
    fetchCompanies();

    // Track screen size
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Use the public method to fetch published companies (no authentication required)
      const companiesData = await companiesService.getPublishedCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('companies');
      if (element) {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.8;
        if (isInView && !isVisible) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  const handleCompanyClick = (slug: string) => {
    router.push(`/${locale}/companies/${slug}`);
  };

  // Unique interactive carousel with auto-play - modern and professional
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextCompany = () => {
    setActiveIndex((prev) => (prev + 1) % companies.length);
  };
  
  const prevCompany = () => {
    setActiveIndex((prev) => (prev - 1 + companies.length) % companies.length);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      nextCompany();
    }, 4000); // Change every 4 seconds
    
    return () => clearInterval(interval);
  }, [isVisible, activeIndex]); // Reset interval when activeIndex changes manually

  if (!mounted || loading) {
    return (
      <section className="relative py-24 bg-gradient-to-br from-white via-bg-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto mb-8"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-bg-light to-white scroll-mt-32">
      <div id="companies" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 border-[1px] rounded-full px-4 py-2 backdrop-blur-[16px] mb-2" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">
              {t.sectionLabel}
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
            {t.title}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-secondary rounded-full"></div>
          </h3>
          <p 
            className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed mt-8"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
              transition: 'all 0.8s ease-out 0.4s' 
            }}
          >
            {t.description}
          </p>
        </div>
      </div>

      {/* Unique Interactive Carousel */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevCompany}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-gradient-to-br from-green-800 via-green-700 to-green-800 rounded-full shadow-2xl flex items-center justify-center hover:from-green-600 hover:to-green-500 transition-all duration-300 border-2 border-white/50 hover:scale-110 hover:shadow-3xl hover:border-white/80 ${
              isRTL ? 'right-0 translate-x-4' : 'left-0 -translate-x-4'
            } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transition: 'all 1s ease-out 0.6s' }}
          >
            <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
          
          <button
            onClick={nextCompany}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-gradient-to-br from-green-800 via-green-700 to-green-800 rounded-full shadow-2xl flex items-center justify-center hover:from-green-600 hover:to-green-500 transition-all duration-300 border-2 border-white/50 hover:scale-110 hover:shadow-3xl hover:border-white/80 ${
              isRTL ? 'left-0 -translate-x-4' : 'right-0 translate-x-4'
            } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transition: 'all 1s ease-out 0.6s' }}
          >
            <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>

          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-md p-8 shadow-2xl border border-white/20" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.6s' }}>
            <div className="relative h-96 flex items-center justify-center">
                {companies.map((company, index) => {
                const isActive = index === activeIndex;
                const isPrev = index === (activeIndex - 1 + companies.length) % companies.length;
                const isNext = index === (activeIndex + 1) % companies.length;
                
                // For RTL, reverse the positioning logic
                const positionMultiplier = isRTL ? -1 : 1;
                
                return (
                  <div
                    key={company.id}
                    onClick={() => handleCompanyClick(company.slug)}
                    className={`absolute cursor-pointer transition-all duration-500 ease-out ${
                      isActive 
                        ? 'scale-100 opacity-100 z-10' 
                        : isPrev || isNext 
                        ? 'scale-75 opacity-60 z-5' 
                        : 'scale-50 opacity-30 z-0'
                    }`}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: `translate(calc(-50% + ${(index - activeIndex) * (screenSize === 'mobile' ? 80 : screenSize === 'tablet' ? 100 : 120) * positionMultiplier}%), -50%) ${isActive ? 'scale(1)' : isPrev || isNext ? 'scale(0.75)' : 'scale(0.5)'}`,                      left: '50%',
                    }}
                  >
                    <div className={`relative bg-gradient-to-br from-white to-green-900/20 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'border-2 border-green-800 shadow-xl ring-2 ring-green-900/30 transform scale-105' 
                        : 'border-2 border-green-700/50 hover:border-green-800 shadow-lg'
                    } p-4 sm:p-6 md:p-8 w-72 sm:w-80 md:w-96`}>
                      <div className="relative z-10">
                        <div className="relative mb-6">
                          <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-br from-green-800 via-green-700 to-green-800 shadow-xl transform scale-105' 
                              : 'bg-gradient-to-br from-green-700/60 to-green-800/60'
                          }`}>
                            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-white to-green-900/20 rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
                              {company.image && (
                              <img
                                src={company.image.url}
                                alt={locale === 'ar' ? company.image.alt_ar : company.image.alt_en}
                                className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain transition-all duration-300 ${
                                  isActive ? 'scale-110' : 'scale-100'
                                }`}
                              />
                            )}
                            </div>
                          </div>
                          
                          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white font-bold px-4 py-2 rounded-full shadow-xl transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-r from-green-800 via-green-700 to-green-800 transform scale-105 shadow-2xl' 
                              : 'bg-gradient-to-r from-green-700 to-green-800'
                          }`}>
                            {company.name.en.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('').substring(0, 3)}
                          </div>
                        </div>
                        
                        <h3 className={`text-xl font-bold text-center mb-4 transition-all duration-300 ${
                          isActive ? 'text-main transform scale-105' : 'text-muted'
                        }`}>
                          {company.name[locale] || company.name.en}
                        </h3>
                        
                        <div className="flex justify-center">
                          <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-r from-green-800 via-green-700 to-green-800 text-white shadow-xl hover:shadow-2xl transform scale-105' 
                              : 'bg-gradient-to-r from-green-700/60 to-green-800/60 text-gray-700 hover:from-green-700 hover:to-green-800'
                          }`}>
                            <span>{t.viewCompany}</span>
                            <svg
                              className={`w-4 h-4 transition-transform duration-300 hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Progress Indicators */}
            <div className={`flex justify-center mt-6 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              {companies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'w-8 bg-gradient-to-r from-green-800 via-green-700 to-green-800 shadow-lg' 
                      : 'bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
