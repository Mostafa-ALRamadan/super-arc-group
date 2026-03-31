'use client';

import React, { useState } from 'react';
import { useTranslations } from '../../../src/contexts/TranslationContext';
import { type LeadershipFormData } from '../../../src/services/entities/leadership.service';
import ImageUpload from '../shared/ImageUpload';

interface LeadershipFormProps {
  initialData?: Partial<LeadershipFormData>;
  onSubmit: (data: LeadershipFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const LeadershipForm: React.FC<LeadershipFormProps> = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const isRTL = locale === 'ar';

  const [formData, setFormData] = useState<LeadershipFormData>({
    name: {
      en: '',
      ar: ''
    },
    position: {
      en: '',
      ar: ''
    },
    description: {
      en: '',
      ar: ''
    },
    image_id: null,
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadershipFormData, string>>>({});
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleNestedInputChange = (parent: string, child: string, value: string) => {
    setFormData((prev: LeadershipFormData) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof LeadershipFormData] as Record<string, any>),
        [child]: value
      }
    }));
    
    // Clear error for this field when user starts typing
    if (errors[parent as keyof LeadershipFormData]) {
      setErrors(prev => ({ ...prev, [parent]: undefined }));
    }
  };

  const handleImageChange = (imageData: { url: string; id: number } | string) => {
    if (typeof imageData === 'object' && imageData.url && imageData.id) {
      setFormData(prev => ({ ...prev, image_id: imageData.id }));
      setImageUrl(imageData.url);
    } else {
      setFormData(prev => ({ ...prev, image_id: null }));
      setImageUrl('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadershipFormData, string>> = {};

    if (!formData.name.en.trim()) {
      newErrors.name = locale === 'ar' ? 'الاسم بالإنجليزية مطلوب' : 'English name is required';
    } else if (!formData.name.ar.trim()) {
      newErrors.name = locale === 'ar' ? 'الاسم بالعربية مطلوب' : 'Arabic name is required';
    }

    if (!formData.position.en.trim()) {
      newErrors.position = locale === 'ar' ? 'المنصب بالإنجليزية مطلوب' : 'English position is required';
    } else if (!formData.position.ar.trim()) {
      newErrors.position = locale === 'ar' ? 'المنصب بالعربية مطلوب' : 'Arabic position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name Sections */}
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
                placeholder={locale === 'ar' ? 'Enter name in English' : 'Enter name in English'}
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
                {locale === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.name.ar}
                onChange={(e) => handleNestedInputChange('name', 'ar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل الاسم بالعربية' : 'Enter name in Arabic'}
                dir="rtl"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Section - Moved after names like EmployeeForm */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-purple-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'الصورة الشخصية' : 'Photo'}
        </h2>
        
        <ImageUpload
          value={imageUrl}
          onChange={handleImageChange}
          placeholder="https://example.com/photo.jpg"
          companyName={formData.name.en}
          companyNameAr={formData.name.ar}
          imageType="photo"
          imageId={formData.image_id || undefined}
        />
        <p className={`mt-2 text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {locale === 'ar' 
            ? 'يوصى باستخدام صورة بحجم 200x200 بكسل' 
            : 'Recommended size: 200x200px'
          }
        </p>
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
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
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
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* English Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-blue-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'الوصف (بالإنجليزية)' : 'Description (English)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الوصف (بالإنجليزية)' : 'Description (English)'}
              </label>
              <textarea
                value={formData.description.en}
                onChange={(e) => handleNestedInputChange('description', 'en', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'Enter description in English' : 'Enter description in English'}
              />
            </div>
          </div>
        </div>

        {/* Arabic Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-green-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'الوصف (بالعربية)' : 'Description (Arabic)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الوصف (بالعربية)' : 'Description (Arabic)'}
              </label>
              <textarea
                value={formData.description.ar}
                onChange={(e) => handleNestedInputChange('description', 'ar', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل الوصف بالعربية' : 'Enter description in Arabic'}
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
          {isEdit 
            ? (locale === 'ar' ? 'تحديث العضو القيادي' : 'Update Leadership member')
            : (locale === 'ar' ? 'إنشاء عضو قيادي' : 'Create Leadership member')
          }
        </button>
      </div>
    </form>
  );
};

export default LeadershipForm;
