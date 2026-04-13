'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../components/admin/layout/AdminLayout';
import ProjectForm from '../../../../../../components/admin/forms/ProjectForm';
import { useTranslations } from '../../../../../../src/contexts/TranslationContext';
import { fetchWithTokenRefresh } from '../../../../../services/auth/auth-fetch';
import Toast from '../../../../../../components/ui/admin/Toast';
import { translateError } from '@/lib/errorMessages';

interface ProjectFormData {
  slug: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: {
      time: number;
      blocks: any[];
      version: string;
    };
    ar: {
      time: number;
      blocks: any[];
      version: string;
    };
  };
  category: {
    name: {
      en: string;
      ar: string;
    };
    slug: string;
  };
  client: string;
  location: {
    en: string;
    ar: string;
  };
  completedAt: string;
}

export default function NewProject() {
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

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

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (data: any) => {
    try {
      const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
      
      const response = await fetchWithTokenRefresh(`${baseUrl}/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Show success message
        const successMessage = (locale as 'en' | 'ar') === 'ar' ? 'تم إنشاء المشروع بنجاح!' : 'Project created successfully!';
        setSuccess(successMessage);
        setToastType('success');
        setShowToast(true);
        
        // Redirect to projects list after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/admin/projects`);
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to create project (${response.status})`;
        if (errorData.title_en) errorMessage = `English title: ${errorData.title_en}`;
        if (errorData.title_ar) errorMessage = `Arabic title: ${errorData.title_ar}`;
        if (errorData.slug) errorMessage = `Slug: ${errorData.slug}`;
        if (errorData.category_id) errorMessage = `Category: ${errorData.category_id}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setError(translateError(errorMessage, locale));
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/projects`);
  };

  const handleToastClose = () => {
    setShowToast(false);
    setSuccess(null);
    setError(null);
  };

  return (
    <AdminLayout 
      title={(locale as 'en' | 'ar') === 'ar' ? 'إنشاء مشروع جديد' : 'Create New Project'} 
      sidebarPosition={sidebarPosition}
    >
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
            {(locale as 'en' | 'ar') === 'ar' ? 'إنشاء مشروع جديد' : 'Create New Project'}
          </h1>
          <p className="text-gray-600">
            {(locale as 'en' | 'ar') === 'ar' ? 'أضف مشروعًا جديدًا إلى معرض أعمالك' : 'Add a new project to your portfolio'}
          </p>
        </div>

        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={false}
        />
      </div>
    </AdminLayout>
  );
}
