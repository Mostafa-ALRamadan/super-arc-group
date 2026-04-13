'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/layout/AdminLayout';
import { useTranslations } from '../../../../../src/contexts/TranslationContext';
import { leadershipService, type Leadership } from '../../../../services/entities/leadership.service';
import LoadingSpinner from '../../../../../components/ui/admin/LoadingSpinner';
import ConfirmDialog from '../../../../../components/ui/admin/ConfirmDialog';
import Alert from '../../../../../components/ui/admin/Alert';
import AdminPagination from '../../../../../components/ui/admin/AdminPagination';
import { useAuthCheck } from '../../../../../src/hooks/useAuthCheck';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import { translateError } from '@/lib/errorMessages';

export default function LeadershipManagement() {
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
  
  // State management
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: number | null; name: string }>({
    isOpen: false,
    id: null,
    name: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeadership, setTotalLeadership] = useState(0);
  const LEADERSHIP_PER_PAGE = 10;
  
  // Fetch leadership members
  const fetchLeadership = async () => {
    try {
      setLoading(true);
      const data = await leadershipService.getAll();
      setLeadership(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching leadership members:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leadership members');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeadership();
    }
  }, [isAuthenticated]);
  
  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await leadershipService.delete(id);
      // Remove from frontend state after successful deletion
      setLeadership(prev => prev.filter(member => member.id !== id));
      setSuccess((locale as 'en' | 'ar') === 'ar' ? 'تم حذف العضو القيادي بنجاح' : 'Leadership member deleted successfully');
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
      setDeleteDialog({ isOpen: false, id: null, name: '' });
    } catch (err) {
      console.error('Failed to delete leadership member:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete leadership member';
      setError(translateError(errorMessage, locale));
    }
  };
  
  // Pagination
  const paginatedLeadership = useMemo(() => {
    const startIndex = (currentPage - 1) * LEADERSHIP_PER_PAGE;
    const endIndex = startIndex + LEADERSHIP_PER_PAGE;
    return leadership.slice(startIndex, endIndex);
  }, [leadership, currentPage]);

  // Update pagination info
  useEffect(() => {
    const calculatedTotalPages = Math.ceil(leadership.length / LEADERSHIP_PER_PAGE);
    setTotalPages(calculatedTotalPages);
    setTotalLeadership(leadership.length);
    
    // Reset to page 1 if current page is beyond the results
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [leadership.length, currentPage]);
  
  if (!isAuthenticated) {
    return (
      <AdminLayout title="Leadership Management">
        <div className="p-6">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={locale === 'ar' ? 'إدارة القيادة' : 'Leadership Management'} sidebarPosition={sidebarPosition}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main">
            {locale === 'ar' ? 'إدارة القيادة' : 'Leadership Management'}
          </h1>
          <p className="text-muted">
            {locale === 'ar' ? 'إدارة أعضاء الفريق القيادي' : 'Manage leadership team members'}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => router.push(`/${locale}/admin/leadership/new`)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
          >
            {locale === 'ar' ? 'إنشاء عضو قيادي' : 'Create Leadership Member'}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : leadership.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                {locale === 'ar' ? 'لم يتم العثور على أعضاء قياديين' : 'No leadership members found'}
              </div>
              <button
                onClick={() => router.push(`/${locale}/admin/leadership/new`)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
              >
                {locale === 'ar' ? 'إنشاء أول عضو قيادي' : 'Create First Leadership Member'}
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        {locale === 'ar' ? 'الصورة' : 'Photo'}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        {locale === 'ar' ? 'الاسم' : 'Name'}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        {locale === 'ar' ? 'المنصب' : 'Position'}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        {locale === 'ar' ? 'الوصف' : 'Description'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedLeadership.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 flex-shrink-0">
                            {member.image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={member.image.url}
                                alt={member.image.alt_en || member[`name_${locale}`]}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-sm">
                                  {member.initials}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-main">
                            {member[`name_${locale}`]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted">
                            {member[`position_${locale}`]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted max-w-xs truncate">
                            {member[`description_${locale}`]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/${locale}/admin/leadership/edit/${member.id}`)}
                            className={`text-indigo-600 hover:text-indigo-900 ${locale === 'ar' ? 'ml-4' : 'mr-4'}`}
                          >
                            {locale === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                          <button
                            onClick={() => setDeleteDialog({
                              isOpen: true,
                              id: member.id,
                              name: member[`name_${locale}`]
                            })}
                            className="text-red-600 hover:text-red-900"
                          >
                            {locale === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Admin Pagination */}
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                rowsPerPage={LEADERSHIP_PER_PAGE}
                totalRows={leadership.length}
                locale={locale}
              />
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title={locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={
            locale === 'ar'
              ? `هل أنت متأكد من أنك تريد حذف العضو القيادي "${deleteDialog.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete the leadership member "${deleteDialog.name}"? This action cannot be undone.`
          }
          confirmText={locale === 'ar' ? 'حذف' : 'Delete'}
          cancelText={locale === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={() => deleteDialog.id && handleDelete(deleteDialog.id)}
          onCancel={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
          locale={locale}
        />
      </div>
    </AdminLayout>
  );
}
