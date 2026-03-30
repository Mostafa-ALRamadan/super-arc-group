'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ProjectCardProps {
  image?: string | null;
  imageAlt?: { en: string; ar: string } | string;
  title: { en: string; ar: string } | string;
  category: string;
  description: { en: string; ar: string } | string;
  location?: { en: string; ar: string } | string;
  year?: string;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  locale?: string;
}

export default function ProjectCard({ 
  image, 
  imageAlt,
  title, 
  category, 
  description, 
  location, 
  year,
  href = '#',
  className = '', 
  style,
  locale = 'en'
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Helper function to get localized text
  const getLocalizedText = (text: { en: string; ar: string } | string) => {
    if (typeof text === 'string') return text;
    return text[locale as keyof typeof text] || text.en;
  };

  // Helper function to get image alt text
  const getImageAlt = () => {
    if (imageAlt) {
      return getLocalizedText(imageAlt);
    }
    return `${getLocalizedText(title)} - ${category} project`;
  };

  // Helper function to format numbers (always in English)
  const formatNumber = (number: string | number) => {
    // Always return English numbers regardless of locale
    return String(number);
  };

  const getCategoryColor = (category: string) => {
    // Dynamic color assignment based on category name hash (same as blog page)
    const colorOptions = [
      {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100 hover:border-blue-300'
      },
      {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100 hover:border-orange-300'
      },
      {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100 hover:border-purple-300'
      },
      {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        hover: 'hover:bg-green-100 hover:border-green-300'
      },
      {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        hover: 'hover:bg-red-100 hover:border-red-300'
      },
      {
        bg: 'bg-primary-light',
        text: 'text-primary',
        border: 'border-primary/50',
        hover: 'hover:bg-primary hover:text-white hover:border-primary'
      }
    ];

    // Use a simple hash to assign consistent colors (same algorithm as blog page)
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colorOptions.length;
    const selectedColor = colorOptions[colorIndex];
    
    // Return combined className string
    return `${selectedColor.bg} ${selectedColor.text} ${selectedColor.border} ${selectedColor.hover}`;
  };

  const translations = {
    en: {
      noImage: 'Project Image',
      viewDetails: 'View project details'
    },
    ar: {
      noImage: 'صورة المشروع',
      viewDetails: 'عرض تفاصيل المشروع'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const isRTL = locale === 'ar';

  return (
    <Link href={href}>
      <article
        className={`group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer ${
          isHovered ? 'shadow-xl border-[#DAA424]/30 -translate-y-1' : ''
        } ${className}`}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[5/6] overflow-hidden bg-bg-light">
          {image ? (
            <div className="relative w-full h-full">
              <img
                src={image}
                alt={getImageAlt()}
                className="w-full h-full object-cover transition-all duration-500"
                style={{ 
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />
              
              {/* Category in Top Corner */}
              <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-200 ${getCategoryColor(category)}`}>
                  {category}
                </span>
              </div>

              {/* Title and Location in Bottom Left Corner - Moves up on hover to make room for excerpt */}
              <div className={`absolute ${isRTL ? 'bottom-3 right-3' : 'bottom-3 left-3'} ${isRTL ? 'left-3' : 'right-3'} text-white transition-all duration-300 ${
                isHovered ? 'bottom-[60px]' : 'bottom-3'
              }`}>
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
                  <h3 className={`text-base font-semibold leading-tight transition-all duration-200 drop-shadow-lg ${
                    isHovered ? 'text-[#DAA424]' : 'text-white'
                  }`}>
                    {getLocalizedText(title)}
                  </h3>
                  {location && (
                    <div className="flex items-center gap-1 text-xs text-white/90 drop-shadow-md mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {getLocalizedText(location)}
                    </div>
                  )}
                </div>
              </div>

              {/* Excerpt - Appears below title on hover */}
              <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} ${isRTL ? 'left-3' : 'right-3'} bottom-3 text-white transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}>
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
                  <p className="text-sm leading-relaxed drop-shadow-md line-clamp-2">
                    {getLocalizedText(description)}
                  </p>
                </div>
              </div>

              {/* Simple Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-all duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                {/* Quick View Icon */}
                <div className={`absolute top-3 right-3 transition-all duration-300 transform ${
                  isHovered ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-1 opacity-0 scale-95'
                }`}>
                  <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-light to-primary-light flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-muted text-xs font-medium">{t.noImage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Accent Line */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#DAA424] to-[#E5B84D] transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
      </article>
    </Link>
  );
}
