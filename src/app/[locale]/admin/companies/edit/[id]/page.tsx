'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../../components/admin/layout/AdminLayout';
import CompanyForm from '../../../../../../../components/admin/forms/CompanyForm';
import { useTranslations } from '../../../../../../../src/contexts/TranslationContext';
import { companiesService, type CompanyFormData } from '../../../../../../services/entities/companies.service';
import { type Link, type LinkFormData } from '../../../../../../services/entities/links.service';
import LoadingSpinner from '../../../../../../../components/ui/admin/LoadingSpinner';
import Toast from '../../../../../../../components/ui/admin/Toast';

export default function EditCompany({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const companyId = unwrappedParams.id;
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const router = useRouter();
  
  // Sidebar on left for English, right for Arabic
  const sidebarPosition = locale === 'ar' ? 'right' : 'left';

  const [initialData, setInitialData] = useState<Partial<CompanyFormData> | null>(null);
  const [initialLinks, setInitialLinks] = useState<Link[]>([]);
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
    const fetchCompany = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const company = await companiesService.getCompanyBySlug(companyId);
        
        if (company) {
          // Transform company data to form format
          const formData = {
            name: company.name,
            description: company.description,
            link: company.link,
            image: company.image,
            image_id: company.image?.id || null // Extract image ID from the image object
          };
          
          setInitialData(formData);
          
          // Load company links
          const { linksService } = await import('../../../../../../services/entities/links.service');
          const links = await linksService.getLinksByCompany(company.id);
          setInitialLinks(links);
          
        } else {
          setError((locale as 'en' | 'ar') === 'ar' ? 'الشركة غير موجودة' : 'Company not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, locale]);

  const handleSubmit = async (formData: CompanyFormData, links?: LinkFormData[]) => {
    try {
      // Get the current company data to compare names
      const currentCompany = await companiesService.getCompanyBySlug(companyId);
      
      // Update company via API using the company's slug (not the ID)
      if (currentCompany && currentCompany.slug) {
        await companiesService.updateCompany(currentCompany.slug, formData);
      } else {
        throw new Error('Company not found or slug is missing');
      }
      
      // Check if company name changed and there's an image to update
      if (currentCompany && formData.image_id && 
          (currentCompany.name.en !== formData.name.en || currentCompany.name.ar !== formData.name.ar)) {
        
        try {
          // Create new alt text with updated company name
          const altTextBase = formData.name.en || 'Company Logo';
          const altTextAr = formData.name.en ? `شعار ${formData.name.en}` : 'شعار الشركة';
          
          // Update the image alt text via API
          const imageUpdateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${formData.image_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              alt_en: altTextBase,
              alt_ar: altTextAr,
            }),
          });
          
          // Image alt text update is non-critical, so we don't throw errors
        } catch (imageError) {
          // Image alt text update failed (non-critical) - don't throw error
        }
      }
      
      // Handle links - Full CRUD management
      if (links !== undefined) {
        const { linksService } = await import('../../../../../../services/entities/links.service');
        const company = await companiesService.getCompanyBySlug(companyId);
        
        if (company) {
          // Get current links from database
          const currentLinks = await linksService.getLinksByCompany(company.id);
          
          // Create maps for easy comparison
          const currentLinksMap = new Map(currentLinks.map(link => [link.id, link]));
          
          // Track which links have been processed
          const processedLinkIds = new Set<number>();
          
          // Step 1: Update existing links and create new ones
          for (const [formIndex, formLink] of links.entries()) {
            // Try to find a matching existing link by title and URL
            let matchingLink = null;
            for (const [currentId, currentLink] of currentLinksMap.entries()) {
              if (!processedLinkIds.has(currentId) &&
                  currentLink.title === formLink.title && 
                  currentLink.url === formLink.url) {
                matchingLink = currentLink; // currentLink already has the correct id
                processedLinkIds.add(currentId);
                break;
              }
            }
            
            if (matchingLink) {
              // Link exists and matches - no action needed
            } else {
              // Check if this is an update to an existing link (same ID)
              const existingLink = currentLinksMap.get(formLink.id as number);
              if (existingLink) {
                // Update existing link - exclude id from the spread to avoid conflicts
                const { id: _linkId, ...linkData } = formLink;
                await linksService.updateLink(existingLink.id, {
                  ...linkData,
                  company: company.id
                });
                processedLinkIds.add(existingLink.id);
              } else {
                // Create new link - exclude id if it exists
                const { id: _linkId, ...linkData } = formLink;
                await linksService.createLink({
                  ...linkData,
                  company: company.id
                });
              }
            }
          }
          
          // Step 2: Delete links that were removed
          for (const [currentId, currentLink] of currentLinksMap.entries()) {
            if (!processedLinkIds.has(currentId)) {
              await linksService.deleteLink(currentId);
            }
          }
        }
      }
      
      // Show success message
      const successMessage = (locale as 'en' | 'ar') === 'ar' ? 'تم تحديث الشركة بنجاح!' : 'Company updated successfully!';
      setSuccess(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // Redirect to companies list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/companies`);
      }, 2000);
    } catch (error) {
      // Show error message
      const errorMessage = (locale as 'en' | 'ar') === 'ar' 
        ? `فشل في تحديث الشركة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` 
        : `Failed to update company: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/companies`);
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
                {(locale as 'en' | 'ar') === 'ar' ? 'جاري تحميل الشركة...' : 'Loading company...'}
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
        title={(locale as 'en' | 'ar') === 'ar' ? 'لم يتم العثور على الشركة' : 'Company Not Found'} 
        sidebarPosition={sidebarPosition}
      >
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-4">
              {(locale as 'en' | 'ar') === 'ar' ? 'لم يتم العثور على الشركة المطلوبة' : 'The requested company was not found'}
            </div>
            <button
              onClick={() => router.push(`/${locale}/admin/companies`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {(locale as 'en' | 'ar') === 'ar' ? 'العودة إلى الشركات' : 'Back to Companies'}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={(locale as 'en' | 'ar') === 'ar' ? 'تعديل الشركة' : 'Edit Company'} 
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
            {(locale as 'en' | 'ar') === 'ar' ? 'تعديل الشركة' : 'Edit Company'}
          </h1>
          <p className="text-gray-600">
            {(locale as 'en' | 'ar') === 'ar' ? 'تحديث معلومات الشركة' : 'Update company information'}
          </p>
        </div>

        <CompanyForm
          initialData={initialData}
          initialLinks={initialLinks}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </div>
    </AdminLayout>
  );
}
