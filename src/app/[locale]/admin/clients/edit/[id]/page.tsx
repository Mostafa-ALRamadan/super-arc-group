'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../../components/admin/layout/AdminLayout';
import Toast from '../../../../../../../components/ui/admin/Toast';
import ClientForm from '../../../../../../../components/admin/forms/ClientForm';
import { clientService, type Client, type ClientFormData } from '../../../../../../services/entities/client.service';
import { useTranslations } from '../../../../../../../src/contexts/TranslationContext';
import { useAuth } from '../../../../../../../src/contexts/AuthContext';
import { useAuthCheck } from '../../../../../../../src/hooks/useAuthCheck';
import LoadingSpinner from '../../../../../../../components/ui/admin/LoadingSpinner';

interface EditClientPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function EditClient({ params }: EditClientPageProps) {
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Check authentication on component mount
  useAuthCheck();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  const [clientId, setClientId] = useState<number>(0);
  const [initialData, setInitialData] = useState<Partial<ClientFormData>>({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [categories, setCategories] = useState<Array<{ id: number; name_en: string; name_ar: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setClientId(parseInt(resolved.id));
    };
    resolveParams();
  }, [params]);

  // Fetch client data
  const fetchClient = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      const client = await clientService.getById(clientId);
      
      setInitialData({
        name_en: client.name_en,
        name_ar: client.name_ar,
        category_id: client.category?.id,
        image_id: client.image_id,
        image: client.image
      });
    } catch (err) {
      const errorMessage = locale === 'ar' 
        ? 'فشل في جلب بيانات العميل'
        : 'Failed to fetch client data';
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const allCategories = await clientService.getCategories();
        // Filter only client categories
        const clientCategories = allCategories.filter((cat: any) => cat.type === 'client');
        setCategories(clientCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (isAuthenticated && clientId) {
      fetchClient();
    }
  }, [isAuthenticated, clientId]);

  const handleSubmit = async (data: ClientFormData) => {
    try {
      await clientService.update(clientId, data);
      
      // Show success message
      const successMessage = locale === 'ar' ? 'تم تحديث العميل بنجاح!' : 'Client updated successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // Redirect to clients list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/clients`);
      }, 2000);
    } catch (error) {
      // Show error message
      const errorMessage = locale === 'ar' 
        ? `فشل في تحديث العميل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` 
        : `Failed to update client: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/clients`);
  };

  const handleToastClose = () => {
    setShowToast(false);
    setSuccess(null);
    setError(null);
  };

  if (!isAuthenticated) {
    return (
      <AdminLayout title="Edit Client" sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={locale === 'ar' ? 'تعديل العميل' : 'Edit Client'} 
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
            {locale === 'ar' ? 'تعديل العميل' : 'Edit Client'}
          </h1>
          <p className="text-gray-600">
            {locale === 'ar' ? 'تحديث معلومات العميل' : 'Update client information'}
          </p>
        </div>

        {loading || categoriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ClientForm
            key={initialData.category_id || 'new'}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit={true}
            categories={categories}
          />
        )}
      </div>
    </AdminLayout>
  );
}
