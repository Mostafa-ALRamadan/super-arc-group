'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/layout/AdminLayout';
import { useTranslations } from '../../../../../src/contexts/TranslationContext';
import LoadingSpinner from '../../../../../components/ui/admin/LoadingSpinner';
import EmptyState from '../../../../../components/ui/admin/EmptyState';
import ConfirmDialog from '../../../../../components/ui/admin/ConfirmDialog';
import Alert from '../../../../../components/ui/admin/Alert';
import { useAuthCheck } from '../../../../../src/hooks/useAuthCheck';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import { fetchWithTokenRefresh } from '../../../../services/auth/auth-fetch';

interface Project {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string;
  content: {
    en: {
      time: number;
      blocks: Array<any>;
      version: string;
    };
    ar: {
      time: number;
      blocks: Array<any>;
      version: string;
    };
  };
  image_id: number | null;
  image_url: string;
  category_id: number | null;
  location_en: string;
  location_ar: string;
  client: string;
  completed_at: string;
  seo: {
    meta_description: string;
    social_title: string;
    social_description: string;
  };
  category?: {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    type: string;
  };
}

export default function ProjectsManagement() {
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

  // State for projects and categories
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Array<{id: number; name_en: string; name_ar: string}>>([]);
  const [loading, setLoading] = useState(false); // Start with false, only set true when authenticated
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch projects and categories from API (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't fetch if not authenticated
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
        
        // Fetch projects
        const projectsResponse = await fetchWithTokenRefresh(`${baseUrl}/projects/`);
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.results || projectsData || []);
        
        // Fetch categories for filters
        const categoriesResponse = await fetchWithTokenRefresh(`${baseUrl}/categories/?type=project`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.results || categoriesData || []);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, locale]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; projectId: string; projectTitle: string }>({
    isOpen: false,
    projectId: '',
    projectTitle: ''
  });

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const searchMatch = searchTerm === '' || 
      (locale === 'ar' ? project.title_ar : project.title_en).toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (locale === 'ar' ? project.location_ar : project.location_en).toLowerCase().includes(searchTerm.toLowerCase());

    const categoryMatch = categoryFilter === '' || (project.category && project.category.id === Number(categoryFilter));

    return searchMatch && categoryMatch;
  });

  const handleEdit = (projectId: number) => {
    // Find the project to get its slug
    const project = projects.find(p => p.id === projectId);
    if (project && project.slug) {
      router.push(`/${locale}/admin/projects/edit/${project.slug}`);
    } else {
      console.error('Project not found or no slug available for ID:', projectId);
      // Fallback to ID if slug is not available
      router.push(`/${locale}/admin/projects/edit/${projectId}`);
    }
  };

  const handleDeleteClick = (projectId: number, projectTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      projectId: projectId.toString(),
      projectTitle
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      // Find the project to get its slug for the API call
      const project = projects.find(p => p.id === parseInt(deleteConfirm.projectId));
      if (!project || !project.slug) {
        console.error('Project not found or no slug available for deletion');
        return;
      }

      const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
      const response = await fetchWithTokenRefresh(`${baseUrl}/projects/${project.slug}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Remove from frontend state after successful deletion
      setProjects(prev => prev.filter(p => p.id !== parseInt(deleteConfirm.projectId)));
      setSuccess((locale as 'en' | 'ar') === 'ar' ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully');
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError((locale as 'en' | 'ar') === 'ar' ? 'فشل في حذف المشروع' : 'Failed to delete project');
    } finally {
      setDeleteConfirm({ isOpen: false, projectId: '', projectTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, projectId: '', projectTitle: '' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: 'completed' | 'ongoing' | 'planned') => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      ongoing: 'bg-blue-100 text-blue-800',
      planned: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      completed: (locale as 'en' | 'ar') === 'ar' ? 'مكتمل' : 'Completed',
      ongoing: (locale as 'en' | 'ar') === 'ar' ? 'قيد التنفيذ' : 'Ongoing',
      planned: (locale as 'en' | 'ar') === 'ar' ? 'مخطط' : 'Planned'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <AdminLayout title={locale === 'ar' ? 'إدارة المشاريع' : 'Projects Management'} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={locale === 'ar' ? 'إدارة المشاريع' : 'Projects Management'} sidebarPosition={sidebarPosition}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main">
            {(locale as 'en' | 'ar') === 'ar' ? 'إدارة المشاريع' : 'Projects Management'}
          </h1>
          <p className="text-muted">
            {(locale as 'en' | 'ar') === 'ar' ? 'إدارة مشاريع الشركة الخاصة بك' : 'Manage your company projects'}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'البحث في المشاريع...' : 'Search projects...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${locale === 'ar' ? 'ml-0 sm:ml-6' : 'mr-0 sm:mr-6'} px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto`}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto"
              >
                <option value="">
                  {(locale as 'en' | 'ar') === 'ar' ? 'جميع الفئات' : 'All Categories'}
                </option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {locale === 'ar' ? category.name_ar : category.name_en}
                  </option>
                ))}
              </select>
            </div>
            {(searchTerm || categoryFilter) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-muted hover:text-main border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto"
              >
                {(locale as 'en' | 'ar') === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
              </button>
            )}
          </div>
          <button
            onClick={() => router.push(`/${locale}/admin/projects/new`)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full lg:w-auto"
          >
            {(locale as 'en' | 'ar') === 'ar' ? 'إنشاء مشروع جديد' : 'Create New Project'}
          </button>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted">
          {(searchTerm || categoryFilter) && (
            (locale as 'en' | 'ar') === 'ar' 
              ? `عرض ${filteredProjects.length} من ${projects.length} مشروع`
              : `Showing ${filteredProjects.length} of ${projects.length} projects`
          )}
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

        {/* Projects Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                    {(locale as 'en' | 'ar') === 'ar' ? 'العنوان' : 'Title'}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                    {(locale as 'en' | 'ar') === 'ar' ? 'العميل' : 'Client'}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                    {(locale as 'en' | 'ar') === 'ar' ? 'الفئة' : 'Category'}
                  </th>
                  <th className={`hidden md:table-cell px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                    {(locale as 'en' | 'ar') === 'ar' ? 'الموقع' : 'Location'}
                  </th>
                  <th className={`hidden md:table-cell px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                    {(locale as 'en' | 'ar') === 'ar' ? 'تاريخ الإنجاز' : 'Completed Date'}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {(locale as 'en' | 'ar') === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div>
                        <div className="text-sm font-medium text-main truncate max-w-[120px] sm:max-w-[200px]">
                          {locale === 'ar' ? project.title_ar : project.title_en}
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm text-main">{project.client}</div>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm text-main">
                        {project.category 
                          ? (locale === 'ar' ? project.category.name_ar : project.category.name_en)
                          : (locale === 'ar' ? 'غير محدد' : 'Uncategorized')
                        }
                      </div>
                    </td>
                    <td className={`hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm text-main">
                        {locale === 'ar' ? project.location_ar : project.location_en}
                      </div>
                    </td>
                    <td className={`hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap ${(locale as 'en' | 'ar') === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm text-main">
                        {formatDate(project.completed_at)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(project.id)}
                        className={`text-indigo-600 hover:text-indigo-900 ${(locale as 'en' | 'ar') === 'ar' ? 'ml-2' : 'mr-2'} block sm:inline`}
                      >
                        {(locale as 'en' | 'ar') === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(project.id, locale === 'ar' ? project.title_ar : project.title_en)}
                        className="text-red-600 hover:text-red-900 block sm:inline mt-1 sm:mt-0"
                      >
                        {(locale as 'en' | 'ar') === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <EmptyState
            title={projects.length === 0 
              ? ((locale as 'en' | 'ar') === 'ar' ? 'لا توجد مشاريع' : 'No projects yet')
              : ((locale as 'en' | 'ar') === 'ar' ? 'لا توجد مشاريع مطابقة' : 'No matching projects')
            }
            description={projects.length === 0 
              ? ((locale as 'en' | 'ar') === 'ar' ? 'لم يتم إنشاء أي مشاريع حتى الآن' : 'No projects have been created yet')
              : ((locale as 'en' | 'ar') === 'ar' ? 'لم يتم العثور على مشاريع تطابق فلاترك' : 'No projects found matching your filters')
            }
            actionText={projects.length === 0 
              ? ((locale as 'en' | 'ar') === 'ar' ? 'إنشاء مشروع جديد' : 'Create New Project')
              : ((locale as 'en' | 'ar') === 'ar' ? 'مسح الفلاتر' : 'Clear Filters')
            }
            onAction={projects.length === 0 
              ? (() => router.push(`/${locale}/admin/projects/new`))
              : clearFilters
            }
            icon="🏗️"
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={
          locale === 'ar' 
            ? `هل أنت متأكد من أنك تريد حذف المشروع "${deleteConfirm.projectTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the project "${deleteConfirm.projectTitle}"? This action cannot be undone.`
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
