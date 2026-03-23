'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../../components/admin/layout/AdminLayout';
import BlogForm from '../../../../../../../components/admin/forms/blog/BlogForm';
import { useTranslations, useLocale } from '../../../../../../contexts/TranslationContext';
import LoadingSpinner from '../../../../../../../components/ui/admin/LoadingSpinner';
import Toast from '../../../../../../../components/ui/admin/Toast';

interface BlogPost {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  content: {
    time: number;
    blocks: Array<{
      id?: string;
      type: string;
      data: any;
    }>;
    version: string;
  };
  cover_image: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  };
  category: {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
  };
  author: {
    id: number;
    name_en: string;
    name_ar: string;
    image?: {
      id: number;
      url: string;
    };
  };
  tags_en: string[];
  tags_ar: string[];
  is_featured: boolean;
  status: 'draft' | 'published';
  published_at: string;
  created_at: string;
  updated_at: string;
  reading_time: number;
  seo: {
    meta_description: string;
    keywords: string;
    og_title: string;
    og_description: string;
  };
}

export default function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const postSlug = unwrappedParams.id; // This is actually the slug
  
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
    
    const observer = new MutationObserver(hideElements);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      document.body.classList.remove('admin-page');
      const showElements = () => {
        const publicHeader = document.querySelector('header.fixed.top-0.left-0.right-0') as HTMLElement;
        const publicFooter = document.querySelector('footer') as HTMLElement;
        const headerSpacer = document.querySelector('div[style*="height: 80px"]') as HTMLElement;
        
        if (publicHeader) publicHeader.style.display = '';
        if (publicFooter) publicFooter.style.display = '';
        if (headerSpacer) headerSpacer.style.display = '';
      };
      showElements();
      observer.disconnect();
    };
  }, []);

  const { t } = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!postSlug) {
        return;
      }
      
      setLoading(true);
      
      try {
        const { blogService } = await import('../../../../../../services/content/blog.service');
        const post = await blogService.getPostById(postSlug);
        
        if (!post) {
          setInitialData(null);
          return;
        }
        
        // Transform API data to match BlogForm structure
        const transformedData = {
          title: {
            en: (post as any).title_en || (post as any).title?.en || '',
            ar: (post as any).title_ar || (post as any).title?.ar || ''
          },
          excerpt: {
            en: (post as any).excerpt_en || (post as any).excerpt?.en || '',
            ar: (post as any).excerpt_ar || (post as any).excerpt?.ar || ''
          },
          content: {
            en: (post as any).content_en || (post as any).content?.en || { time: Date.now(), blocks: [], version: '2.28.2' },
            ar: (post as any).content_ar || (post as any).content?.ar || { time: Date.now(), blocks: [], version: '2.28.2' }
          },
          cover_image_id: post.cover_image?.id || null,
          cover_image_url: post.cover_image?.url || '',
          category_id: post.category?.id || null,
          author_id: post.author?.id || null,
          reading_time: post.reading_time || 5,
          tags: {
            en: (post as any).tags_en || (post as any).tags?.en || [],
            ar: (post as any).tags_ar || (post as any).tags?.ar || []
          },
          status: (post as any).status || 'draft',
          is_featured: (post as any).is_featured || false,
          seo: post.seo || {
            meta_description: '',
            keywords: '',
            og_title: '',
            og_description: ''
          }
        };
        
        setInitialData(transformedData);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [postSlug]);

  const handleSubmit = async (data: any) => {
    try {
      const { blogService } = await import('../../../../../../services/content/blog.service');
      
      // Update the blog post using slug
      await blogService.updatePost(postSlug, data);
      
      // Show success and redirect
      const successMessage = locale === 'ar' ? 'تم تحديث المقال بنجاح!' : 'Blog post updated successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // Redirect to blog list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/blog`);
      }, 2000);
    } catch (error) {
      console.error('Error updating blog post:', error);
      const errorMessage = locale === 'ar' ? 'فشل في تحديث المقال. يرجى المحاولة مرة أخرى.' : 'Failed to update blog post. Please try again.';
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleCancel = () => {
    // Redirect back to blog list
    router.push(`/${locale}/admin/blog`);
  };

  const handleToastClose = () => {
    setShowToast(false);
    setSuccess(null);
    setError(null);
  };

  if (loading) {
    return (
      <AdminLayout title="Loading..." sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500">Loading blog post...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!initialData) {
    return (
      <AdminLayout title={t('admin.blog.form.notFound')} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('admin.blog.form.notFound')}</h2>
            <p className="text-gray-500 mb-6">{t('admin.blog.form.notFoundDescription')}</p>
            <button
              onClick={() => router.push(`/${locale}/admin/blog`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {t('admin.blog.list.title')}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.blog.form.edit')} sidebarPosition={sidebarPosition}>
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
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.blog.form.edit')}</h1>
          <p className="text-gray-600">{t('admin.blog.form.editDescription')}</p>
        </div>

        <BlogForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </div>
    </AdminLayout>
  );
}
