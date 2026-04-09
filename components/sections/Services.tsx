'use client';

import { useState, useEffect } from 'react';
import ServiceCard from '../ui/public/ServiceCard';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';
import {
  DraftingCompass,
  Building,
  ClipboardList,
  HardHat,
  Wrench,
  Truck,
  Drill,
  Zap,
  Shield,
  Activity,
  Construction,
  Trees,
  Building2,
  Hammer,
  Home,
  DollarSign,
  FileText,
  Users
} from 'lucide-react';

export default function Services() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { isVisible, setElement } = useScrollAnimation(0.1);
const servicesData = [
  {
    icon: DraftingCompass,
    title: 'Engineering Consultancy',
    description: 'Providing integrated engineering solutions including studies, design, and supervision to deliver projects to the highest standards.',
    titleAr: 'الاستشارات الهندسية',
    descriptionAr: 'تقديم حلول هندسية متكاملة تشمل الدراسات والتصاميم والإشراف لضمان تنفيذ المشاريع بأعلى المعايير.'
  },
  {
    icon: Building,
    title: 'Architectural, Structural & Geotechnical Design',
    description: 'Delivering integrated architectural, structural, and geotechnical designs that ensure safety, efficiency, and project suitability.',
    titleAr: 'التصميم المعماري والإنشائي والجيوتكنيكي',
    descriptionAr: 'إعداد تصاميم هندسية متكاملة تضمن الكفاءة الإنشائية والوظيفية والملاءمة الجيوتقنية للمشاريع.'
  },
  {
    icon: FileText,
    title: 'Technical Studies & Detailed Design',
    description: 'Preparing technical studies and detailed execution drawings to support decision-making and precise implementation.',
    titleAr: 'الدراسات الفنية والتصاميم التفصيلية',
    descriptionAr: 'إعداد الدراسات الفنية والمخططات التنفيذية التفصيلية لدعم اتخاذ القرار والتنفيذ الدقيق.'
  },
  {
    icon: ClipboardList,
    title: 'Engineering Supervision',
    description: 'Supervising site execution to ensure quality, compliance, and adherence to project schedules.',
    titleAr: 'الإشراف الهندسي',
    descriptionAr: 'متابعة تنفيذ الأعمال ميدانياً لضمان الجودة والالتزام بالمواصفات والجداول الزمنية.'
  },
  {
    icon: Users,
    title: 'Project & Construction Management',
    description: 'Managing all project phases from planning to handover while controlling cost, time, and quality.',
    titleAr: 'إدارة المشاريع وإدارة التنفيذ',
    descriptionAr: 'إدارة جميع مراحل المشروع من التخطيط حتى التسليم مع ضبط التكلفة والوقت والجودة.'
  },
  {
    icon: Truck,
    title: 'Roads, Utilities & Infrastructure Development',
    description: 'Delivering roads, utilities, and infrastructure projects that support sustainable growth and future needs.',
    titleAr: 'تطوير الطرق والمرافق والبنية التحتية',
    descriptionAr: 'تنفيذ مشاريع الطرق والمرافق والبنية التحتية بما يدعم التنمية المستدامة والاحتياجات المستقبلية.'
  },
  {
    icon: Building,
    title: 'General Contracting & Civil Construction',
    description: 'Executing civil and construction works efficiently in line with the highest safety and quality standards.',
    titleAr: 'المقاولات العامة والإنشاءات المدنية',
    descriptionAr: 'تنفيذ الأعمال المدنية والإنشائية بكفاءة عالية وفق أعلى معايير السلامة والجودة.'
  },
  {
    icon: Drill,
    title: 'Deep Foundations, Piling & Micropiles',
    description: 'Providing specialized deep foundation solutions to ensure structural stability in all soil conditions.',
    titleAr: 'الأساسات العميقة والخوازيق والمايكرو بايل',
    descriptionAr: 'تقديم حلول متخصصة للأساسات العميقة لضمان استقرار المنشآت في مختلف ظروف التربة.'
  },
  {
    icon: Hammer,
    title: 'Ground Support, Excavation & Earthworks',
    description: 'Delivering excavation, soil support, and earthworks with full structural and safety compliance.',
    titleAr: 'دعم التربة وأعمال الحفر والردميات',
    descriptionAr: 'تنفيذ أعمال الحفر والتدعيم والردميات وفق متطلبات السلامة والاستقرار الإنشائي.'
  },
  {
    icon: Activity,
    title: 'Water Well Drilling & Testing',
    description: 'Providing water well drilling and testing services to secure reliable and sustainable water sources.',
    titleAr: 'حفر واختبار آبار المياه',
    descriptionAr: 'تنفيذ خدمات حفر واختبار آبار المياه لضمان مصادر مائية موثوقة ومستدامة.'
  },
  {
    icon: Zap,
    title: 'Oil & Gas Field Services',
    description: 'Delivering specialized services that support drilling, production, and maintenance in oil and gas fields.',
    titleAr: 'خدمات حقول النفط والغاز',
    descriptionAr: 'تقديم خدمات متخصصة لدعم عمليات الحفر والإنتاج والصيانة في حقول النفط والغاز.'
  },
  {
    icon: Wrench,
    title: 'Well Maintenance, Cleaning & Cementing',
    description: 'Performing well maintenance, cleaning, and cementing to improve performance and extend well life.',
    titleAr: 'صيانة وتنظيف وإسمنتة الآبار',
    descriptionAr: 'تنفيذ خدمات صيانة وتنظيف وإسمنتة الآبار لرفع الكفاءة التشغيلية وإطالة عمرها.'
  },
  {
    icon: Shield,
    title: 'Cathodic Protection & Deep Earthing Systems',
    description: 'Designing and implementing advanced protection and earthing systems for critical assets and infrastructure.',
    titleAr: 'الحماية الكاثودية وأنظمة التأريض العميق',
    descriptionAr: 'تصميم وتنفيذ أنظمة حماية وتأريض متقدمة لحماية الأصول والبنية التحتية الحيوية.'
  },
  {
    icon: Construction,
    title: 'Surface Well Testing & Production Equipment',
    description: 'Operating surface well testing and production equipment to ensure optimal operational performance.',
    titleAr: 'اختبار الآبار السطحية ومعدات الإنتاج',
    descriptionAr: 'تشغيل وإدارة معدات الاختبار والإنتاج السطحي لضمان الأداء التشغيلي الأمثل.'
  },
  {
    icon: Truck,
    title: 'Heavy Equipment Fleet & Specialized Field Execution',
    description: 'Providing heavy equipment and specialized field execution services for large and complex projects.',
    titleAr: 'أسطول المعدات الثقيلة والتنفيذ الميداني التخصصي',
    descriptionAr: 'توفير معدات ثقيلة وخدمات تنفيذ ميداني متخصصة لدعم المشاريع الكبيرة والمعقدة.'
  },
  {
    icon: Trees,
    title: 'Agricultural Project Development',
    description: 'Developing integrated agricultural projects that support food security and sustainable investment.',
    titleAr: 'تطوير المشاريع الزراعية',
    descriptionAr: 'تطوير مشاريع زراعية متكاملة تدعم الأمن الغذائي والاستثمار المستدام.'
  },
  {
    icon: Building2,
    title: 'Educational Facility Development',
    description: 'Designing and delivering modern educational facilities that support advanced learning environments.',
    titleAr: 'تطوير المرافق التعليمية',
    descriptionAr: 'تصميم وتنفيذ مرافق تعليمية حديثة تدعم بيئات التعلم المتطورة.'
  },
  {
    icon: Home,
    title: 'Reconstruction & Urban Regeneration',
    description: 'Delivering reconstruction and urban regeneration projects that support communities and future growth.',
    titleAr: 'إعادة الإعمار والتطوير الحضري',
    descriptionAr: 'تنفيذ مشاريع إعادة الإعمار والتطوير الحضري لدعم المجتمعات والنمو المستقبلي.'
  },
  {
    icon: DollarSign,
    title: 'Real Estate Development & Investment',
    description: 'Developing high-value real estate investments across residential, commercial, and mixed-use sectors.',
    titleAr: 'التطوير والاستثمار العقاري',
    descriptionAr: 'تطوير مشاريع عقارية ذات قيمة استثمارية عالية تشمل السكني والتجاري ومتعدد الاستخدامات'
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
    <section ref={setElement} className="py-20 pt-40 bg-gradient-to-br from-bg-light to-white scroll-mt-32">
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
            <div 
            key={index}
            onClick={() => setShowPopup(true)}
            className="h-full cursor-pointer"
            style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.6s' }}
          >
            <ServiceCard
              icon={service.icon}
              title={isRTL ? service.titleAr : service.title}
              description={isRTL ? service.descriptionAr : service.description}
              disabled={false}
              className="h-full"
            />
          </div>
          ))}
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold mb-4 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'اختر خيارك' : 'Choose Your Option'}
            </h3>
            <p className={`text-gray-700 mb-6 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL 
                ? 'استكشف أعمالنا في هذا المجال أو تواصل معنا لمناقشة مشروعك'
                : 'Explore our work in this field or contact us to discuss your project'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = isRTL ? '/ar/projects' : '/en/projects'}
                className="px-6 py-3 bg-[#DAA424] text-white rounded-lg hover:bg-[#B8941F] transition-colors duration-200 font-medium"
              >
                {isRTL ? 'عرض مشاريعنا' : 'View Our Projects'}
              </button>
              <button
                onClick={() => window.location.href = isRTL ? '/ar/contact' : '/en/contact'}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium"
              >
                {isRTL ? 'اتصل بنا' : 'Contact Us'}
              </button>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
