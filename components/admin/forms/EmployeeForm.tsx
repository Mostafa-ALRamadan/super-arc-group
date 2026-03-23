'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '../../../src/contexts/TranslationContext';
import { companiesService, Company } from '../../../src/services/entities/companies.service';
import { type EmployeeFormData } from '../../../src/services/entities/employee.service';
import ImageUpload from '../shared/ImageUpload';

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const isRTL = locale === 'ar';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: {
      en: '',
      ar: ''
    },
    position: {
      en: '',
      ar: ''
    },
    image_id: null,
    company_id: null,
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesData = await companiesService.getCompanies();
        setCompanies(companiesData);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Update image alt text when employee names change and image exists
  useEffect(() => {
    if (formData.image && formData.image.url && (formData.name.en || formData.name.ar)) {
      // Generate new alt text based on current names
      const newAltEn = formData.name.en ? `${formData.name.en} Employee Photo` : 'Employee Photo';
      const newAltAr = formData.name.ar ? `صورة الموظف ${formData.name.ar}` : 'صورة الموظف';
      
      // Update the image alt text in form data
      setFormData(prev => ({
        ...prev,
        image: prev.image ? {
          ...prev.image,
          alt_en: newAltEn,
          alt_ar: newAltAr
        } : {
          id: 0,
          url: '',
          alt_en: newAltEn,
          alt_ar: newAltAr
        }
      }));
    }
  }, [formData.name.en, formData.name.ar]); // Only depend on name changes

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNestedInputChange = (parent: keyof EmployeeFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleImageUpload = (imageData: { url: string; id: number } | string) => {
    // If it's a string (manual URL entry), ignore it for employees
    if (typeof imageData === 'string') return;
    
    setFormData(prev => ({
      ...prev,
      image: prev.image ? {
        ...prev.image,
        url: imageData.url
      } : {
        id: imageData.id,
        url: imageData.url,
        alt_en: '',
        alt_ar: ''
      },
      image_id: imageData.id
    }));
    
    // Clear image error if exists
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.name.en.trim()) {
      newErrors.name = (locale as 'en' | 'ar') === 'ar' ? 'اسم الموظف بالإنجليزية مطلوب' : 'English employee name is required';
    }

    if (!formData.name.ar.trim()) {
      newErrors.name = (locale as 'en' | 'ar') === 'ar' ? 'اسم الموظف بالعربية مطلوب' : 'Arabic employee name is required';
    }

    if (!formData.image?.url.trim()) {
      newErrors.image = (locale as 'en' | 'ar') === 'ar' ? 'الصورة مطلوبة' : 'Image is required';
    }

    if (!formData.position.en.trim()) {
      newErrors.position = (locale as 'en' | 'ar') === 'ar' ? 'المنصب بالإنجليزية مطلوب' : 'English position is required';
    }

    if (!formData.position.ar.trim()) {
      newErrors.position = (locale as 'en' | 'ar') === 'ar' ? 'المنصب بالعربية مطلوب' : 'Arabic position is required';
    }

    if (!formData.company_id) {
      newErrors.company_id = (locale as 'en' | 'ar') === 'ar' ? 'الشركة مطلوبة' : 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-blue-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الشركة' : 'Company'}
            </label>
            <select
              value={formData.company_id || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                setFormData(prev => ({ ...prev, company_id: value }));
                if (errors.company_id) {
                  setErrors(prev => ({ ...prev, company_id: undefined }));
                }
              }}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <option value="">{locale === 'ar' ? 'اختر شركة' : 'Select company'}</option>
              {loadingCompanies ? (
                <option disabled>{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</option>
              ) : (
                companies.map(company => (
                  <option key={company.id} value={company.id.toString()}>
                    {company.name[locale as 'en' | 'ar']}
                  </option>
                ))
              )}
            </select>
            {errors.company_id && (
              <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>
            )}
          </div>
        </div>
      </div>

      {/* Name Sections - Moved before image upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* English Name */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-blue-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
              </label>
              <input
                type="text"
                value={formData.name.en}
                onChange={(e) => handleNestedInputChange('name', 'en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'Enter employee name in English' : 'Enter employee name in English'}
              />
            </div>
          </div>
        </div>

        {/* Arabic Name */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-green-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.name.ar}
                onChange={(e) => handleNestedInputChange('name', 'ar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل اسم الموظف بالعربية' : 'Enter employee name in Arabic'}
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Photo Section - Moved after names */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-purple-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'الصورة الشخصية' : 'Photo'}
        </h2>
        
        <ImageUpload
          value={formData.image?.url || ''}
          onChange={handleImageUpload}
          placeholder="https://example.com/photo.jpg"
          companyName={formData.name.en} // English name for alt text
          companyNameAr={formData.name.ar} // Arabic name for alt text
          imageType="photo" // Specify this is a photo, not a logo
        />
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image}</p>
        )}
      </div>

      {/* Position Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* English Position */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-blue-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'المنصب (بالإنجليزية)' : 'Position (English)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'المنصب (بالإنجليزية)' : 'Position (English)'}
              </label>
              <input
                type="text"
                value={formData.position.en}
                onChange={(e) => handleNestedInputChange('position', 'en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'Enter position in English' : 'Enter position in English'}
              />
            </div>
          </div>
        </div>

        {/* Arabic Position */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-green-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'المنصب (بالعربية)' : 'Position (Arabic)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'المنصب (بالعربية)' : 'Position (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.position.ar}
                onChange={(e) => handleNestedInputChange('position', 'ar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل المنصب بالعربية' : 'Enter position in Arabic'}
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className={`flex justify-end space-x-4 ${locale === 'ar' ? 'space-x-reverse' : ''}`}>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {isEdit ? (locale === 'ar' ? 'تحديث الموظف' : 'Update Employee') : (locale === 'ar' ? 'إنشاء موظف' : 'Create Employee')}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
