'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/layout/AdminLayout';
import { useTranslations } from '../../../../../src/contexts/TranslationContext';
import LoadingSpinner from '../../../../../components/ui/admin/LoadingSpinner';
import ConfirmDialog from '../../../../../components/ui/admin/ConfirmDialog';
import Alert from '../../../../../components/ui/admin/Alert';
import AdminPagination from '../../../../../components/ui/admin/AdminPagination';
import { categoryService, type Category } from '../../../../services/content/category.service';
import { useAuthCheck } from '../../../../../src/hooks/useAuthCheck';
import { useAuth } from '../../../../../src/contexts/AuthContext';

export default function CategoriesManagement() {
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

  // Load categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]); // Store all categories for filtering
  const [loading, setLoading] = useState(false); // Start with false, only set true when authenticated
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const CATEGORIES_PER_PAGE = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't fetch if not authenticated
    }

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const categoriesData = await categoryService.getCategories();
        setAllCategories(categoriesData);
        setTotalCategories(categoriesData.length);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setError(error instanceof Error ? error.message : 'Failed to load categories');
        setAllCategories([]);
      } finally {
        setLoading(false);
      }
    };
  
    loadCategories();
  }, [isAuthenticated]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'project' | 'blog'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; categoryId: string; categoryName: string }>({
    isOpen: false,
    categoryId: '',
    categoryName: ''
  });

  // Filter categories based on search and type (applied to ALL categories)
  const filteredCategories = useMemo(() => {
    return allCategories.filter(category => {
      const searchMatch = searchTerm === '' || 
        (category.name_en && category.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (category.name_ar && category.name_ar.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (category.slug && category.slug.toLowerCase().includes(searchTerm.toLowerCase()));

      const typeMatch = selectedType === 'all' || category.type === selectedType;

      return searchMatch && typeMatch;
    });
  }, [allCategories, searchTerm, selectedType]);

  // Apply pagination to FILTERED results
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE;
    const endIndex = startIndex + CATEGORIES_PER_PAGE;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage]);

  // Update pagination info for filtered results
  useEffect(() => {
    const calculatedTotalPages = Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE);
    setTotalPages(calculatedTotalPages);
    
    // Reset to page 1 if current page is beyond the filtered results
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredCategories.length, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  const handleEdit = (categoryId: string) => {
    router.push(`/${locale}/admin/categories/edit/${categoryId}`);
  };

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setDeleteConfirm({
      isOpen: true,
      categoryId,
      categoryName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await categoryService.deleteCategory(deleteConfirm.categoryId);
      // Remove from local state after successful API call
      setAllCategories(prev => prev.filter(category => category.id !== deleteConfirm.categoryId));
      setSuccess((locale as 'en' | 'ar') === 'ar' ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully');
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError((locale as 'en' | 'ar') === 'ar' ? 'فشل في حذف الفئة' : 'Failed to delete category');
    } finally {
      setDeleteConfirm({ isOpen: false, categoryId: '', categoryName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, categoryId: '', categoryName: '' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setCurrentPage(1); // Reset to page 1 when clearing filters
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <AdminLayout title={locale === 'ar' ? 'إدارة الفئات' : 'Categories Management'} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={locale === 'ar' ? 'إدارة الفئات' : 'Categories Management'} sidebarPosition={sidebarPosition}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main">
            {locale === 'ar' ? 'إدارة الفئات' : 'Categories Management'}
          </h1>
          <p className="text-muted">
            {locale === 'ar' ? 'إدارة فئات المشاريع والمنشورات' : 'Manage project and blog categories'}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'البحث في الفئات...' : 'Search categories...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${locale === 'ar' ? 'ml-0 sm:ml-6' : 'mr-0 sm:mr-6'} px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto`}
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'project' | 'blog')}
              className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${locale === 'ar' ? 'text-right' : 'text-left'}`}
            >
              <option value="all">{locale === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="project">{locale === 'ar' ? 'المشاريع' : 'Projects'}</option>
              <option value="blog">{locale === 'ar' ? 'المدونة' : 'Blog'}</option>
            </select>
          </div>
          <button
            onClick={() => router.push(`/${locale}/admin/categories/new`)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full lg:w-auto"
          >
            {locale === 'ar' ? 'إنشاء فئة جديدة' : 'Create New Category'}
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

        {/* Categories Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-lg mb-4">
                {locale === 'ar' ? 'خطأ في تحميل الفئات' : 'Error loading categories'}
              </div>
              <div className="text-gray-600 text-sm mb-4">
                {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الرابط المختصر' : 'Slug'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'النوع' : 'Type'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || selectedType !== 'all'
                        ? (locale === 'ar' ? 'لا توجد فئات تطابق بحثك' : 'No categories match your search')
                        : (locale === 'ar' ? 'لم يتم العثور على فئات' : 'No categories found')
                      }
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-main">
                          {category.name_en}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted">
                          {category.name_ar}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted">
                          {category.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.type === 'project' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {category.type === 'project' 
                            ? (locale === 'ar' ? 'مشروع' : 'Project')
                            : (locale === 'ar' ? 'مدونة' : 'Blog')
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className={`text-indigo-600 hover:text-indigo-900 ${locale === 'ar' ? 'ml-4' : 'mr-4'}`}
                        >
                          {locale === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category.id, category.name_en || category.name_ar || 'Unknown')}
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
            
            {/* Admin Pagination */}
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              rowsPerPage={CATEGORIES_PER_PAGE}
              totalRows={filteredCategories.length}
              locale={locale}
            />
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 text-lg mb-4">
              {allCategories.length === 0 
                ? (locale === 'ar' ? 'لم يتم العثور على فئات' : 'No categories found')
                : (locale === 'ar' ? 'لا توجد فئات تطابق بحثك' : 'No categories match your search')
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
                onClick={() => router.push(`/${locale}/admin/categories/new`)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full sm:w-auto"
              >
                {locale === 'ar' ? 'إنشاء فئة جديدة' : 'Create New Category'}
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
            ? `هل أنت متأكد من أنك تريد حذف الفئة "${deleteConfirm.categoryName}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the category "${deleteConfirm.categoryName}"? This action cannot be undone.`
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
