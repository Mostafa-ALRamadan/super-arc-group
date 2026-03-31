'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../../components/admin/layout/AdminLayout';
import LeadershipForm from '../../../../../../../components/admin/forms/LeadershipForm';
import { useTranslations } from '../../../../../../contexts/TranslationContext';
import { leadershipService, type Leadership, type LeadershipFormData } from '../../../../../../services/entities/leadership.service';
import Toast from '../../../../../../../components/ui/admin/Toast';
import { useAuthCheck } from '../../../../../../hooks/useAuthCheck';
import { useAuth } from '../../../../../../contexts/AuthContext';

interface EditLeadershipMemberProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditLeadershipMember({ params }: EditLeadershipMemberProps) {
  // Check authentication on component mount
  useAuthCheck();
  const { isAuthenticated } = useAuth();
  const unwrappedParams = React.use(params);
  const leadershipId = parseInt(unwrappedParams.id);
  
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

  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<LeadershipFormData>({
    name_en: '',
    name_ar: '',
    position_en: '',
    position_ar: '',
    description_en: '',
    description_ar: '',
    image_id: null
  });

  // Fetch leadership member data
  const fetchLeadershipMember = async () => {
    try {
      const member = await leadershipService.getById(leadershipId);
      
      if (member) {
        // Transform member data to form format (same as employees)
        const formData: LeadershipFormData = {
          name_en: member.name_en,
          name_ar: member.name_ar,
          position_en: member.position_en,
          position_ar: member.position_ar,
          description_en: member.description_en,
          description_ar: member.description_ar,
          image: member.image ? {
            id: member.image.id,
            url: member.image.url,
            alt_en: member.image.alt_en,
            alt_ar: member.image.alt_ar
          } : undefined,
          image_id: member.image?.id || null
        };
        
        setInitialData(formData);
      } else {
        setInitialData({
          name_en: '',
          name_ar: '',
          position_en: '',
          position_ar: '',
          description_en: '',
          description_ar: '',
          image_id: null
        });
      }
    } catch (err) {
      console.error('Error fetching leadership member:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leadership member';
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeadershipMember();
    }
  }, [isAuthenticated, leadershipId]);

  const handleSubmit = async (data: LeadershipFormData) => {
    setLoading(true);
    try {
      await leadershipService.update(leadershipId, data);
      
      // Show success message
      const successMessage = locale === 'ar' ? 'تم تحديث العضو القيادي بنجاح!' : 'Leadership member updated successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // Redirect to leadership list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/leadership`);
      }, 2000);
    } catch (error) {
      // Show error message
      const errorMessage = locale === 'ar' 
        ? `فشل في تحديث العضو القيادي: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` 
        : `Failed to update leadership member: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/leadership`);
  };

  const handleToastClose = () => {
    setShowToast(false);
    setSuccess(null);
    setError(null);
  };

  if (!isAuthenticated) {
    return (
      <AdminLayout title="Edit Leadership Member" sidebarPosition={sidebarPosition}>
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
      title={locale === 'ar' ? 'تعديل العضو القيادي' : 'Edit Leadership Member'} 
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
            {locale === 'ar' ? 'تعديل العضو القيادي' : 'Edit Leadership Member'}
          </h1>
          <p className="text-gray-600">
            {locale === 'ar' ? 'تحديث معلومات العضو القيادي' : 'Update leadership member information'}
          </p>
        </div>

        <LeadershipForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </div>
    </AdminLayout>
  );
}
