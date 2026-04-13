'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../../components/admin/layout/AdminLayout';
import EmployeeForm from '../../../../../../../components/admin/forms/EmployeeForm';
import { employeeService, type EmployeeFormData } from '../../../../../../services/entities/employee.service';
import { useTranslations } from '../../../../../../../src/contexts/TranslationContext';
import { useAuth } from '../../../../../../../src/contexts/AuthContext';
import { useAuthCheck } from '../../../../../../../src/hooks/useAuthCheck';
import { translateError } from '@/lib/errorMessages';
import Toast from '../../../../../../../components/ui/admin/Toast';
import { companiesService } from '../../../../../../services/entities/companies.service';
import LoadingSpinner from '../../../../../../../components/ui/admin/LoadingSpinner';

export default function EditEmployee({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const employeeId = unwrappedParams.id;
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  const [initialData, setInitialData] = useState<Partial<EmployeeFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    const fetchEmployee = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      try {
        const employee = await employeeService.getEmployeeById(employeeId);
        
        if (employee) {
          // Transform employee data to form format
          const formData: EmployeeFormData = {
            name: employee.name,
            position: employee.position,
            image: employee.image ? {
              id: employee.image.id,
              url: employee.image.url,
              alt_en: employee.image.alt_en,
              alt_ar: employee.image.alt_ar
            } : undefined,
            image_id: employee.image?.id || null,
            company_id: employee.company_id
          };
          
          setInitialData(formData);
        } else {
          setInitialData(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load employee';
        setError(translateError(errorMessage, locale));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      await employeeService.updateEmployee(employeeId, data);
      
      // Show success message
      const successMessage = (locale as 'en' | 'ar') === 'ar' ? 'تم تحديث الموظف بنجاح!' : 'Employee updated successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // Redirect to employees list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/employees`);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employee';
      setError(translateError(errorMessage, locale));
      setToastType('error');
      setShowToast(true);
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
                {(locale as 'en' | 'ar') === 'ar' ? 'جاري تحميل الموظف...' : 'Loading employee...'}
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
        title={(locale as 'en' | 'ar') === 'ar' ? 'لم يتم العثور على الموظف' : 'Employee Not Found'} 
        sidebarPosition={sidebarPosition}
      >
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-4">
              {(locale as 'en' | 'ar') === 'ar' ? 'لم يتم العثور على الموظف المطلوب' : 'The requested employee was not found'}
            </div>
            <button
              onClick={() => router.push(`/${locale}/admin/employees`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {(locale as 'en' | 'ar') === 'ar' ? 'العودة إلى الموظفين' : 'Back to Employees'}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={(locale as 'en' | 'ar') === 'ar' ? 'تعديل الموظف' : 'Edit Employee'} 
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
            {(locale as 'en' | 'ar') === 'ar' ? 'تعديل الموظف' : 'Edit Employee'}
          </h1>
          <p className="text-gray-600">
            {(locale as 'en' | 'ar') === 'ar' ? 'تحديث معلومات الموظف' : 'Update employee information'}
          </p>
        </div>

        <EmployeeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </div>
    </AdminLayout>
  );
}
