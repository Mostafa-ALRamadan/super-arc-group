'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/layout/AdminLayout';
import { useTranslations } from '../../../../../src/contexts/TranslationContext';
import { companiesService, type Company } from '../../../../services/entities/companies.service';
import LoadingSpinner from '../../../../../components/ui/admin/LoadingSpinner';
import ConfirmDialog from '../../../../../components/ui/admin/ConfirmDialog';
import Alert from '../../../../../components/ui/admin/Alert';
import { useAuthCheck } from '../../../../../src/hooks/useAuthCheck';
import { useAuth } from '../../../../../src/contexts/AuthContext';

export default function CompaniesManagement() {
  // Check authentication on component mount
  useAuthCheck();
  const { isAuthenticated } = useAuth();
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

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false); // Start with false, only set true when authenticated
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load companies from API (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't fetch if not authenticated
    }

    const loadCompanies = async () => {
      try {
        setLoading(true);
        const companiesData = await companiesService.getCompanies();
        setCompanies(companiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [isAuthenticated]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; companySlug: string; companyName: string }>({
    isOpen: false,
    companySlug: '',
    companyName: ''
  });

  // Filter companies based on search
  const filteredCompanies = companies.filter(company => {
    const searchMatch = searchTerm === '' || 
      company.name[locale as 'en' | 'ar'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.slug.toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  const handleEdit = (companySlug: string) => {
    router.push(`/${locale}/admin/companies/edit/${companySlug}`);
  };

  const handleDeleteClick = (companySlug: string, companyName: string) => {
    setDeleteConfirm({
      isOpen: true,
      companySlug,
      companyName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await companiesService.deleteCompany(deleteConfirm.companySlug);
      // Remove from frontend state after successful deletion
      setCompanies(prev => prev.filter(company => company.slug !== deleteConfirm.companySlug));
      setSuccess(locale === 'ar' ? 'تم حذف الشركة بنجاح' : 'Company deleted successfully');
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to delete company:', error);
      setError((locale as 'en' | 'ar') === 'ar' 
        ? 'فشل في حذف الشركة' 
        : 'Failed to delete company');
    } finally {
      setDeleteConfirm({ isOpen: false, companySlug: '', companyName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, companySlug: '', companyName: '' });
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <AdminLayout title={locale === 'ar' ? 'إدارة الشركات' : 'Companies Management'} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={locale === 'ar' ? 'إدارة الشركات' : 'Companies Management'} sidebarPosition={sidebarPosition}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main">
            {locale === 'ar' ? 'إدارة الشركات' : 'Companies Management'}
          </h1>
          <p className="text-muted">
            {locale === 'ar' ? 'إدارة شركات العملاء والشركاء' : 'Manage client and partner companies'}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'البحث في الشركات...' : 'Search companies...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${locale === 'ar' ? 'ml-0 sm:ml-6' : 'mr-0 sm:mr-6'} px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto`}
            />
          </div>
          <button
            onClick={() => router.push(`/${locale}/admin/companies/new`)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full lg:w-auto"
          >
            {locale === 'ar' ? 'إنشاء شركة جديدة' : 'Create New Company'}
          </button>
        </div>

        {/* Success and Error Notifications */}
        {success && (
          <div className="p-4">
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
            />
          </div>
        )}
        
        {error && (
          <div className="p-4">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الصورة' : 'Image'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الاسم' : 'Name'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الرابط المختصر' : 'Slug'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm 
                        ? (locale === 'ar' ? 'لا توجد شركات تطابق بحثك' : 'No companies match your search')
                        : (locale === 'ar' ? 'لم يتم العثور على شركات' : 'No companies found')
                      }
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.image && (
                        <img
                          src={company.image.url}
                          alt={locale === 'ar' ? company.image.alt_ar : company.image.alt_en}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-main">
                          {company.name[locale as 'en' | 'ar']}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted">
                          {company.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(company.slug)}
                          className={`text-indigo-600 hover:text-indigo-900 ${locale === 'ar' ? 'ml-4' : 'mr-4'}`}
                        >
                          {locale === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(company.slug, company.name[locale as 'en' | 'ar'])}
                          className="text-red-600 hover:text-red-900"
                        >
                          {locale === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 text-lg mb-4">
              {companies.length === 0 
                ? (locale === 'ar' ? 'لم يتم العثور على شركات' : 'No companies found')
                : (locale === 'ar' ? 'لا توجد شركات تطابق بحثك' : 'No companies match your search')
              }
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {searchTerm && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 w-full sm:w-auto"
                >
                  {locale === 'ar' ? 'مسح البحث' : 'Clear Search'}
                </button>
              )}
              <button
                onClick={() => router.push(`/${locale}/admin/companies/new`)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full sm:w-auto"
              >
                {locale === 'ar' ? 'إنشاء شركة جديدة' : 'Create New Company'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={
          locale === 'ar' 
            ? `هل أنت متأكد من أنك تريد حذف الشركة "${deleteConfirm.companyName}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the company "${deleteConfirm.companyName}"? This action cannot be undone.`
        }
        confirmText={locale === 'ar' ? 'حذف' : 'Delete'}
        cancelText={locale === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        locale={locale}
      />
    </AdminLayout>
  );
}
