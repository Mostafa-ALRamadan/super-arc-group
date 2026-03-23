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

  return (
    <Link href={href}>
      <article
        className={`group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer ${
          isHovered ? 'shadow-xl border-primary -translate-y-1' : ''
        } ${className}`}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating Bubbles Background */}
        <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute top-4 left-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute top-12 right-6 w-6 h-6 bg-primary-dark/20 rounded-full animate-bounce delay-100"></div>
          <div className="absolute bottom-8 left-8 w-10 h-10 bg-primary/20 rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-4 right-4 w-7 h-7 bg-primary-dark/20 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/3 left-1/4 w-5 h-5 bg-primary/20 rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-2/3 right-1/3 w-9 h-9 bg-primary-dark/20 rounded-full animate-bounce delay-250"></div>
        </div>

        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden bg-bg-light">
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
              
              {/* Professional Light Sweep Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-1000 ${
                isHovered ? 'translate-x-full' : ''
              }`} />
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

        {/* Content Section */}
        <div className="p-5 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${getCategoryColor(category)}`}>
              {category}
            </span>
            {(location || year) && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {getLocalizedText(location)}
                  </span>
                )}
                {year && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatNumber(year)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-base font-semibold leading-tight transition-all duration-200 ${
            isHovered ? 'text-primary' : 'text-main'
          }`}>
            {getLocalizedText(title)}
          </h3>
          
          {/* Description */}
          <p className="text-muted leading-relaxed text-sm line-clamp-2">
            {getLocalizedText(description)}
          </p>

          {/* Hover Action */}
          <div className={`flex items-center justify-between pt-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}>
            <span className="text-sm font-medium text-primary">{t.viewDetails}</span>
            <svg className="w-4 h-4 text-primary transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary-dark transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>

        {/* Professional Light Sweep Animation Style */}
        <style jsx>{`
          @keyframes light-sweep {
            0% { 
              transform: translateX(-50%) translateY(-50%) rotate(15deg);
            }
            50% { 
              transform: translateX(0%) translateY(0%) rotate(15deg);
            }
            100% { 
              transform: translateX(50%) translateY(50%) rotate(15deg);
            }
          }
          
          @keyframes subtle-glow {
            0%, 100% { 
              opacity: 0.3;
              transform: scale(1);
            }
            50% { 
              opacity: 0.6;
              transform: scale(1.1);
            }
          }
        `}</style>
      </article>
    </Link>
  );
}
