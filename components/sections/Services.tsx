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
    <section ref={setElement} className="py-20 bg-gradient-to-br from-bg-light to-white scroll-mt-32">
      <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
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

      {/* On-The-Ground Execution Section - Different Style */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-br from-white via-[#DAA424]/5 to-gray-50 rounded-2xl p-8 sm:p-12 lg:p-16 shadow-xl border border-[#DAA424]/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Title and Description */}
            <div className={`text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DAA424]/10 rounded-full mb-4 mx-auto lg:mx-0" style={{ marginLeft: isRTL ? 'auto' : 0, marginRight: isRTL ? 0 : 'auto' }}>
                <div className="w-1.5 h-1.5 bg-[#DAA424] rounded-full"></div>
                <span className="text-xs font-semibold text-[#DAA424] uppercase tracking-wider">
                  {isRTL ? 'تنفيذ' : 'Execution'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
                {isRTL ? 'التنفيذ على أرض الواقع' : 'On-The-Ground Execution'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {isRTL 
                  ? 'تدير مجموعة Super Arc Group أسطولاً شاملاً من المعدات الثقيلة والمتخصصة، مما يتيح التنفيذ الكامل للمشاريع بكفاءة عالية وسيطرة كاملة على الجودة والجدول الزمني والتكلفة. نهجنا المتكامل يضمن التسليم السلس من المفهوم إلى الإنجاز.'
                  : 'Super Arc Group operates a comprehensive fleet of heavy and specialized equipment, enabling fully self-performed project execution with high efficiency and full control over quality, schedule, and cost. Our integrated approach ensures seamless delivery from concept to completion.'
                }
              </p>
            </div>

            {/* Right Side - Features Grid */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Full In-House Execution - Top Left */}
                <div className="text-center border-2 border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 hover:border-[#DAA424] hover:scale-105">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {isRTL ? 'كامل' : 'Full'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {isRTL ? 'التنفيذ الداخلي' : 'In-House Execution'}
                  </p>
                </div>

                {/* ISO - Top Right */}
                <div className="text-center border-2 border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 hover:border-[#DAA424] hover:scale-105">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">ISO</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {isRTL ? 'معايير معتمدة' : 'Certified Standards'}
                  </p>
                </div>

                {/* HSE - Bottom Left */}
                <div className="text-center border-2 border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 hover:border-[#DAA424] hover:scale-105">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">HSE</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {isRTL ? 'الامتثال' : 'Compliance'}
                  </p>
                </div>

                {/* QA/QC - Bottom Right */}
                <div className="text-center border-2 border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 hover:border-[#DAA424] hover:scale-105">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">QA/QC</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {isRTL ? 'ضمان الجودة' : 'Assurance'}
                  </p>
                </div>
              </div>
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
