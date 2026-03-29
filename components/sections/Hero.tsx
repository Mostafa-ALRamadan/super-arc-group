'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Building2, Globe, TrendingUp, Drill, HardHat } from 'lucide-react';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';

const translations = {
  en: {
    title: "Regional Expertise. International Standards. Global Vision.",
    subtitle: "Building Tomorrow's Infrastructure Today",
    description: "Super Arc Group is a regional engineering powerhouse delivering world-class consultancy, deep foundations, drilling, property development, and contracting services across the Middle East.",
    primaryCta: "Explore Our Services",
    secondaryCta: "Contact Us",
    superArcConsultants: "Super Arc Consultants",
    engineeringConsultancy: "Engineering Consultancy",
    saecFoundations: "SAEC Foundations",
    deepFoundations: "Deep Foundations & Piling",
    alShallalDrilling: "Al Shallal Drilling",
    waterOilWells: "Water & Oil Wells",
  },
  ar: {
    title: "خبرات إقليمية. معايير دولية. رؤية عالمية.",
    subtitle: "بناء بنية الغد اليوم",
    description: "مجموعة سوبر آرك هي قوة هندسية إقليمية تقدم استشارات عالمية المستوى، وأساسات عميقة، وحفر، وتطوير عقارات، وخدمات مقاولات في جميع أنحاء الشرق الأوسط.",
    primaryCta: "استكشف خدماتنا",
    secondaryCta: "تواصل معنا",
    superArcConsultants: "مستشارو سوبر آرك",
    engineeringConsultancy: "الاستشارات الهندسية",
    saecFoundations: "SAEC للأساسات",
    deepFoundations: "الأساسات العميقة والركائز",
    alShallalDrilling: "الشلال للحفر",
    waterOilWells: "آبار المياه والنفط",
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
    <>
      <section 
        ref={setElement} 
        className="lg:h-screen relative overflow-hidden pt-5"
        style={{
          backgroundImage: 'url(/images/hero-bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      {/* Dark Green Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(rgba(19, 57, 46, 0.85) 0%, rgba(28, 74, 60, 0.9) 100%)'
        }}
      ></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 lg:min-h-screen flex items-center py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32 lg:py-0">
          {/* Small Tag */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-3 border-[1px] rounded-full px-4 py-2 backdrop-blur-[16px]" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
              {/* Golden dot */}
              <div className="w-2 h-2 bg-secondary rounded-full" style={{
                  animation: 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
              <span className="text-xs font-medium text-white uppercase tracking-wider">
                {t.title}
              </span>
            </div>
          </div>

          <div className="text-center space-y-12">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.2s' }}>
              {t.subtitle}
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.4s' }}>
              {t.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.6s' }}>
              <Link
                href="#services"
                onClick={(e) => handleSmoothScroll(e, 'services')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white font-semibold rounded-lg shadow-lg hover:bg-secondary-dark transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                {t.primaryCta}
                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </Link>
              
              <Link
                href="#contact"
                onClick={(e) => handleSmoothScroll(e, 'contact')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary-dark transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {t.secondaryCta}
                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </Link>
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.8s' }}>
              
              {/* Super Arc Consultants Card */}
              <div className="border-[1px] rounded-lg p-6 backdrop-blur-[16px] transition-all duration-300 hover:scale-105" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a' }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t.superArcConsultants}</h3>
                  <p className="text-white">{t.engineeringConsultancy}</p>
                </div>
              </div>

              {/* SAEC Foundations Card */}
              <div className="border-[1px] rounded-lg p-6 backdrop-blur-[16px] transition-all duration-300 hover:scale-105" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a' }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HardHat className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t.saecFoundations}</h3>
                  <p className="text-white">{t.deepFoundations}</p>
                </div>
              </div>

              {/* Al Shallal Drilling Card */}
              <div className="border-[1px] rounded-lg p-6 backdrop-blur-[16px] transition-all duration-300 hover:scale-105" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a' }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Drill className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t.alShallalDrilling}</h3>
                  <p className="text-white">{t.waterOilWells}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <style jsx>{`
      @keyframes pulse-gold {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(1.2);
        }
      }
    `}</style>
    </>
  );
}
