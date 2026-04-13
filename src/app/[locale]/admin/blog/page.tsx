'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/layout/AdminLayout';
import { useTranslations, useLocale } from '../../../../contexts/TranslationContext';
import { blogService } from '../../../../services/content/blog.service';
import LoadingSpinner from '../../../../../components/ui/admin/LoadingSpinner';
import EmptyState from '../../../../../components/ui/admin/EmptyState';
import ConfirmDialog from '../../../../../components/ui/admin/ConfirmDialog';
import Alert from '../../../../../components/ui/admin/Alert';
import AdminPagination from '../../../../../components/ui/admin/AdminPagination';
import { useAuthCheck } from '../../../../../src/hooks/useAuthCheck';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import { translateError } from '@/lib/errorMessages';

// Helper function to generate slug from title
const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Admin-specific BlogPost interface for the table display
interface AdminBlogPost {
  id: string;
  slug: string;
  title: {
    en: string;
    ar: string;
  };
  excerpt: {
    en: string;
    ar: string;
  };
  category: {
    id: string;
    name: string;
  };
  coverImage: {
    url: string;
    alt: {
      en: string;
      ar: string;
    };
  };
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  author: {
    name: string;
    avatar: string;
  };
}

export default function BlogManagement() {
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

  const { t } = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  // Load blog posts using service
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
  const [allBlogPosts, setAllBlogPosts] = useState<AdminBlogPost[]>([]); // Store all posts for filtering
  const [categories, setCategories] = useState<Array<{id: number; name_en: string; name_ar: string}>>([]);
  const [loading, setLoading] = useState(false); // Start with false, only set true when authenticated
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; postId: string; postTitle: string }>({
    isOpen: false,
    postId: '',
    postTitle: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const POSTS_PER_PAGE = 10;
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't fetch if not authenticated
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch blog posts
        const response = await blogService.getAllPosts(1, 1000); // Get all posts for admin
        // Transform the data to match the admin interface
        const transformedPosts = response.posts.map(post => {
          return {
          id: post.id.toString(),
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          category: {
            id: post.category?.id?.toString() || '1',
            name: post.category?.name?.en || 'Technology'
          },
          coverImage: {
            url: post.cover_image?.url || '/images/default-cover.jpg',
            alt: {
              en: post.title?.en || 'Blog post',
              ar: post.title?.ar || 'مقال مدونة'
            }
          },
          publishedAt: post.published_at || new Date().toISOString(),
          status: post.status || 'published',
          author: {
            name: post.author?.name || 'Super Arc Team',
            avatar: post.author?.avatar || '/images/default-author.jpg'
          },
          tags: post.tags?.en || [],
          featured: post.is_featured || false,
          readingTime: post.reading_time || 5,
          createdAt: post.created_at || post.published_at || new Date().toISOString(),
          updatedAt: post.updated_at || post.published_at || new Date().toISOString()
          };
        });
        setAllBlogPosts(transformedPosts);
        setTotalPosts(transformedPosts.length);

        const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
        const categoriesResponse = await fetch(`${baseUrl}/categories/?type=blog`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.results || categoriesData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, locale]);

  // Filter blog posts based on search and filters (applied to ALL posts)
  const filteredBlogPosts = useMemo(() => {
    return allBlogPosts.filter(post => {
      const searchMatch = searchTerm === '' || 
        post.title[locale as 'en' | 'ar'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt[locale as 'en' | 'ar'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const categoryMatch = categoryFilter === '' || post.category.id === categoryFilter;
      const statusMatch = statusFilter === '' || post.status === statusFilter;

      return searchMatch && categoryMatch && statusMatch;
    });
  }, [allBlogPosts, searchTerm, categoryFilter, statusFilter, locale]);

  // Apply pagination to FILTERED results
  const paginatedBlogPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return filteredBlogPosts.slice(startIndex, endIndex);
  }, [filteredBlogPosts, currentPage]);

  // Update pagination info for filtered results
  useEffect(() => {
    const calculatedTotalPages = Math.ceil(filteredBlogPosts.length / POSTS_PER_PAGE);
    setTotalPages(calculatedTotalPages);
    
    // Reset to page 1 if current page is beyond the filtered results
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredBlogPosts.length, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleEdit = (postSlug: string) => {
    router.push(`/${locale}/admin/blog/edit/${postSlug}`);
  };

  // Delete handlers
  const handleDeleteClick = (postSlug: string, postTitle: { en: string; ar: string }) => {
    setDeleteConfirm({
      isOpen: true,
      postId: postSlug, // Using slug as the identifier
      postTitle: postTitle[locale as 'en' | 'ar']
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await blogService.deletePost(deleteConfirm.postId);
      setBlogPosts(prev => prev.filter(post => post.slug !== deleteConfirm.postId));
      setSuccess(locale === 'ar' ? 'تم حذف المقال بنجاح' : 'Post deleted successfully');
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error deleting post:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      setError(translateError(errorMessage, locale));
    } finally {
      setDeleteConfirm({ isOpen: false, postId: '', postTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, postId: '', postTitle: '' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setCurrentPage(1); // Reset to page 1 when clearing filters
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 because getMonth() returns 0-11
    const year = date.getFullYear();
    const formatted = `${day}/${month}/${year}`;
    return formatted;
  };

  const getStatusBadge = (status: 'draft' | 'published' | 'archived') => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-orange-100 text-orange-800'
    };
    
    const labels = {
      draft: locale === 'ar' ? 'مسودة' : 'Draft',
      published: locale === 'ar' ? 'منشور' : 'Published',
      archived: locale === 'ar' ? 'مؤرشف' : 'Archived'
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
      <AdminLayout title={locale === 'ar' ? 'إدارة المدونات' : 'Blog Management'} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={locale === 'ar' ? 'إدارة المدونات' : 'Blog Management'} sidebarPosition={sidebarPosition}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main">
            {locale === 'ar' ? 'إدارة المدونات' : 'Blog Management'}
          </h1>
          <p className="text-muted">
            {locale === 'ar' ? 'إدارة مشاريع المدونة الخاصة بك' : 'Manage your blog posts'}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'البحث في منشورات المدونة...' : 'Search blog posts...'}
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
                  {locale === 'ar' ? 'جميع الفئات' : 'All Categories'}
                </option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {locale === 'ar' ? category.name_ar : category.name_en}
                  </option>
                ))}
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto"
              >
                <option value="">
                  {locale === 'ar' ? 'جميع الحالات' : 'All Status'}
                </option>
                <option value="published">
                  {locale === 'ar' ? 'منشور' : 'Published'}
                </option>
                <option value="draft">
                  {locale === 'ar' ? 'مسودة' : 'Draft'}
                </option>
                <option value="archived">
                  {locale === 'ar' ? 'مؤرشف' : 'Archived'}
                </option>
              </select>
            </div>
            {(searchTerm || categoryFilter || statusFilter) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-muted hover:text-main border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto"
              >
                {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
              </button>
            )}
          </div>
          <button
            onClick={() => router.push(`/${locale}/admin/blog/new`)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full lg:w-auto"
          >
            {locale === 'ar' ? 'إنشاء منشور جديد' : 'Create New Post'}
          </button>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted">
          {(searchTerm || categoryFilter || statusFilter) && (
            locale === 'ar' 
              ? `عرض ${filteredBlogPosts.length} من ${allBlogPosts.length} مشاركة`
              : `Showing ${filteredBlogPosts.length} of ${allBlogPosts.length} posts`
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

        {/* Blog Posts Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredBlogPosts.length === 0 ? (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد مقالات' : 'No blog posts yet'}
              description={locale === 'ar' ? 'لم يتم إنشاء أي مقالات حتى الآن' : 'No blog posts have been created yet'}
              actionText={locale === 'ar' ? 'إنشاء مقال جديد' : 'Create New Post'}
              onAction={() => router.push(`/${locale}/admin/blog/new`)}
              icon="📝"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th className={`px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'العنوان' : 'Title'}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الفئة' : 'Category'}
                  </th>
                  <th className={`hidden md:table-cell px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'تاريخ النشر' : 'Published Date'}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBlogPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
                          {post.title[locale as 'en' | 'ar']}
                        </div>
                        <div className="text-sm text-gray-500 hidden sm:block">
                          {post.slug}
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm text-gray-900">{post.category.name}</div>
                    </td>
                    <td className={`hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm text-main">
                        {formatDate(post.publishedAt)}
                      </div>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(post.slug)}
                        className={`text-indigo-600 hover:text-indigo-900 ${locale === 'ar' ? 'ml-2' : 'mr-2'} block sm:inline`}
                      >
                        {locale === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(post.slug, post.title)}
                        className="text-red-600 hover:text-red-900 block sm:inline mt-1 sm:mt-0"
                      >
                        {locale === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Admin Pagination */}
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              rowsPerPage={POSTS_PER_PAGE}
              totalRows={filteredBlogPosts.length}
              locale={locale as 'en' | 'ar'}
            />
          </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title={locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={
            locale === 'ar' 
              ? `هل أنت متأكد من أنك تريد حذف المقال "${deleteConfirm.postTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete the blog post "${deleteConfirm.postTitle}"? This action cannot be undone.`
          }
          confirmText={locale === 'ar' ? 'حذف' : 'Delete'}
          cancelText={locale === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          locale={locale}
        />
      </div>
    </AdminLayout>
  );
}
