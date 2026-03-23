'use client';

import React from 'react';
import SimpleEditorRenderer from '../../../editor/SimpleEditorRenderer';
import { useLocale } from '../../../../src/contexts/TranslationContext';

interface BlogFormData {
  title: string; // Changed from object to string
  excerpt: string; // Changed from object to string
  content: {
    time: number;
    blocks: Array<{
      id?: string;
      type: string;
      data: any;
    }>;
    version: string;
  };
  cover_image_url: string;
  cover_image_id: number | null;
  category_id: number | null;
  author_id: number | null;
  reading_time: number;
  tags: string[]; // Already changed to array
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  seo: {
    meta_description: string;
    keywords: string;
    og_title: string;
    og_description: string;
  };
}

// Make PartialBlogFormData have the same nullable types as BlogFormData
type PartialBlogFormData = Partial<BlogFormData>;

interface BlogPreviewProps {
  formData: PartialBlogFormData;
  isOpen: boolean;
  onClose: () => void;
  authorData?: {
    name: string;
    avatar?: string;
  };
  categoryData?: {
    name: string | { en: string; ar: string };
  };
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ formData, isOpen, onClose, authorData, categoryData }) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  if (!isOpen) return null;

  // Helper function to get localized author name
  const getAuthorName = (author: typeof authorData): string => {
    if (!author) return (locale === 'ar' ? 'اسم المؤلف' : 'Author Name');
    return author.name;
  };

  // Helper function to get localized category name
  const getCategoryName = (category: typeof categoryData): string => {
    if (!category) return (locale === 'ar' ? 'الفئة' : 'Category');
    
    // Handle both string and object structures
    if (typeof category.name === 'string') {
      return category.name;
    }
    
    if (category.name && typeof category.name === 'object' && 'en' in category.name && 'ar' in category.name) {
      const localizedCategory = category.name as { en: string; ar: string };
      return locale === 'ar' ? localizedCategory.ar : localizedCategory.en;
    }
    
    return (locale === 'ar' ? 'الفئة' : 'Category');
  };

  // Get localized content based on current locale
  const getLocalizedContent = () => {
    return {
      title: formData.title || '',
      excerpt: formData.excerpt || '',
      content: formData.content || { blocks: [], time: Date.now(), version: '2.0' },
      coverImage: formData.cover_image_url || '',
      tags: Array.isArray(formData.tags) ? formData.tags : []
    };
  };

  const content = getLocalizedContent();

  // Parse content for editor blocks
  let editorBlocks: Array<{
    id?: string;
    type: string;
    data: any;
  }> = [];
  try {
    if (content.content && content.content.blocks) {
      editorBlocks = content.content.blocks;
    }
  } catch (error) {
    console.error('Error parsing content:', error);
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      numberingSystem: 'latn'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-gray-900">
              {locale === 'ar' ? 'معاينة المنشور' : 'Post Preview'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Preview Content - Exact copy of blog post page */}
          <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
            <article className={`min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
              {/* Hero Section - Exact copy of BlogPostHero */}
              {content.coverImage && (
                <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
                  {/* Cover Image */}
                  <div className="absolute inset-0">
                    <img
                      src={content.coverImage}
                      alt={content.title}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: 'center',
                        objectFit: 'cover'
                      }}
                    />
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
                        <div className="inline-block p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
                          {/* Category Badge */}
                          <div className="mb-8">
                            <span className={`inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-white/20 shadow-lg ${isRTL ? 'space-x-reverse' : ''}`}>
                              <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {getCategoryName(categoryData)}
                            </span>
                          </div>

                          {/* Title */}
                          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                            <span className="block bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                              {content.title || (locale === 'ar' ? 'عنوان المنشور' : 'Post Title')}
                            </span>
                          </h1>

                          {/* Excerpt */}
                          {content.excerpt && (
                            <p className="text-xl md:text-2xl text-white/95 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
                              {content.excerpt}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm">
                            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-3'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                numberingSystem: 'latn'
                              })}</span>
                            </div>
                            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{formData.reading_time || 5} {locale === 'ar' ? 'دقيقة قراءة' : 'min read'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Article Metadata - Exact copy from live blog */}
                <div className="mb-16 pb-8 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                    {/* Author Info - Exact copy from live blog */}
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                      {authorData?.avatar ? (
                        <img
                          src={authorData.avatar}
                          alt={getAuthorName(authorData)}
                          className="w-14 h-14 rounded-full object-cover ring-3 ring-primary/10 shadow-lg"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-3 ring-primary/10 shadow-lg">
                          <span className="text-primary font-bold text-lg">
                            {getAuthorName(authorData).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {getAuthorName(authorData)}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">
                          {new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            numberingSystem: 'latn'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Reading Time & Category - Exact copy from live blog */}
                    <div className="flex items-center space-x-8 space-x-reverse text-sm text-gray-600">
                      <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>{formData.reading_time || 5} {locale === 'ar' ? 'دقيقة قراءة' : 'min read'}</span>
                      </div>
                      {categoryData && (
                        <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className={`font-medium text-primary ${isRTL ? 'mr-2' : 'ml-2'}`}>
                            {getCategoryName(categoryData)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Tags - Exact copy from live blog */}
                  {Array.isArray(content.tags) && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {content.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary/5 to-primary/10 text-primary hover:from-primary/10 hover:to-primary/20 transition-all duration-200 border border-primary/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Article Content - Exact copy from live blog */}
                <div className="prose prose-lg prose-primary max-w-none">
                  {editorBlocks.length > 0 ? (
                    <SimpleEditorRenderer blocks={editorBlocks} locale={locale as 'en' | 'ar'} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 italic text-lg">
                        {locale === 'ar' ? 'لا يوجد محتوى للمعاينة' : 'No content to preview'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Share Section - Exact copy from live blog */}
                <div className="bg-gradient-to-r from-primary/5 via-white to-primary/5 rounded-2xl p-8 shadow-sm border border-primary/10 mt-16">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {locale === 'ar' ? 'شارك المقال' : 'Share this article'}
                      </h3>
                      <p className="text-gray-600 font-medium">
                        {locale === 'ar' ? 'إذا وجدت هذا المقال مفيداً، شاركه مع الآخرين' : 'If you found this article helpful, share it with others'}
                      </p>
                    </div>
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                      {/* Visual-only share buttons for preview */}
                      <div 
                        className="p-3 bg-blue-500 text-white rounded-xl shadow-lg"
                        title={locale === 'ar' ? 'مشاركة على فيسبوك' : 'Share on Facebook'}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <div 
                        className="p-3 bg-black text-white rounded-xl shadow-lg"
                        title={locale === 'ar' ? 'مشاركة على X' : 'Share on X'}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <div 
                        className="p-3 bg-blue-600 text-white rounded-xl shadow-lg"
                        title={locale === 'ar' ? 'مشاركة على لينكدإن' : 'Share on LinkedIn'}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;
