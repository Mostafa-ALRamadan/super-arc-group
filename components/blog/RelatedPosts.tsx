'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Define the actual data structure that matches what we're receiving
interface RelatedPostData {
  id: string;
  slug: string;
  title: {
    en: any;
    ar: any;
  };
  excerpt: {
    en: any;
    ar: any;
  };
  description: {
    en: string;
    ar: string;
  };
  coverImage: string;
  category: {
    en: string;
    ar: string;
  };
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readingTime: number;
  tags: any;
}

interface RelatedPostsProps {
  posts: RelatedPostData[];
  locale: 'en' | 'ar';
  currentPostCategory: string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, locale, currentPostCategory }) => {
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

  if (!posts || posts.length === 0) {
    return null;
  }

  const relatedText = locale === 'en' ? 'Related Posts' : 'مقالات ذات صلة';
  const readMoreText = locale === 'en' ? 'Read More' : 'اقرأ المزيد';

  return (
    <section className="py-16 bg-gradient-to-b from-primary/5 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">
            {relatedText}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Related Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-primary/10"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={getLocalizedValue(post.title, locale)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-primary/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-primary/60 font-medium">
                        {locale === 'ar' ? 'لا توجد صورة' : 'No Image'}
                      </p>
                    </div>
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                    {getLocalizedValue(post.category, locale)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title */}
                <h3 className="text-base font-bold text-main mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link 
                    href={`/${locale}/blog/${post.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {getLocalizedValue(post.title, locale)}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-muted text-sm mb-3 line-clamp-2 leading-relaxed">
                  {getLocalizedValue(post.excerpt, locale)}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-muted mb-3">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.readingTime} min
                  </span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString(locale, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Read More Link */}
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="inline-flex items-center text-primary font-semibold hover:text-primary-dark transition-colors group text-sm"
                >
                  {readMoreText}
                  <svg 
                    className={`w-3 h-3 ml-1 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedPosts;
