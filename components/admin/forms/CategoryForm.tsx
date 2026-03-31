'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '../../../src/contexts/TranslationContext';
import { type CategoryFormData } from '../../../src/services/content/category.service';

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const isRTL = locale === 'ar';

  const [formData, setFormData] = useState<CategoryFormData>({
    name: {
      en: '',
      ar: ''
    },
    type: 'project',
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNestedInputChange = (parent: keyof CategoryFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};

    if (!formData.name.en.trim()) {
      newErrors.name = (locale as 'en' | 'ar') === 'ar' ? 'اسم الفئة بالإنجليزية مطلوب' : 'English category name is required';
    }

    if (!formData.name.ar.trim()) {
      newErrors.name = (locale as 'en' | 'ar') === 'ar' ? 'اسم الفئة بالعربية مطلوب' : 'Arabic category name is required';
    }

    if (!formData.type) {
      newErrors.type = (locale as 'en' | 'ar') === 'ar' ? 'نوع الفئة مطلوب' : 'Category type is required';
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
      {/* English Name Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-blue-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
        </h2>
        
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
              placeholder={locale === 'ar' ? 'Enter category name in English' : 'Enter category name in English'}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Arabic Name Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-green-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
        </h2>
        
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
              placeholder={locale === 'ar' ? 'أدخل اسم الفئة بالعربية' : 'Enter category name in Arabic'}
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Type Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-purple-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'نوع الفئة' : 'Category Type'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'نوع الفئة' : 'Category Type'}
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as 'project' | 'blog' | 'client')}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <option value="project">{locale === 'ar' ? 'مشروع' : 'Project'}</option>
              <option value="blog">{locale === 'ar' ? 'مدونة' : 'Blog'}</option>
              <option value="client">{locale === 'ar' ? 'عميل' : 'Client'}</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {locale === 'ar' 
                ? 'حدد ما إذا كانت هذه الفئة للمشاريع أو للمدونة أو للعملاء' 
                : 'Specify whether this category is for projects, blog posts, or clients'
              }
            </p>
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
          {isEdit ? (locale === 'ar' ? 'تحديث الفئة' : 'Update Category') : (locale === 'ar' ? 'إنشاء فئة' : 'Create Category')}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
