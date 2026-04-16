'use client';

import { useState, useEffect } from 'react';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';

const translations = {
  en: {
    title: "Engineering Excellence Since 1987",
    subtitle: "About Super Arc Group",
    office: "Super Arc Group Office",
    experienceTitle: "Years of Experience",
    description: "Super Arc Group places its engineering expertise spanning more than four decades at the service of reconstruction and infrastructure development. Established in the UAE, the Group has delivered high-value projects across engineering consultancy, design, supervision, and execution.",
    
    vision: {
      title: "Our Vision",
      description: "To become the most trusted engineering partner by delivering sustainable solutions that align with the evolving requirements of development and infrastructure."
    },
    
    mission: {
      title: "Our Mission", 
      description: "We aspire to be a trusted partner to public and private sector entities in developing safe and sustainable infrastructure that meets the demands of the coming phase."
    },
    
    stats: {
      experience: "Years of Experience",
      projects: "Projects Delivered",
      clients: "Satisfied Clients",
      companies: "Specialized Companies",
      commitment: "Commitment to Quality"
    },
    
    coreValues: {
      title: "Core Values",
      excellence: {
        title: "Excellence",
        description: "Delivering the highest standards in everything we do."
      },
      innovation: {
        title: "Innovation", 
        description: "Advancing smarter, future-ready engineering solutions."
      },
      integrity: {
        title: "Integrity",
        description: "Acting with transparency, trust, and accountability."
      },
      sustainability: {
        title: "Sustainability",
        description: "Building solutions that endure and create lasting value."
      }
    }
  },
  ar: {
    title: "التميز الهندسي منذ 1987",
    subtitle: "مجموعة سوبر آرك",
    office: "مكتب مجموعة سوبر آرك",
    experienceTitle: "سنوات من الخبرة",
    description: "تضع مجموعة سوبر آرك خبرتها الهندسية التي تمتد لأكثر من أربعة عقود في خدمة إعادة الإعمار وتطوير البنية التحتية. تأسست المجموعة في الإمارات العربية المتحدة وسلمت مشاريع عالية القيمة في الاستشارات الهندسية والتصميم والإشراف والتنفيذ.",
    
    vision: {
      title: "رؤيتنا",
      description: "أن نصبح الشريك الهندسي الأكثر ثقة من خلال تقديم حلول مستدامة تتوافق مع المتطلبات المتطورة للتنمية والبنية التحتية."
    },
    
    mission: {
      title: "مهمتنا",
      description: "نطمح أن نكون شريكاً موثوقاً للجهات العامة والخاصة في تطوير البنية التحتية الآمنة والمستدامة التي تلبي متطلبات المرحلة القادمة."
    },
    
    stats: {
      experience: "سنوات من الخبرة",
      projects: "مشاريع مُسلّمة",
      clients: "عملاء راضون",
      companies: "شركات متخصصة",
      commitment: "الالتزام بالجودة"
    },
    
    coreValues: {
      title: "القيم الأساسية",
      excellence: {
        title: "التميز",
        description: "تقديم أعلى المعايير في كل ما نقوم به."
      },
      innovation: {
        title: "الابتكار",
        description: "تطوير حلول هندسية أكثر ذكاءً واستعداداً للمستقبل."
      },
      integrity: {
        title: "النزاهة",
        description: "العمل بشفافية وثقة ومساءلة."
      },
      sustainability: {
        title: "الاستدامة",
        description: "بناء حلول تدوم وتخلق قيمة دائمة."
      }
    }
  }
};

export default function About() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const { isVisible, setElement } = useScrollAnimation(0.1);

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

  const isRTL = locale === 'ar';
  const t = translations[locale];

  return (
    <section 
      ref={setElement}
      className="py-20 pt-40 bg-gray-50 scroll-mt-20"
    > 
      <div id="about" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
          {/* Left Column - Office Image */}
          <div 
            className="relative order-2 lg:order-1"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateX(0)' : 'translateX(-30px)', 
              transition: 'all 0.8s ease-out 0.5s' 
            }}
          >
            <div className="bg-gray-200 rounded-lg h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center relative overflow-hidden">
              <img 
                src="/images/about.webp" 
                alt={isRTL ? "صورة من نحن لمجموعة سوبر آرك" : "Super Arc Group about image"} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
            </div>
            
            {/* Experience Badge */}
            <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 bg-white text-gray-900 rounded-lg p-3 lg:p-6 shadow-xl border border-gray-100">
              <div className="text-3xl lg:text-6xl font-black text-secondary text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>40+</div>
              <div className="text-xs lg:text-sm font-medium text-gray-600 text-center">{t.stats.experience}</div>
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
            <p 
              className="text-lg text-gray-700 leading-relaxed"
              style={{ 
                opacity: isVisible ? 1 : 0, 
                transform: isVisible ? 'translateX(0)' : 'translateX(30px)', 
                transition: 'all 0.8s ease-out 0.4s' 
              }}
            >
              {t.description}
            </p>

            {/* Vision & Mission */}
            <div className="space-y-6">
              <div 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                style={{ 
                  opacity: isVisible ? 1 : 0, 
                  transform: isVisible ? 'translateX(0)' : 'translateX(30px)', 
                  transition: 'all 0.8s ease-out 0.6s' 
                }}
              >
                <div className="flex gap-4 items-start">
                  <div className="service-icon shrink-0 w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(135deg, rgb(19, 57, 46) 0%, rgb(39, 104, 84) 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">{t.vision.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{t.vision.description}</p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                style={{ 
                  opacity: isVisible ? 1 : 0, 
                  transform: isVisible ? 'translateX(0)' : 'translateX(30px)', 
                  transition: 'all 0.8s ease-out 0.8s' 
                }}
              >
                <div className="flex gap-4 items-start">
                  <div className="service-icon shrink-0 w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(135deg, rgb(19, 57, 46) 0%, rgb(39, 104, 84) 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">{t.mission.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{t.mission.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div 
          className="rounded-lg p-8 mb-16"
          style={{ 
            backgroundImage: 'linear-gradient(135deg, rgb(19, 57, 46) 0%, rgb(39, 104, 84) 100%)',
            opacity: isVisible ? 1 : 0, 
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
            transition: 'all 0.8s ease-out 0.8s' 
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { number: "40+", label: t.stats.experience },
              { number: "1000+", label: t.stats.projects },
              { number: "500+", label: t.stats.clients },
              { number: "3", label: t.stats.companies },
              { number: "100%", label: t.stats.commitment }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center"
                style={{ 
                  opacity: isVisible ? 1 : 0, 
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
                  transition: `all 0.8s ease-out ${0.8 + index * 0.1}s` 
                }}
              >
                <div className="text-5xl font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>{stat.number}</div>
                <div className="text-base font-medium text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div>
          <h3 
            className="text-3xl font-bold text-center text-primary mb-12"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
              transition: 'all 0.8s ease-out 1.2s' 
            }}
          >
            {t.coreValues.title}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { key: 'excellence', icon: '🏆' },
              { key: 'innovation', icon: '💡' },
              { key: 'integrity', icon: '🤝' },
              { key: 'sustainability', icon: '🌱' }
            ].map((value, index) => (
              <div 
                key={value.key}
                className="text-center bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                style={{ 
                  opacity: isVisible ? 1 : 0, 
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
                  transition: `all 0.8s ease-out ${1.3 + index * 0.1}s` 
                }}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h4 className="text-lg font-semibold text-primary mb-3">
                  {(t.coreValues as any)[value.key].title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {(t.coreValues as any)[value.key].description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
