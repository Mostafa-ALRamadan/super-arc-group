'use client';

import { useState, useEffect } from 'react';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';
import { leadershipService, type Leadership } from '../../src/services/entities/leadership.service';
import LoadingSpinner from '../ui/admin/LoadingSpinner';

// Custom CSS for 3D flip effect
const customStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  .hover\\:rotate-y-180:hover {
    transform: rotateY(180deg);
  }
    /* Line clamp utilities */
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-8 {
    display: -webkit-box;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const translations = {
  en: {
    title: "Our Leadership",
    subtitle: "Meet the visionaries behind Super Arc Group",
    description: "Our leadership team brings decades of combined experience in engineering, construction, and business development.",
    noData: "No leadership members found.",
  },
  ar: {
    title: "قيادتنا",
    subtitle: "تعرّف على القادة وراء مجموعة سوبر آرك",
    description: "فريق قيادتنا يجلب عقوداً من الخبرة المشتركة في الهندسة والبناء وتطوير الأعمال.",
    noData: "لم يتم العثور على أعضاء قياديين.",
  },
};

export default function Leadership() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const { isVisible, setElement } = useScrollAnimation(0.1);
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

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

  // Fetch leadership members
  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        setLoading(true);
        const data = await leadershipService.getAllPublic();
        setLeadership(data);
      } catch (err) {
        console.error('Error fetching leadership:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadership();
  }, []);

  const t = translations[locale];
  const isRTL = locale === 'ar';

  const handleCardClick = (memberId: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const isCardFlipped = (memberId: number) => flippedCards.has(memberId);

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

        {/* Leadership Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : leadership.length === 0 ? (
          <div className="text-center py-20" style={{ 
            opacity: isVisible ? 1 : 0, 
            transform: isVisible ? 'translateY(0)' : 'translateY(40px)', 
            transition: 'all 1s ease-out 0.4s' 
          }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-main mb-4">
              {t.noData}
            </h3>
            <p className="text-muted max-w-2xl mx-auto">
              {t.description}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ 
            opacity: isVisible ? 1 : 0, 
            transform: isVisible ? 'translateY(0)' : 'translateY(40px)', 
            transition: 'all 1s ease-out 0.4s',
            perspective: '1000px'
          }}>
            {leadership.map((member, index) => (
              <div
                key={member.id}
                className="relative h-96 sm:h-[28rem] lg:h-[32rem] xl:h-[30rem]"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: `translateY(0) scale(${isVisible ? 1 : 0.9})`,
                  transition: `all 0.6s ease-out ${0.4 + index * 0.1}s`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-700"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isCardFlipped(member.id) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                  onClick={() => handleCardClick(member.id)}
                >
                  {/* Front Side */}
                  <div 
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-500 flex flex-col"
                    style={{
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Image - Takes remaining space */}
                    <div className="flex-1 flex items-center justify-center">
                      {member.image ? (
                        <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full overflow-hidden border-4 border-white shadow-lg">
                          <img
                            src={member.image.url}
                            alt={isRTL ? member.image.alt_ar : member.image.alt_en}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      ) : (
                        <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary/30">
                            {member.initials}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content - Fixed height at bottom */}
                    <div className="flex-shrink-0 p-3 text-center bg-white -mt-8 sm:-mt-4 md:mt-0">
                      <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-1">
                        {isRTL ? member.name_ar : member.name_en}
                      </h4>
                      <p className="text-xs sm:text-sm lg:text-base font-medium text-primary mb-2 sm:mb-3 line-clamp-1">
                        {isRTL ? member.position_ar : member.position_en}
                      </p>
                      <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="hidden sm:inline">{isRTL ? 'انقر للتفاصيل' : 'Click for details'}</span>
                        <span className="sm:hidden">{isRTL ? 'انقر للتفاصيل' : 'click for details'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-900 to-green-950 rounded-2xl shadow-lg overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="h-full flex items-center justify-center p-6 text-white">
                      {/* Content group - Centered as a whole */}
                      <div className="text-center space-y-3">
                        {/* Avatar */}
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-4 border-white/50 shadow-lg">
                          {member.image ? (
                            <img
                              src={member.image.url}
                              alt={isRTL ? member.image.alt_ar : member.image.alt_en}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/30">
                              <span className="text-2xl font-bold text-white/80">
                                {member.initials}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <h4 className="text-lg font-bold drop-shadow-lg line-clamp-2">
                          {isRTL ? member.name_ar : member.name_en}
                        </h4>
                        <p className="text-sm font-medium text-yellow-100 drop-shadow">
                          {isRTL ? member.position_ar : member.position_en}
                        </p>
                        <div className="w-12 h-1 bg-white/60 rounded-full mx-auto shadow-lg" />
                        <p className="text-xs sm:text-xs lg:text-sm leading-tight text-yellow-50 drop-shadow-sm">
                          {isRTL ? member.description_ar : member.description_en}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
