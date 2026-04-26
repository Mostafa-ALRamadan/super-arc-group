'use client';

import React from 'react';
import Image from 'next/image';

// Interface for transformed post data passed to this component
interface TransformedBlogPost {
  id: string;
  slug: string;
  title: {
    en: string;
    ar: string;
  };
  excerpt: {
    en: string;
    ar: string;
  };
  description: {
    en: any;
    ar: any;
  };
  coverImage: string;
  coverImageAlt: {
    en: string;
    ar: string;
  };
  category: {
    en: string;
    ar: string;
  };
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readingTime?: number;
  tags: string[];
  content: any;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
}

interface BlogPostHeroProps {
  post: TransformedBlogPost;
  locale: 'en' | 'ar';
}

const BlogPostHero: React.FC<BlogPostHeroProps> = ({ post, locale }) => {
  const isRTL = locale === 'ar';
  
  // Helper function to safely get localized content
  const getLocalizedValue = (obj: any, locale: string): string => {
    if (typeof obj === 'string') {
      return obj; // Fallback for old structure
    }
    if (obj && typeof obj === 'object' && 'en' in obj && 'ar' in obj) {
      return locale === 'ar' ? obj.ar : obj.en;
    }
    return ''; // Fallback
  };

  const title = getLocalizedValue(post.title, locale);
  const category = getLocalizedValue(post.category, locale);
  const excerpt = getLocalizedValue(post.excerpt, locale);
  const coverImage = post.coverImage; // Use transformed property
  const coverImageAlt = post.coverImageAlt ? getLocalizedValue(post.coverImageAlt, locale) : title;
  const publishedAt = post.publishedAt;
  const readingTime = post.readingTime;

  return (
    <div className="relative w-full min-h-[60vh] md:h-[70vh] md:min-h-[500px] max-h-[800px] overflow-hidden pt-28 md:pt-20">
      {/* Cover Image */}
      <div className="absolute inset-0">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={coverImageAlt}
            fill
            className="object-cover"
            priority
            loading="eager"
            sizes="100vw"
            unoptimized={true}
            style={{
              objectPosition: 'center',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                <svg className="w-16 h-16 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-primary/40 text-lg font-medium">No Cover Image</p>
            </div>
          </div>
        )}
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-end">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center">
            {/* Semi-transparent background for text readability */}
            <div className="inline-block p-4 md:p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
              {/* Category Badge */}
              <div className="mb-4 md:mb-8 animate-fade-in-up">
                <span className={`inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-white/20 shadow-lg ${locale === 'ar' ? 'space-x-reverse' : ''}`}>
                  <svg className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {category}
                </span>
              </div>

              {/* Title */}
              <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-8 ${locale === 'ar' ? 'leading-loose' : 'leading-tight'} drop-shadow-2xl animate-fade-in-up animation-delay-200`}>
                <span className="block bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent pb-2">
                  {title}
                </span>
              </h1>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 max-w-4xl mx-auto leading-relaxed drop-shadow-lg animate-fade-in-up animation-delay-300">
                  {excerpt}
                </p>
              )}

              {/* Meta Info */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm animate-fade-in-up animation-delay-400">
                {publishedAt && (
                  <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-3'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      numberingSystem: 'latn'
                    })}</span>
                  </div>
                )}
                {readingTime && (
                  <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{readingTime} {locale === 'ar' ? 'دقائق قراءة' : 'min read'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default BlogPostHero;
