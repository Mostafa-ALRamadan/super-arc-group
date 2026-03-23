'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../components/admin/layout/AdminLayout';
import CompanyForm from '../../../../../../components/admin/forms/CompanyForm';
import { useTranslations } from '../../../../../../src/contexts/TranslationContext';
import { type CompanyFormData } from '../../../../../services/entities/companies.service';
import { type LinkFormData } from '../../../../../services/entities/links.service';
import { companiesService } from '../../../../../services/entities/companies.service';
import { fetchWithTokenRefresh } from '../../../../../services/auth/auth-fetch';
import Toast from '../../../../../../components/ui/admin/Toast';

export default function NewCompany() {
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

  const handleSubmit = async (data: CompanyFormData, links?: LinkFormData[]) => {
    try {
      // Create company using the service layer
      const company = await companiesService.createCompany(data);
      
      // Create links if any
      if (links && links.length > 0) {
        for (const link of links) {
          const linkResponse = await fetchWithTokenRefresh('/api/links', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...link,
              company: company.id
            }),
          });
          
          if (!linkResponse.ok) {
            const linkError = await linkResponse.json().catch(() => ({}));
            throw new Error(linkError.error || 'Failed to create link');
          }
        }
      }
      
      // Show success message
      const successMessage = (locale as 'en' | 'ar') === 'ar' ? 'تم إنشاء الشركة بنجاح!' : 'Company created successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // Redirect to companies list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/companies`);
      }, 2000);
    } catch (error) {
      // Show error message
      const errorMessage = (locale as 'en' | 'ar') === 'ar' 
        ? `فشل في إنشاء الشركة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` 
        : `Failed to create company: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/companies`);
  };

  const handleToastClose = () => {
    setShowToast(false);
    setSuccess(null);
    setError(null);
  };

  return (
    <AdminLayout 
      title={(locale as 'en' | 'ar') === 'ar' ? 'إنشاء شركة جديدة' : 'Create New Company'} 
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
            {(locale as 'en' | 'ar') === 'ar' ? 'إنشاء شركة جديدة' : 'Create New Company'}
          </h1>
          <p className="text-gray-600">
            {(locale as 'en' | 'ar') === 'ar' ? 'أضف شركة جديدة إلى قائمة الشركاء' : 'Add a new company to the partners list'}
          </p>
        </div>

        <CompanyForm
          initialData={{}}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={false}
        />
      </div>
    </AdminLayout>
  );
}
