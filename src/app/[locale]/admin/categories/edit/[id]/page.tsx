'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../../components/admin/layout/AdminLayout';
import CategoryForm from '../../../../../../../components/admin/forms/CategoryForm';
import { useTranslations } from '../../../../../../../src/contexts/TranslationContext';
import LoadingSpinner from '../../../../../../../components/ui/admin/LoadingSpinner';
import { categoryService, type CategoryFormData } from '../../../../../../services/content/category.service';
import Toast from '../../../../../../../components/ui/admin/Toast';
import { translateError } from '@/lib/errorMessages';

export default function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const categoryId = unwrappedParams.id;
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  const [initialData, setInitialData] = useState<Partial<CategoryFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const category = await categoryService.getCategoryById(categoryId);
        if (category) {
          // Transform category data to form format
          const formData: Partial<CategoryFormData> = {
            name: {
              en: category.name_en,
              ar: category.name_ar
            },
            type: category.type
          };
          
          setInitialData(formData);
        } else {
          // Category not found
          setInitialData(null);
        }
      } catch (error) {
        console.error('Failed to fetch category:', error);
        setError(translateError('Failed to load category', locale));
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await categoryService.updateCategory(categoryId, data);
      
      // Show success message
      const successMessage = (locale as 'en' | 'ar') === 'ar' ? 'تم تحديث الفئة بنجاح!' : 'Category updated successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // Redirect to categories list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/categories`);
      }, 2000);
    } catch (error) {
      console.error('Failed to update category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      setError(translateError(errorMessage, locale));
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/categories`);
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
                {(locale as 'en' | 'ar') === 'ar' ? 'جاري تحميل الفئة...' : 'Loading category...'}
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!initialData) {
    return (
      <AdminLayout 
        title={(locale as 'en' | 'ar') === 'ar' ? 'لم يتم العثور على الفئة' : 'Category Not Found'} 
        sidebarPosition={sidebarPosition}
      >
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-4">
              {(locale as 'en' | 'ar') === 'ar' ? 'لم يتم العثور على الفئة المطلوبة' : 'The requested category was not found'}
            </div>
            <button
              onClick={() => router.push(`/${locale}/admin/categories`)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {(locale as 'en' | 'ar') === 'ar' ? 'العودة إلى الفئات' : 'Back to Categories'}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={(locale as 'en' | 'ar') === 'ar' ? 'تعديل الفئة' : 'Edit Category'} 
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
            {(locale as 'en' | 'ar') === 'ar' ? 'تعديل الفئة' : 'Edit Category'}
          </h1>
          <p className="text-gray-600">
            {(locale as 'en' | 'ar') === 'ar' ? 'تحديث معلومات الفئة' : 'Update category information'}
          </p>
        </div>

        <CategoryForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </div>
    </AdminLayout>
  );
}
