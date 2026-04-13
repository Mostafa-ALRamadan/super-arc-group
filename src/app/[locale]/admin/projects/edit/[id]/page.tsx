'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../../components/admin/layout/AdminLayout';
import ProjectForm from '../../../../../../../components/admin/forms/ProjectForm';
import { useTranslations } from '../../../../../../../src/contexts/TranslationContext';
import LoadingSpinner from '../../../../../../../components/ui/admin/LoadingSpinner';
import { fetchWithTokenRefresh } from '../../../../../../services/auth/auth-fetch';
import Toast from '../../../../../../../components/ui/admin/Toast';

interface Project {
  id: number;
  title_en: string;
  title_ar: string;
  content: {
    en: {
      time: number;
      blocks: Array<any>;
      version: string;
    };
    ar: {
      time: number;
      blocks: Array<any>;
      version: string;
    };
  };
  image_id: number | null;
  image_url: string;
  category_id: number | null;
  location_en: string;
  location_ar: string;
  client: string;
  completed_at: string;
  seo: {
    meta_description: string;
    social_title: string;
    social_description: string;
  };
  category?: {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    type: string;
  };
}

export default function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const projectId = unwrappedParams.id;
  
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

  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  const [initialData, setInitialData] = useState<Partial<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Fetch project data from API
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
        
        // If projectId is a number, fetch all projects and find the one with matching ID
        if (!isNaN(Number(projectId))) {
          const response = await fetchWithTokenRefresh(`${baseUrl}/projects/?page=1&limit=1000`);
          if (response.ok) {
            const data = await response.json();
            const allProjects = data.results || data || [];
            const project = allProjects.find((p: any) => p.id === parseInt(projectId));
            
            if (project) {
              // Transform API data to match ProjectForm expected structure
              const transformedData = {
                ...project,
                image_id: project.image?.id || project.image_id || null,
                image_url: project.image?.url || project.image_url || '',
                category_id: project.category?.id || project.category_id || null,
              };
              
              setInitialData(transformedData);
            } else {
              setInitialData(null);
            }
          } else {
            throw new Error('Failed to fetch projects');
          }
        } else {
          // If projectId is a slug, try direct fetch
          const apiUrl = `${baseUrl}/projects/${projectId}/`;
          const response = await fetchWithTokenRefresh(apiUrl);
          
          if (response.ok) {
            const project = await response.json();
            
            // Transform API data to match ProjectForm expected structure
            const transformedData = {
              ...project,
              image_id: project.image?.id || project.image_id || null,
              image_url: project.image?.url || project.image_url || '',
              category_id: project.category?.id || project.category_id || null,
            };
            
            setInitialData(transformedData);
          } else if (response.status === 404) {
            setInitialData(null);
          } else {
            const errorText = await response.text();
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || errorData.message || 'Failed to fetch project';
            setError(errorMessage);
          }
        }
      } catch (error: any) {
        // The fetchWithTokenRefresh will handle redirect to login
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, locale]);

  const handleSubmit = async (data: any) => {
    try {
      const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
      
      // Use the project's slug for the API call, not the ID
      const projectSlug = initialData?.slug || projectId;
      const response = await fetchWithTokenRefresh(`${baseUrl}/projects/${projectSlug}/`, {
        method: 'PUT', // or PATCH depending on your API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Show success message
        const successMessage = (locale as 'en' | 'ar') === 'ar' ? 'تم تحديث المشروع بنجاح!' : 'Project updated successfully!';
        setSuccess(successMessage);
        setToastType('success');
        setShowToast(true);
        
        // Redirect to projects list after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/admin/projects`);
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to update project (${response.status})`;
        if (errorData.title_en) errorMessage = `English title: ${errorData.title_en}`;
        if (errorData.title_ar) errorMessage = `Arabic title: ${errorData.title_ar}`;
        if (errorData.slug) errorMessage = `Slug: ${errorData.slug}`;
        if (errorData.category_id) errorMessage = `Category: ${errorData.category_id}`;
        setError((locale as 'en' | 'ar') === 'ar' ? `فشل تحديث المشروع: ${errorMessage}` : `Failed to update project: ${errorMessage}`);
        setToastType('error');
        setShowToast(true);
      }
    } catch (error: any) {
      // Handle authentication errors
      if (error.message.includes('Authentication failed') || error.message.includes('No access token')) {
        // The fetchWithTokenRefresh will handle redirect to login
        return;
      }
      
      alert((locale as 'en' | 'ar') === 'ar' ? 'حدث خطأ أثناء تحديث المشروع' : 'An error occurred while updating the project');
      const errorMessage = (locale as 'en' | 'ar') === 'ar' ? 'حدث خطأ أثناء تحديث المشروع' : 'An error occurred while updating the project';
      setError(errorMessage);
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

  if (loading) {
    return (
      <AdminLayout 
        title={(locale as 'en' | 'ar') === 'ar' ? 'جاري التحميل...' : 'Loading...'} 
        sidebarPosition={sidebarPosition}
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500">
                {(locale as 'en' | 'ar') === 'ar' ? 'جاري تحميل المشروع...' : 'Loading project...'}
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout 
        title={(locale as 'en' | 'ar') === 'ar' ? 'خطأ' : 'Error'} 
        sidebarPosition={sidebarPosition}
      >
        <div className={`p-6 ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`} dir={(locale as 'en' | 'ar') === 'ar' ? 'rtl' : 'ltr'}>
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">
              {(locale as 'en' | 'ar') === 'ar' ? 'خطأ في تحميل المشروع' : 'Error Loading Project'}
            </div>
            <div className="text-gray-600 mb-6">
              {error}
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {(locale as 'en' | 'ar') === 'ar' ? 'العودة إلى المشاريع' : 'Back to Projects'}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!initialData) {
    return (
      <AdminLayout 
        title={(locale as 'en' | 'ar') === 'ar' ? 'المشروع غير موجود' : 'Project Not Found'} 
        sidebarPosition={sidebarPosition}
      >
        <div className={`p-6 ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`} dir={(locale as 'en' | 'ar') === 'ar' ? 'rtl' : 'ltr'}>
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {(locale as 'en' | 'ar') === 'ar' ? 'المشروع غير موجود' : 'Project Not Found'}
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {(locale as 'en' | 'ar') === 'ar' ? 'العودة إلى المشاريع' : 'Back to Projects'}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={(locale as 'en' | 'ar') === 'ar' ? 'تحديث المشروع' : 'Update Project'} 
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
      
      <div className={`p-6 ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`} dir={(locale as 'en' | 'ar') === 'ar' ? 'rtl' : 'ltr'}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {(locale as 'en' | 'ar') === 'ar' ? 'تحديث المشروع' : 'Update Project'}
          </h1>
          <p className="text-gray-600">
            {(locale as 'en' | 'ar') === 'ar' ? 'تحديث تفاصيل المشروع' : 'Update project details'}
          </p>
        </div>

        <ProjectForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </div>
    </AdminLayout>
  );
}
