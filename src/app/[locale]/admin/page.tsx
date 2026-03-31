'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../components/admin/layout/AdminLayout';
import { useTranslations, useLocale } from '../../../contexts/TranslationContext';
import { useAuthCheck } from '../../../hooks/useAuthCheck';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../../components/ui/admin/LoadingSpinner';
import { fetchWithTokenRefresh } from '../../../services/auth/auth-fetch';

interface DashboardStats {
  total_blogs: number;
  total_projects: number;
  total_employees: number;
  total_companies: number;
  total_members: number;
  total_clients: number;
}

export default function AdminDashboard() {
  // Check authentication on component mount
  useAuthCheck();
  const { isAuthenticated } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { t } = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchWithTokenRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/dashboard/stats/`);
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(locale === 'ar' ? 'فشل تحميل الإحصائيات' : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, locale]);

  // Stats configuration with real data
  const statsConfig = [
    {
      title: t('admin.dashboard.stats.blogPosts'),
      value: stats?.total_blogs.toString() || '0',
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500'
    },
    {
      title: t('admin.dashboard.stats.projects'), 
      value: stats?.total_projects.toString() || '0',
      icon: '🏗️',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500'
    },
    {
      title: t('admin.dashboard.stats.employees'),
      value: stats?.total_employees.toString() || '0',
      icon: '👥',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500'
    },
    {
      title: t('admin.dashboard.stats.companies'),
      value: stats?.total_companies.toString() || '0',
      icon: '🏢',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500'
    },
    {
      title: locale === 'ar' ? 'أعضاء القيادة' : 'Leadership Members',
      value: stats?.total_members.toString() || '0',
      icon: '⭐',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      iconBg: 'bg-pink-500'
    },
    {
      title: locale === 'ar' ? 'العملاء' : 'Clients',
      value: stats?.total_clients.toString() || '0',
      icon: '🤝',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'from-teal-50 to-teal-100',
      iconBg: 'bg-teal-500'
    }
  ];

  // Hide public header/footer for admin pages
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
      
      const showElements = () => {
        const publicHeader = document.querySelector('header.fixed.top-0.left-0.right-0') as HTMLElement;
        const publicFooter = document.querySelector('footer') as HTMLElement;
        const headerSpacer = document.querySelector('div[style*="height: 80px"]') as HTMLElement;
        
        if (publicHeader) publicHeader.style.display = '';
        if (headerSpacer) headerSpacer.style.display = '';
        if (publicFooter) publicFooter.style.display = '';
      };
      showElements();
    };
  }, []);

  // Show loading while checking authentication or fetching stats
  if (!isAuthenticated || loading) {
    return (
      <AdminLayout title={t('admin.dashboard.title')} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout title={t('admin.dashboard.title')} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">{error}</h3>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-red-600 underline text-sm mt-1"
                >
                  {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.dashboard.title')} sidebarPosition={sidebarPosition}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
          <p className="text-gray-600">{t('admin.dashboard.subtitle')}</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 max-w-7xl w-full">
            {statsConfig.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm"
              >
                {/* Decorative background pattern */}
                <div className="absolute inset-0 bg-white/40 rounded-2xl transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300"></div>
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon container */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.iconBg} rounded-xl mb-4 shadow-lg mx-auto`}>
                    <span className="text-2xl filter drop-shadow-sm">{stat.icon}</span>
                  </div>
                  
                  {/* Stats value */}
                  <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{stat.value}</h3>
                  
                  {/* Stats title */}
                  <p className="text-gray-700 font-medium text-sm">{stat.title}</p>
                  
                  {/* Subtle decoration line */}
                  <div className={`mt-4 h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-60 mx-auto`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">{t('admin.dashboard.quickActions.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Content Management */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 text-center">{locale === 'ar' ? 'إدارة المحتوى' : 'Content Management'}</h4>
                  <button 
                    onClick={() => router.push(`/${locale}/admin/blog/new`)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 text-left hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className={locale === 'ar' ? 'text-right' : ''}>
                        <div className="font-semibold flex items-center">
                          <span className={`text-xl ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>✍️</span>
                          {t('admin.dashboard.quickActions.newBlogPost')}
                        </div>
                        <div className="text-xs opacity-90 mt-1">{t('admin.dashboard.quickActions.createContent')}</div>
                      </div>
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/${locale}/admin/projects/new`)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 text-left hover:from-green-600 hover:to-green-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className={locale === 'ar' ? 'text-right' : ''}>
                        <div className="font-semibold flex items-center">
                          <span className={`text-xl ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>🏗️</span>
                          {t('admin.dashboard.quickActions.addProject')}
                        </div>
                        <div className="text-xs opacity-90 mt-1">{t('admin.dashboard.quickActions.newProject')}</div>
                      </div>
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Team & Organization */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 text-center">{locale === 'ar' ? 'الفريق والمنظمة' : 'Team & Organization'}</h4>
                  <button 
                    onClick={() => router.push(`/${locale}/admin/employees/new`)}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 text-left hover:from-purple-600 hover:to-purple-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className={locale === 'ar' ? 'text-right' : ''}>
                        <div className="font-semibold flex items-center">
                          <span className={`text-xl ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>👤</span>
                          {t('admin.dashboard.quickActions.addEmployee')}
                        </div>
                        <div className="text-xs opacity-90 mt-1">{t('admin.dashboard.quickActions.teamMember')}</div>
                      </div>
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/${locale}/admin/companies/new`)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 text-left hover:from-orange-600 hover:to-orange-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className={locale === 'ar' ? 'text-right' : ''}>
                        <div className="font-semibold flex items-center">
                          <span className={`text-xl ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>🏢</span>
                          {locale === 'ar' ? 'إضافة شركة' : 'Add Company'}
                        </div>
                        <div className="text-xs opacity-90 mt-1">{locale === 'ar' ? 'إضافة منظمة جديدة' : 'Add new organization'}</div>
                      </div>
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  <button 
                    onClick={() => router.push(`/${locale}/admin/leadership/new`)}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg p-4 text-left hover:from-pink-600 hover:to-pink-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className={locale === 'ar' ? 'text-right' : ''}>
                        <div className="font-semibold flex items-center">
                          <span className={`text-xl ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>⭐</span>
                          {locale === 'ar' ? 'إضافة عضو قيادي' : 'Add Leadership Member'}
                        </div>
                        <div className="text-xs opacity-90 mt-1">{locale === 'ar' ? 'إضافة عضو جديد للقيادة' : 'Add new leadership member'}</div>
                      </div>
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  <button 
                    onClick={() => router.push(`/${locale}/admin/clients/new`)}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg p-4 text-left hover:from-teal-600 hover:to-teal-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className={locale === 'ar' ? 'text-right' : ''}>
                        <div className="font-semibold flex items-center">
                          <span className={`text-xl ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>🤝</span>
                          {locale === 'ar' ? 'إضافة عميل' : 'Add Client'}
                        </div>
                        <div className="text-xs opacity-90 mt-1">{locale === 'ar' ? 'إضافة عميل جديد' : 'Add new client'}</div>
                      </div>
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={() => router.push(`/${locale}/admin/categories`)}
                    className="bg-gray-100 text-gray-700 rounded-lg p-3 text-left hover:bg-gray-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <span className={`text-lg ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}>📁</span>
                      <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
                        <div className="font-medium text-sm">{locale === 'ar' ? 'الفئات' : 'Categories'}</div>
                        <div className="text-xs opacity-75">{locale === 'ar' ? 'إدارة العلامات' : 'Manage tags'}</div>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/${locale}/admin/settings`)}
                    className="bg-gray-100 text-gray-700 rounded-lg p-3 text-left hover:bg-gray-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <span className={`text-lg ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}>⚙️</span>
                      <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
                        <div className="font-medium text-sm">{locale === 'ar' ? 'الإعدادات' : 'Settings'}</div>
                        <div className="text-xs opacity-75">{locale === 'ar' ? 'تكوين الحساب' : 'Account config'}</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
