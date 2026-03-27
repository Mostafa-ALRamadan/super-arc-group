'use client';

import { useState, useEffect } from 'react';
import StatCard from '../ui/public/StatCard';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';

const translations = {
  en: {
    sectionLabel: 'About Super Arc Group',
    title: 'More Than Four Decades of Engineering Excellence',
    description: 'Super Arc Group is a multidisciplinary organization specializing in engineering consultancy, contracting, and real estate development. With over 40 years of regional experience, the group has built a strong reputation for delivering high-quality, reliable, and innovative solutions across diverse sectors.',
    stats: {
      experience: '40+ Years Experience',
      companies: 'Multiple Specialized Companies',
      portfolio: 'Regional Project Portfolio',
      standards: 'International Standards'
    },
    numbers: {
      experience: '40+',
      companies: 'Multiple',
      portfolio: 'Regional',
      standards: 'International'
    }
  },
  ar: {
    sectionLabel: 'عن مجموعة سوبر آرك',
    title: 'أكثر من أربعة عقود من التميز الهندسي',
    description: 'تُعد مجموعة سوبر آرك مؤسسة متعددة التخصصات متخصصة في الاستشارات الهندسية والمقاولات وتطوير العقارات. وبخبرة إقليمية تتجاوز 40 عاماً، اكتسبت المجموعة سمعة قوية في تقديم حلول عالية الجودة وموثوقة ومبتكرة عبر قطاعات متنوعة.',
    stats: {
      experience: 'أكثر من 40 عاماً من الخبرة',
      companies: 'عدة شركات متخصصة', 
      portfolio: 'محفظة مشاريع إقليمية',
      standards: 'معايير دولية'
    },
    numbers: {
      experience: '40+',
      companies: 'متعددة',
      portfolio: 'إقليمية',
      standards: 'دولية'
    }
  }
};

export default function About() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const { isVisible, setElement } = useScrollAnimation(0.1);

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
  }, []);

  if (!mounted) {
    return null;
  }

  const stats = [
    { number: t.numbers.experience, label: t.stats.experience },
    { number: t.numbers.companies, label: t.stats.companies },
    { number: t.numbers.portfolio, label: t.stats.portfolio },
    { number: t.numbers.standards, label: t.stats.standards }
  ];

  return (
    <section id="about" ref={setElement} className="py-20 bg-gradient-to-br from-bg-light to-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary rounded-full text-sm font-medium mb-6" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
            <span>{t.sectionLabel}</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-main max-w-5xl mx-auto leading-tight mb-10 tracking-tight" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.2s' }}>
            <span className="bg-gradient-to-br from-text-main via-text-main to-text-main bg-clip-text text-transparent">
              {t.title}
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-muted max-w-4xl mx-auto leading-relaxed font-medium" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.4s' }}>
            {t.description}
          </p>
        </div>

        {/* Content Grid */}
        <div className="flex flex-col items-center">
          {/* Stats Grid */}
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  number={stat.number}
                  label={stat.label}
                  style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.6s' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
