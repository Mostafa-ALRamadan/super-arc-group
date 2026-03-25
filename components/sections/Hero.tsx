'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Building2, Globe, TrendingUp } from 'lucide-react';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';

const translations = {
  en: {
    title: "Regional Expertise. International Standards. Global Vision.",
    subtitle: "Super Arc Group delivers integrated engineering, contracting, and property development solutions backed by more than four decades of expertise.",
    primaryCta: "Explore Our Projects",
    secondaryCta: "Contact Us",
  },
  ar: {
    title: "خبرات إقليمية. معايير دولية. رؤية عالمية.",
    subtitle: "تقدم مجموعة سوبر آرك حلولاً متكاملة في الاستشارات الهندسية والمقاولات وتطوير العقارات مدعومة بخبرة تتجاوز أربعة عقود.",
    primaryCta: "استكشف مشاريعنا",
    secondaryCta: "تواصل معنا",
  },
};

export default function Hero() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const { isVisible, setElement } = useScrollAnimation(0.1);

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
  }, []);

  if (!mounted) {
    return null;
  }

  const isRTL = locale === 'ar';
  const t = translations[locale];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80; // Match the scroll-margin-top
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section ref={setElement} className="min-h-screen relative overflow-hidden bg-gradient-to-br from-bg-light via-white to-primary-light">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Abstract Visual Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 ${isRTL ? 'left-10' : 'right-10'} w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse`} />
        <div className={`absolute bottom-20 ${isRTL ? 'right-10' : 'left-10'} w-96 h-96 bg-primary-dark/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse`} style={{ animationDelay: '2s' }} />
        <div className={`absolute top-1/2 ${isRTL ? 'left-1/2' : 'right-1/2'} transform -translate-y-1/2 ${isRTL ? 'translate-x-1/2' : '-translate-x-1/2'} w-80 h-80 bg-primary/15 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse`} style={{ animationDelay: '4s' }} />
        <div className={`absolute bottom-10 ${isRTL ? 'left-10' : 'right-10'} w-96 h-96 bg-primary-dark/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse max-w-[40vw] max-h-[40vw]`} style={{ animationDelay: '6s' }} />
        <div className={`absolute top-10 ${isRTL ? 'right-10' : 'left-10'} w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse max-w-[35vw] max-h-[35vw]`} style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            
            {/* ENGLISH: Text first, ARABIC: Text first */}
            <div className={`${isRTL ? 'md:text-right' : 'md:text-left'} text-center flex-1`}>
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary rounded-full text-sm font-medium" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
                  <Building2 className="w-4 h-4" />
                  <span>{!isRTL ? '40+ Years of Excellence' : 'أكثر من 40 عامًا من التميز'}</span>
                </div>

                {/* Main Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-main leading-tight" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.2s' }}>
                  {t.title}
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto md:mx-0 leading-relaxed" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.4s' }}>
                  {t.subtitle}
                </p>

                {/* CTA Buttons */}
                <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? '!md:justify-end' : '!md:justify-start'}`} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.6s' }}>
                  <Link
                    href="#projects"
                    onClick={(e) => handleSmoothScroll(e, 'projects')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg hover:bg-primary-dark transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {t.primaryCta}
                    {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  </Link>
                  
                  <Link
                    href="#contact"
                    onClick={(e) => handleSmoothScroll(e, 'contact')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl border-2 border-primary hover:bg-primary-light transition-all duration-300 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {t.secondaryCta}
                    {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className={`flex items-center gap-8 pt-8 ${isRTL ? '!md:justify-end' : '!md:justify-start'}`} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.8s' }}>
                  <div className="flex items-center gap-2 text-muted">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{!isRTL ? 'Global Reach' : 'وصول عالمي'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{!isRTL ? 'Proven Excellence' : 'تميز مثبت'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ENGLISH: Visual second, ARABIC: Visual second */}
            <div className="flex items-center justify-center flex-1">
              <div className="relative w-full max-w-md" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.6s' }}>
                {/* Main Abstract Graphic */}
                <div className="relative">
                  {/* Background Circle */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-primary-light rounded-3xl transform rotate-6"></div>
                  
                  {/* Content */}
                  <div className="relative bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-90">
                    <div className="space-y-6">
                      {/* Icon Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center justify-center p-3 bg-primary-light rounded-xl">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center justify-center p-3 bg-primary-light rounded-xl">
                          <Globe className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center justify-center p-3 bg-primary-light rounded-xl">
                          <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-main">40+</div>
                          <div className="text-sm text-muted">{!isRTL ? 'Years Experience' : 'سنة خبرة'}</div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-main">500+</div>
                          <div className="text-sm text-muted">{!isRTL ? 'Projects Completed' : 'مشاريع مكتملة'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className={`absolute -top-4 ${isRTL ? '-right-4' : '-left-4'} w-8 h-8 bg-primary-dark rounded-full shadow-lg`}></div>
                  <div className={`absolute -bottom-2 ${isRTL ? '-left-2' : '-right-2'} w-6 h-6 bg-primary rounded-full shadow-lg`}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
