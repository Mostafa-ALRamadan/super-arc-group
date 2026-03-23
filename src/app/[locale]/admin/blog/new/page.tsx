'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../components/admin/layout/AdminLayout';
import BlogForm from '../../../../../../components/admin/forms/blog/BlogForm';
import { useTranslations, useLocale } from '../../../../../contexts/TranslationContext';
import { blogService } from '../../../../../services/content/blog.service';
import { validateBlogForm } from '../../../../../utils/validation';
import Toast from '../../../../../../components/ui/admin/Toast';

interface BlogFormData {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  contentEn: string;
  contentAr: string;
  coverImage: string;
  coverImageAltEn: string;
  coverImageAltAr: string;
  categoryId: string;
  tags: {
    en: string[];
    ar: string[];
  };
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
}

export default function NewBlogPost() {
  useEffect(() => {
    document.body.classList.add('admin-page');
    
    const hideElements = () => {
      const publicHeader = document.querySelector('header.fixed.top-0.left-0.right-0') as HTMLElement;
      const publicFooter = document.querySelector('footer') as HTMLElement;
      const headerSpacer = document.querySelector('div[style*="height: 80px"]') as HTMLElement;
      
      if (publicHeader) publicHeader.style.display = 'none';
      if (headerSpacer) headerSpacer.style.display = 'none';
      if (publicFooter) publicFooter.style.display = 'none';
    };

    hideElements();
    const timeoutId = setTimeout(hideElements, 100);
    
    return () => {
      document.body.classList.remove('admin-page');
      clearTimeout(timeoutId);
      
      const publicHeader = document.querySelector('header.fixed.top-0.left-0.right-0') as HTMLElement;
      const publicFooter = document.querySelector('footer') as HTMLElement;
      const headerSpacer = document.querySelector('div[style*="height: 80px"]') as HTMLElement;
      
      if (publicHeader) publicHeader.style.display = '';
      if (headerSpacer) headerSpacer.style.display = '';
      if (publicFooter) publicFooter.style.display = '';
    };
  }, []);

  const { t } = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Transform BlogForm data to match BlogFormData interface
      const blogData = {
        title: {
          en: data.title?.en || '',
          ar: data.title?.ar || ''
        },
        excerpt: {
          en: data.excerpt?.en || '',
          ar: data.excerpt?.ar || ''
        },
        content: data.content || { time: Date.now(), blocks: [], version: '2.28.2' },
        cover_image_id: data.cover_image_id || null,
        category_id: data.category_id || 1,
        author_id: data.author_id || null,
        reading_time: data.reading_time || 5,
        tags: data.tags || { en: [], ar: [] },
        status: data.status || 'draft',
        is_featured: data.is_featured || false,
        seo: data.seo || {
          meta_description: '',
          keywords: '',
          og_title: '',
          og_description: '',
          og_image: ''
        },
        published_at: data.published_at || new Date().toISOString()
      };
      
      const result = await blogService.createPost(blogData);
      const successMessage = locale === 'ar' ? 'تم إنشاء المقال بنجاح!' : 'Blog post created successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        router.push(`/${locale}/admin/blog`);
      }, 2000);
    } catch (error) {
      const errorMessage = locale === 'ar' ? 'فشل إنشاء المقال' : 'Failed to create blog post';
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Redirect back to blog list
    router.push(`/${locale}/admin/blog`);
  };

  const handleToastClose = () => {
    setShowToast(false);
    setSuccess(null);
  };

  // Initialize with empty Editor.js content
  const initialData = {
    slug: '',
    titleEn: '',
    titleAr: '',
    excerptEn: '',
    excerptAr: '',
    category: 'Infrastructure',
    categoryId: '1',
    coverImage: '',
    coverImageAltEn: '',
    coverImageAltAr: '',
    contentEn: JSON.stringify({ blocks: [] }),
    contentAr: JSON.stringify({ blocks: [] }),
    tags: {
      en: [],
      ar: []
    },
    isFeatured: false,
    status: 'draft' as const,
    publishedAt: new Date().toISOString()
  };

  return (
    <AdminLayout title={locale === 'ar' ? 'إنشاء مقال جديد' : 'Create New Blog Post'} sidebarPosition={sidebarPosition}>
      {/* Toast Notification */}
      <Toast
        message={success || error || ''}
        type={toastType}
        isVisible={showToast}
        onClose={handleToastClose}
        autoClose={toastType === 'success'}
        duration={toastType === 'success' ? 5000 : 8000}
        locale={locale}
      />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === 'ar' ? 'إنشاء مقال جديد' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-600">
            {locale === 'ar' ? 'املأ النموذج أدناه لإنشاء مقال جديد' : 'Fill out the form below to create a new blog post'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <BlogForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit={false}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
