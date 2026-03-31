'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '../../../../../src/contexts/TranslationContext';
import AdminLayout from '../../../../../components/admin/layout/AdminLayout';
import Alert from '../../../../../components/ui/admin/Alert';
import ConfirmDialog from '../../../../../components/ui/admin/ConfirmDialog';
import AdminPagination from '../../../../../components/ui/admin/AdminPagination';
import { clientService, type Client } from '../../../../services/entities/client.service';
import LoadingSpinner from '../../../../../components/ui/admin/LoadingSpinner';

interface Category {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  type: string;
}

export default function ClientsManagement() {
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const router = useRouter();
  const isRTL = locale === 'ar';

  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const CLIENTS_PER_PAGE = 10;

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; clientId: number; clientName: string }>({
    isOpen: false,
    clientId: 0,
    clientName: ''
  });

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filter clients based on search query and category
  const filteredClients = useMemo(() => {
    if (!Array.isArray(clients)) return [];
    
    return clients.filter(client => {
      const searchMatch = !searchQuery.trim() ||
        client.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.category?.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.category?.name_ar.toLowerCase().includes(searchQuery.toLowerCase());
      
      const categoryMatch = selectedCategory === '' || 
        client.category?.id.toString() === selectedCategory;
      
      return searchMatch && categoryMatch;
    });
  }, [clients, searchQuery, selectedCategory]);

  // Calculate pagination
  const paginatedClients = useMemo(() => {
    if (!Array.isArray(filteredClients)) return [];
    const startIndex = (currentPage - 1) * CLIENTS_PER_PAGE;
    const endIndex = startIndex + CLIENTS_PER_PAGE;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, currentPage]);

  useEffect(() => {
    const calculatedTotalPages = Math.ceil(filteredClients.length / CLIENTS_PER_PAGE);
    setTotalPages(calculatedTotalPages);
    setTotalClients(filteredClients.length);
    
    // Reset to page 1 if current page is out of bounds
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredClients.length, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsData, categoriesData] = await Promise.all([
        clientService.getAll(),
        clientService.getCategories()
      ]);
      setClients(clientsData);
      const clientCategories = categoriesData.filter((cat: any) => cat.type === 'client');
      setCategories(clientCategories);
    } catch (err) {
      const errorMessage = locale === 'ar' 
        ? 'فشل في جلب قائمة العملاء'
        : 'Failed to fetch clients list';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [locale]);

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
    fetchClients();
  }, [fetchClients]);

  const handleDeleteClick = (clientId: number, clientName: string) => {
    setDeleteConfirm({
      isOpen: true,
      clientId,
      clientName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await clientService.delete(deleteConfirm.clientId);
      // Remove from frontend state after successful deletion
      setClients(prev => prev.filter(client => client.id !== deleteConfirm.clientId));
      setSuccess(locale === 'ar' ? 'تم حذف العميل بنجاح' : 'Client deleted successfully');
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to delete client:', err);
      setError(locale === 'ar' ? 'فشل في حذف العميل' : 'Failed to delete client');
    } finally {
      setDeleteConfirm({ isOpen: false, clientId: 0, clientName: '' });
    }
  };



  return (
    <AdminLayout 
      title={locale === 'ar' ? 'إدارة العملاء' : 'Clients Management'} 
      sidebarPosition={sidebarPosition}
    >

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={
          locale === 'ar' 
            ? `هل أنت متأكد من أنك تريد حذف العميل "${deleteConfirm.clientName}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the client "${deleteConfirm.clientName}"? This action cannot be undone.`
        }
        confirmText={locale === 'ar' ? 'حذف' : 'Delete'}
        cancelText={locale === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, clientId: 0, clientName: '' })}
        locale={locale}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main">
            {locale === 'ar' ? 'إدارة العملاء' : 'Clients Management'}
          </h1>
          <p className="text-muted">
            {locale === 'ar' 
              ? 'إدارة عملائك' 
              : 'Manage your clients'}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'ar' ? 'البحث في العملاء...' : 'Search clients...'}
              className={`${locale === 'ar' ? 'ml-0 sm:ml-6' : 'mr-0 sm:mr-6'} px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto`}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${locale === 'ar' ? 'text-right' : 'text-left'} w-full sm:w-auto`}
            >
              <option value="">{locale === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {locale === 'ar' ? category.name_ar : category.name_en}
                </option>
              ))}
            </select>
          </div>
          
          {/* Add New Button */}
          <button
            onClick={() => router.push(`/${locale}/admin/clients/new`)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full lg:w-auto"
          >
            {locale === 'ar' ? 'إنشاء عميل جديد' : 'Create New Client'}
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
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                {locale === 'ar' ? 'لا يوجد عملاء' : 'No Clients Found'}
              </div>
              <button
                onClick={() => router.push(`/${locale}/admin/clients/new`)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
              >
                {locale === 'ar' ? 'إنشاء أول عميل' : 'Create First Client'}
              </button>
            </div>
          ) : (
            <>
              {/* Clients Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {locale === 'ar' ? 'الصورة' : 'Photo'}
                      </th>
                      <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {locale === 'ar' ? 'العميل' : 'Client'}
                      </th>
                      <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {locale === 'ar' ? 'الفئة' : 'Category'}
                      </th>
                      <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {locale === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedClients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="text-gray-500 mb-4">
                            {searchQuery
                              ? (locale === 'ar' ? 'لا توجد عملاء يطابقون بحثك' : 'No clients match your search')
                              : (locale === 'ar' ? 'لم يتم العثور على عملاء' : 'No clients found')
                            }
                          </div>
                          {!searchQuery && (
                            <button
                              onClick={() => router.push(`/${locale}/admin/clients/new`)}
                              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                            >
                              {locale === 'ar' ? 'إنشاء أول عميل' : 'Create First Client'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={client.image?.url || '/default-avatar.png'}
                            alt={locale === 'ar' ? client.image?.alt_ar : client.image?.alt_en}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-main">
                            {locale === 'ar' ? client.name_ar : client.name_en}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted">
                            {locale === 'ar' ? client.category?.name_ar : client.category?.name_en}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted">
                            {new Date(client.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }).replace(/\//g, '/')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/${locale}/admin/clients/edit/${client.id}`)}
                            className={`text-indigo-600 hover:text-indigo-900 ${isRTL ? 'ml-4' : 'mr-4'}`}
                          >
                            {locale === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(client.id, locale === 'ar' ? client.name_ar : client.name_en)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {locale === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>

              {/* Admin Pagination */}
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                rowsPerPage={CLIENTS_PER_PAGE}
                totalRows={filteredClients.length}
                locale={locale}
              />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
