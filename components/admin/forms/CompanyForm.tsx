'use client';

import React, { useState, useEffect } from 'react';
import { CompanyFormData } from '../../../src/services/entities/companies.service';
import { Link, LinkFormData } from '../../../src/services/entities/links.service';
import ImageUpload from '../shared/ImageUpload';
import { useTranslations } from '../../../src/contexts/TranslationContext';

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>;
  initialLinks?: Link[];
  onSubmit: (data: CompanyFormData, links?: LinkFormData[]) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, initialLinks = [], onSubmit, onCancel, isEdit = false }) => {
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const isRTL = locale === 'ar';

  const [formData, setFormData] = useState<CompanyFormData & { image_id: number | null }>({
    name: {
      en: '',
      ar: ''
    },
    slug: '',
    description: {
      en: '',
      ar: ''
    },
    link: '',
    image: {
      id: 0,
      url: '',
      alt_en: '',
      alt_ar: ''
    },
    image_id: null
  });

  const [links, setLinks] = useState<LinkFormData[]>([]);
  
  // Use refs to track previous values to prevent unnecessary updates
  const prevInitialDataRef = React.useRef(initialData);
  const prevInitialLinksRef = React.useRef(initialLinks);

  // Use useMemo to stabilize dependencies
  const stableInitialData = React.useMemo(() => initialData, [JSON.stringify(initialData)]);
  const stableInitialLinks = React.useMemo(() => initialLinks, [JSON.stringify(initialLinks)]);

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    image?: string;
    'image.alt'?: string;
  }>({});

  useEffect(() => {
    // Always update form data when initialData is provided
    if (stableInitialData) {
      setFormData((prev: CompanyFormData & { image_id: number | null }) => ({ 
        ...prev, 
        ...stableInitialData 
      }));
    }
    
    // Always update links when initialLinks are provided
    if (stableInitialLinks && stableInitialLinks.length > 0) {
      setLinks(stableInitialLinks.map(link => ({
        id: link.id, // Include the actual link ID
        company: 0, // Will be set when submitting
        title: link.title,
        url: link.url
      })));
    } else if (stableInitialLinks) {
      setLinks([]);
    }
  }, [stableInitialData, stableInitialLinks]); // Use stable dependencies

  // Update image alt text when company names change and image exists
  useEffect(() => {
    if (formData.image && formData.image.url && (formData.name.en || formData.name.ar)) {
      // Generate new alt text based on current names
      const newAltEn = formData.name.en ? `${formData.name.en} Company Logo` : 'Company Logo';
      const newAltAr = formData.name.ar ? `شعار شركة ${formData.name.ar}` : 'شعار الشركة';
      
      // Update the image alt text in form data
      setFormData(prev => ({
        ...prev,
        image: {
          id: prev.image?.id || 0,
          url: prev.image?.url || '',
          alt_en: newAltEn,
          alt_ar: newAltAr
        }
      }));
    }
  }, [formData.name.en, formData.name.ar]); // Only depend on name changes

  // Links management functions
  const addLink = () => {
    setLinks(prev => [...prev, {
      company: 0, // Will be set when submitting
      title: '',
      url: ''
    }]);
  };

  const updateLink = (index: number, field: keyof LinkFormData, value: string | number) => {
    setLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: keyof CompanyFormData | 'image_id', value: any) => {
    setFormData((prev: CompanyFormData & { image_id: number | null }) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent: keyof CompanyFormData, field: string, value: any) => {
    setFormData((prev: CompanyFormData & { image_id: number | null }) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      image?: string;
    } = {};

    if (!formData.name.en.trim()) {
      newErrors.name = (locale as 'en' | 'ar') === 'ar' ? 'اسم الشركة بالإنجليزية مطلوب' : 'English company name is required';
    }

    if (!formData.name.ar.trim()) {
      newErrors.name = (locale as 'en' | 'ar') === 'ar' ? 'اسم الشركة بالعربية مطلوب' : 'Arabic company name is required';
    }

    if (!formData.description.en.trim()) {
      newErrors.description = (locale as 'en' | 'ar') === 'ar' ? 'الوصف بالإنجليزية مطلوب' : 'English description is required';
    }

    if (!formData.description.ar.trim()) {
      newErrors.description = (locale as 'en' | 'ar') === 'ar' ? 'الوصف بالعربية مطلوب' : 'Arabic description is required';
    }

    if (!formData.image?.url.trim()) {
      newErrors.image = (locale as 'en' | 'ar') === 'ar' ? 'صورة الشركة مطلوبة' : 'Company image is required';
    }

    // Alt text validation removed - backend handles defaults

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    const isValid = validateForm();
    if (isValid) {
      onSubmit(formData, links);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name Sections - Put First */}
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
                {locale === 'ar' ? 'اسم الشركة (بالإنجليزية)' : 'Company Name (English)'}
              </label>
              <input
                type="text"
                value={formData.name.en}
                onChange={(e) => handleNestedInputChange('name', 'en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'Enter company name in English' : 'Enter company name in English'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
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
                {locale === 'ar' ? 'اسم الشركة (بالعربية)' : 'Company Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.name.ar}
                onChange={(e) => handleNestedInputChange('name', 'ar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل اسم الشركة بالعربية' : 'Enter company name in Arabic'}
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company Image - Put Second */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-blue-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'صورة الشركة' : 'Company Image'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <ImageUpload
              value={formData.image?.url || ''}
              companyName={formData.name.en} // Pass company name for alt text
              companyNameAr={formData.name.ar} // Pass Arabic company name for alt text
              imageType="logo" // Specify this is a logo, not a photo
              onChange={(imageData) => {
                // Handle both URL string and object with id
                if (typeof imageData === 'string') {
                  // Legacy case - just URL
                  handleNestedInputChange('image', 'url', imageData);
                } else {
                  // New case - object with url and id
                  handleNestedInputChange('image', 'url', imageData.url);
                  handleInputChange('image_id', imageData.id);
                }
              }}
              placeholder="https://example.com/company-image.jpg"
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-orange-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'الوصف' : 'Description'}
        </h2>
        
        {/* Description Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* English Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الوصف (بالإنجليزية)' : 'Description (English)'}
            </label>
            <textarea
              value={formData.description.en}
              onChange={(e) => handleNestedInputChange('description', 'en', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder={locale === 'ar' ? 'Enter company description in English' : 'Enter company description in English'}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Arabic Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الوصف (بالعربية)' : 'Description (Arabic)'}
            </label>
            <textarea
              value={formData.description.ar}
              onChange={(e) => handleNestedInputChange('description', 'ar', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder={locale === 'ar' ? 'أدخل وصف الشركة بالعربية' : 'Enter company description in Arabic'}
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Links Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-green-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'روابط الشركة' : 'Company Links'}
        </h2>
        
        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateLink(index, 'title', e.target.value)}
                  placeholder={locale === 'ar' ? 'عنوان الرابط' : 'Link Title'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  placeholder={locale === 'ar' ? 'https://example.com' : 'https://example.com'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                {locale === 'ar' ? 'حذف' : 'Remove'}
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addLink}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 rounded-md transition-colors"
          >
            {locale === 'ar' ? '+ إضافة رابط جديد' : '+ Add New Link'}
          </button>
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
          {isEdit ? (locale === 'ar' ? 'تحديث الشركة' : 'Update Company') : (locale === 'ar' ? 'إنشاء شركة' : 'Create Company')}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;
