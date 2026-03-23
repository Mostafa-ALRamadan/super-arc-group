'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/layout/AdminLayout';
import { useTranslations } from '../../../../../src/contexts/TranslationContext';
import { employeeService, type Employee } from '../../../../services/entities/employee.service';
import { companiesService, type Company } from '../../../../services/entities/companies.service';
import LoadingSpinner from '../../../../../components/ui/admin/LoadingSpinner';
import ConfirmDialog from '../../../../../components/ui/admin/ConfirmDialog';
import Alert from '../../../../../components/ui/admin/Alert';
import { useAuthCheck } from '../../../../../src/hooks/useAuthCheck';
import { useAuth } from '../../../../../src/contexts/AuthContext';

export default function EmployeesManagement() {
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

  // State for employees and companies
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false); // Start with false, only set true when authenticated
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; employeeId: string; employeeName: string }>({
    isOpen: false,
    employeeId: '',
    employeeName: ''
  });

  // Get company name by ID or name
  const getCompanyName = (companyId: number | null, companyName?: string) => {
    if (companyId) {
      const company = companies.find(c => c.id === companyId);
      if (company) return company.name[locale as 'en' | 'ar'];
    }
    
    // If no company_id, try to find by name
    if (companyName) {
      // Backend returns concatenated format: "English name (Arabic name)"
      // Try to extract just the English part
      const englishMatch = companyName.match(/^([^(]+)\s*\(/);
      const englishName = englishMatch ? englishMatch[1].trim() : companyName;
      
      // Try to find by English name first
      let company = companies.find(c => c.name.en === englishName);
      
      // If not found, try the full name
      if (!company) {
        company = companies.find(c => 
          c.name.en === companyName || 
          c.name.ar === companyName ||
          `${c.name.en} (${c.name.ar})` === companyName
        );
      }
      
      if (company) return company.name[locale as 'en' | 'ar'];
    }
    
    return locale === 'ar' ? 'غير معروف' : 'Unknown';
  };

  // Fetch employees and companies on mount (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't fetch if not authenticated
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesData, companiesData] = await Promise.all([
          employeeService.getEmployees(),
          companiesService.getCompanies()
        ]);
        setEmployees(employeesData);
        setCompanies(companiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Filter employees based on search and company
  const filteredEmployees = employees.filter(employee => {
    const searchMatch = searchTerm === '' || 
      employee.name[locale as 'en' | 'ar'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position[locale as 'en' | 'ar'].toLowerCase().includes(searchTerm.toLowerCase());

    let companyMatch = selectedCompany === '';
    
    if (selectedCompany !== '') {
      // First try to match by company_id
      if (employee.company_id && employee.company_id.toString() === selectedCompany) {
        companyMatch = true;
      } else if (!employee.company_id && employee.company) {
        // If no company_id, try to match by company name
        const selectedCompanyObj = companies.find(c => c.id.toString() === selectedCompany);
        if (selectedCompanyObj) {
          // Backend returns "English name (Arabic name)" format
          const englishMatch = employee.company.match(/^([^(]+)\s*\(/);
          const englishName = englishMatch ? englishMatch[1].trim() : employee.company;
          
          companyMatch = selectedCompanyObj.name.en === englishName || 
                        selectedCompanyObj.name.ar === employee.company ||
                        `${selectedCompanyObj.name.en} (${selectedCompanyObj.name.ar})` === employee.company;
        }
      }
    }
    
    return searchMatch && companyMatch;
  });

  const handleEdit = (employeeId: number) => {
    router.push(`/${locale}/admin/employees/edit/${employeeId}`);
  };

  const handleDeleteClick = (employeeId: number, employeeName: string) => {
    setDeleteConfirm({
      isOpen: true,
      employeeId: employeeId.toString(),
      employeeName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await employeeService.deleteEmployee(deleteConfirm.employeeId);
      setEmployees(prev => prev.filter(employee => employee.id !== parseInt(deleteConfirm.employeeId)));
      setSuccess((locale as 'en' | 'ar') === 'ar' ? 'تم حذف الموظف بنجاح' : 'Employee deleted successfully');
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to delete employee:', err);
      setError((locale as 'en' | 'ar') === 'ar' ? 'فشل في حذف الموظف' : 'Failed to delete employee');
    } finally {
      setDeleteConfirm({ isOpen: false, employeeId: '', employeeName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, employeeId: '', employeeName: '' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCompany('');
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <AdminLayout title={locale === 'ar' ? 'إدارة الموظفين' : 'Employees Management'} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout title={locale === 'ar' ? 'إدارة الموظفين' : 'Employees Management'} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-main">
              {locale === 'ar' ? 'إدارة الموظفين' : 'Employees Management'}
            </h1>
            <p className="text-muted">
              {locale === 'ar' ? 'إدارة موظفي الشركة' : 'Manage company employees'}
            </p>
          </div>

          {/* Actions Bar */}
          <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث في الموظفين...' : 'Search employees...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${locale === 'ar' ? 'ml-0 sm:ml-6' : 'mr-0 sm:mr-6'} px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto`}
              />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${locale === 'ar' ? 'text-right' : 'text-left'}`}
              >
                <option value="">{locale === 'ar' ? 'جميع الشركات' : 'All Companies'}</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id.toString()}>
                    {company.name[locale as 'en' | 'ar']}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => router.push(`/${locale}/admin/employees/new`)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full lg:w-auto"
            >
              {locale === 'ar' ? 'إنشاء موظف جديد' : 'Create New Employee'}
            </button>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={locale === 'ar' ? 'إدارة الموظفين' : 'Employees Management'} sidebarPosition={sidebarPosition}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={locale === 'ar' ? 'إدارة الموظفين' : 'Employees Management'} sidebarPosition={sidebarPosition}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main">
            {locale === 'ar' ? 'إدارة الموظفين' : 'Employees Management'}
          </h1>
          <p className="text-muted">
            {locale === 'ar' ? 'إدارة موظفي الشركات والفرق' : 'Manage company employees and teams'}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'البحث في الموظفين...' : 'Search employees...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${locale === 'ar' ? 'ml-0 sm:ml-6' : 'mr-0 sm:mr-6'} px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto`}
            />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${locale === 'ar' ? 'text-right' : 'text-left'}`}
            >
              <option value="">{locale === 'ar' ? 'جميع الشركات' : 'All Companies'}</option>
              {companies.map(company => (
                <option key={company.id} value={company.id.toString()}>
                  {company.name[locale as 'en' | 'ar']}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => router.push(`/${locale}/admin/employees/new`)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full lg:w-auto"
          >
            {locale === 'ar' ? 'إنشاء موظف جديد' : 'Create New Employee'}
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

        {/* Employees Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                    {locale === 'ar' ? 'الشركة' : 'Company'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || selectedCompany
                        ? (locale === 'ar' ? 'لا توجد موظفين تطابق بحثك' : 'No employees match your search')
                        : (locale === 'ar' ? 'لم يتم العثور على موظفين' : 'No employees found')
                      }
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={employee.image?.url || '/default-avatar.png'}
                          alt={employee.name[locale as 'en' | 'ar']}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-main">
                          {employee.name[locale as 'en' | 'ar']}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted">
                          {employee.position[locale as 'en' | 'ar']}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted">
                          {getCompanyName(employee.company_id, employee.company)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(employee.id)}
                          className={`text-indigo-600 hover:text-indigo-900 ${locale === 'ar' ? 'ml-4' : 'mr-4'}`}
                        >
                          {locale === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee.id, employee.name[locale as 'en' | 'ar'])}
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
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 text-lg mb-4">
              {employees.length === 0 
                ? (locale === 'ar' ? 'لم يتم العثور على موظفين' : 'No employees found')
                : (locale === 'ar' ? 'لا توجد موظفين تطابق بحثك' : 'No employees match your search')
              }
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {(searchTerm || selectedCompany) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 w-full sm:w-auto"
                >
                  {locale === 'ar' ? 'مسح البحث' : 'Clear Search'}
                </button>
              )}
              <button
                onClick={() => router.push(`/${locale}/admin/employees/new`)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 w-full sm:w-auto"
              >
                {locale === 'ar' ? 'إنشاء موظف جديد' : 'Create New Employee'}
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
            ? `هل أنت متأكد من أنك تريد حذف الموظف "${deleteConfirm.employeeName}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the employee "${deleteConfirm.employeeName}"? This action cannot be undone.`
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
