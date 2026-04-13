'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../components/admin/layout/AdminLayout';
import EmployeeForm from '../../../../../../components/admin/forms/EmployeeForm';
import { employeeService, type EmployeeFormData } from '../../../../../services/entities/employee.service';
import { useTranslations } from '../../../../../../src/contexts/TranslationContext';
import { translateError } from '@/lib/errorMessages';
import Toast from '../../../../../../components/ui/admin/Toast';

export default function NewEmployee() {
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: EmployeeFormData) => {
    setLoading(true);
    try {
      await employeeService.createEmployee(data);
      
      // Show success message
      const successMessage = (locale as 'en' | 'ar') === 'ar' ? 'تم إنشاء الموظف بنجاح!' : 'Employee created successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // Redirect to employees list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/employees`);
      }, 2000);
    } catch (error) {
      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to create employee';
      setError(translateError(errorMessage, locale));
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/employees`);
  };

  const handleToastClose = () => {
    setShowToast(false);
    setSuccess(null);
    setError(null);
  };

  return (
    <AdminLayout 
      title={(locale as 'en' | 'ar') === 'ar' ? 'إنشاء موظف جديد' : 'Create New Employee'} 
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
            {(locale as 'en' | 'ar') === 'ar' ? 'إنشاء موظف جديد' : 'Create New Employee'}
          </h1>
          <p className="text-gray-600">
            {(locale as 'en' | 'ar') === 'ar' ? 'أضف موظفًا جديدًا إلى الشركة' : 'Add a new employee to the company'}
          </p>
        </div>

        <EmployeeForm
          initialData={{}}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={false}
        />
      </div>
    </AdminLayout>
  );
}
