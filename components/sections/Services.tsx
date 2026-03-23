'use client';

import { useState, useEffect } from 'react';
import ServiceCard from '../ui/public/ServiceCard';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';
import {
  Building,
  DraftingCompass,
  ClipboardList,
  HardHat,
  Wrench,
  Zap,
  Truck,
  Settings,
  Home,
  Users,
  Lightbulb,
  Factory,
  Building2,
  House
} from 'lucide-react';

// CMS-ready service data structure
const servicesData = [
  {
    icon: Building,
    title: 'General Contracting',
    description: 'Comprehensive construction services covering all aspects of building projects from foundation to completion.',
    titleAr: 'المقاولات العامة',
    descriptionAr: 'خدمات بناء شاملة تغطي جميع جوانب المشاريع من الأساس إلى التسليم النهائي.'
  },
  {
    icon: DraftingCompass,
    title: 'Design & Build',
    description: 'Integrated design and construction solutions that streamline project delivery and ensure design intent.',
    titleAr: 'التصميم والبناء',
    descriptionAr: 'حلول تصميم وبناء متكاملة تبسط تسليم المشاريع وتضمن تحقيق الرؤية التصميمية.'
  },
  {
    icon: ClipboardList,
    title: 'Project Management',
    description: 'Professional project oversight ensuring timely delivery, quality control, and budget management.',
    titleAr: 'إدارة المشاريع',
    descriptionAr: 'إشراف احترافي على المشاريع يضمن التسليم في الوقت المحدد والجودة وإدارة الميزانية.'
  },
  {
    icon: HardHat,
    title: 'Civil Engineering',
    description: 'Expert civil engineering services including infrastructure development and structural solutions.',
    titleAr: 'الهندسة المدنية',
    descriptionAr: 'خدمات هندسة مدنية متخصصة تشمل تطوير البنية التحتية والحلول الإنشائية.'
  },
  {
    icon: Wrench,
    title: 'Mechanical Engineering',
    description: 'Specialized mechanical systems design, installation, and maintenance for industrial facilities.',
    titleAr: 'الهندسة الميكانيكية',
    descriptionAr: 'تصميم وتركيب وصيانة الأنظمة الميكانيكية المتخصصة للمنشآت الصناعية.'
  },
  {
    icon: Zap,
    title: 'Electrical Engineering',
    description: 'Complete electrical systems design, installation, and maintenance for commercial and industrial projects.',
    titleAr: 'الهندسة الكهربائية',
    descriptionAr: 'تصميم وتركيب وصيانة أنظمة كهربائية متكاملة للمشاريع التجارية والصناعية.'
  },
  {
    icon: Truck,
    title: 'Infrastructure Works',
    description: 'Large-scale infrastructure development including roads, utilities, and public works projects.',
    titleAr: 'أعمال البنية التحتية',
    descriptionAr: 'توير البنية التحتية على نطاق واسع يشمل الطرق والمرافق ومشاريع الأشغال العامة.'
  },
  {
    icon: Settings,
    title: 'MEP Works',
    description: 'Mechanical, Electrical, and Plumbing services providing integrated building systems solutions.',
    titleAr: 'أعمال MEP',
    descriptionAr: 'خدمات ميكانيكية وكهربائية وسباكة توفر حلول أنظمة المباني المتكاملة.'
  },
  {
    icon: Home,
    title: 'Renovation & Maintenance',
    description: 'Professional renovation and maintenance services to preserve and enhance existing structures.',
    titleAr: 'التجديد والصيانة',
    descriptionAr: 'خدمات تجديد وصيانة احترافية للحفاظ على المباني القائمة وتحسينها.'
  },
  {
    icon: Users,
    title: 'Construction Management',
    description: 'Expert construction oversight coordinating all project stakeholders and resources efficiently.',
    titleAr: 'إدارة البناء',
    descriptionAr: 'إشراف بناء خبير ينسق جميع أصحاب المصلحة وموارد المشروع بكفاءة.'
  },
  {
    icon: Lightbulb,
    title: 'Technical Consulting',
    description: 'Specialized technical consulting providing expert guidance for complex engineering challenges.',
    titleAr: 'الاستشارات الفنية',
    descriptionAr: 'استشارات فنية متخصصة تقدم إرشادات خبراء للتحديات الهندسية المعقدة.'
  },
  {
    icon: Factory,
    title: 'Industrial Projects',
    description: 'Specialized construction and engineering services for industrial facilities and manufacturing plants.',
    titleAr: 'المشاريع الصناعية',
    descriptionAr: 'خدمات بناء وهندسة متخصصة للمنشآت الصناعية ومصانع التصنيع.'
  },
  {
    icon: Building2,
    title: 'Commercial Projects',
    description: 'Commercial construction services delivering retail, office, and business facilities.',
    titleAr: 'المشاريع التجارية',
    descriptionAr: 'خدمات بناء تجاري توفر مرافق البيع بالتجزئة والمكاتب والمنشآت التجارية.'
  },
  {
    icon: House,
    title: 'Residential Projects',
    description: 'Residential construction expertise creating quality housing developments and living spaces.',
    titleAr: 'المشاريع السكنية',
    descriptionAr: 'خبرة بناء سكني تخلق تطورات سكنية عالية الجودة ومساحات معيشية.'
  }
];

const translations = {
  en: {
    sectionLabel: 'Our Services',
    title: 'Comprehensive Engineering & Contracting Solutions',
    description: 'Super Arc Group delivers a wide spectrum of integrated engineering, contracting, and development services designed to meet complex project requirements across multiple sectors.'
  },
  ar: {
    sectionLabel: 'خدماتنا',
    title: 'حلول هندسية وإنشائية متكاملة',
    description: 'تقدم مجموعة سوبر آرك مجموعة واسعة من الخدمات الهندسية والإنشائية المتكاملة المصممة لتلبية متطلبات المشاريع المعقدة في مختلف القطاعات.'
  }
};

export default function Services() {
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

  return (
    <section id="services" ref={setElement} className="py-20 bg-gradient-to-br from-bg-light to-white">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-light to-primary-light text-primary rounded-full text-sm font-semibold mb-8 border border-primary/20 shadow-sm" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
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
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {servicesData.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={isRTL ? service.titleAr : service.title}
              description={isRTL ? service.descriptionAr : service.description}
              disabled={false}
              className={`h-full ${
                // Center the last two cards side-by-side in the final row on XL screens
                index === 12 ? 'xl:col-start-2' : ''
              }`}
              style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.6s' }}
            />
          ))}
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
