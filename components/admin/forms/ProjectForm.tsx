'use client';

import React, { useState, useEffect } from 'react';
import EditorComponent from './blog/EditorComponent';
import ImageUpload from '../shared/ImageUpload';
import { useTranslations } from '../../../src/contexts/TranslationContext';
import type { OutputData } from '@editorjs/editorjs';

interface ProjectFormData {
  title_en: string;
  title_ar: string;
  content: {
    en: {
      time: number;
      blocks: Array<{
        id?: string;
        type: string;
        data: any;
      }>;
      version: string;
    };
    ar: {
      time: number;
      blocks: Array<{
        id?: string;
        type: string;
        data: any;
      }>;
      version: string;
    };
  };
  image_id: number | null;
  image_url: string;
  category_id: number | null;
  location_en: string;
  location_ar: string;
  client: string;
  completed_at: string; // ISO format
  seo: {
    meta_description: string;
    social_title: string;
    social_description: string;
  };
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
  const { locale } = useTranslations() as { locale: 'en' | 'ar' };
  const isRTL = locale === 'ar';

  const [formData, setFormData] = useState<ProjectFormData>({
    title_en: '',
    title_ar: '',
    content: {
      en: {
        time: Date.now(),
        blocks: [],
        version: '2.29.0'
      },
      ar: {
        time: Date.now(),
        blocks: [],
        version: '2.29.0'
      }
    },
    image_id: null,
    image_url: '',
    category_id: null,
    location_en: '',
    location_ar: '',
    client: '',
    completed_at: new Date().toISOString(),
    seo: {
      meta_description: '',
      social_title: '',
      social_description: ''
    },
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [categories, setCategories] = useState<Array<{id: number; name_en: string; name_ar: string}>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch project categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
        const response = await fetch(`${baseUrl}/categories/?type=project`);
        
        if (response.ok) {
          const data = await response.json();
          setCategories(data.results || data || []);
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSeoInputChange = (field: keyof ProjectFormData['seo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const handleContentChange = (lang: 'en' | 'ar', data: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: data
      }
    }));
  };

  const handleImageUpload = (imageData: { url: string; id: number } | string) => {
    if (typeof imageData === 'string') {
      // Handle URL string directly
      setFormData(prev => ({ ...prev, image_url: imageData, image_id: null }));
    } else {
      // Handle image object with url and id
      setFormData(prev => ({ ...prev, image_url: imageData.url, image_id: imageData.id }));
    }
  };

  // Helper function to generate keywords from title and content
  const generateKeywords = (title: string, contentText: string): string => {
    // Extract keywords from title and content
    const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
    const contentWords = contentText.toLowerCase().split(' ').filter(word => word.length > 3);
    
    // Combine and remove duplicates
    const allWords = [...new Set([...titleWords, ...contentWords])];
    
    // Take first 8 relevant words and join with commas
    return allWords.slice(0, 8).join(', ');
  };

  // Helper function to extract text from content blocks
  const extractTextFromContent = (content: any): string => {
    if (!content || !content.blocks) return '';
    return content.blocks
      .filter((block: any) => block.type === 'paragraph' || block.type === 'header')
      .map((block: any) => block.data?.text || '')
      .join(' ')
      .substring(0, 200); // Limit to first 200 characters
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!formData.title_en.trim()) {
      newErrors.title_en = (locale as 'en' | 'ar') === 'ar' ? 'العنوان بالإنجليزية مطلوب' : 'English title is required';
    }

    if (!formData.title_ar.trim()) {
      newErrors.title_ar = (locale as 'en' | 'ar') === 'ar' ? 'العنوان بالعربية مطلوب' : 'Arabic title is required';
    }

    if (!formData.client.trim()) {
      newErrors.client = (locale as 'en' | 'ar') === 'ar' ? 'اسم العميل مطلوب' : 'Client name is required';
    }

    if (!formData.location_en.trim()) {
      newErrors.location_en = (locale as 'en' | 'ar') === 'ar' ? 'الموقع بالإنجليزية مطلوب' : 'English location is required';
    }

    if (!formData.location_ar.trim()) {
      newErrors.location_ar = (locale as 'en' | 'ar') === 'ar' ? 'الموقع بالعربية مطلوب' : 'Arabic location is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = (locale as 'en' | 'ar') === 'ar' ? 'الفئة مطلوبة' : 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Transform SEO data for backend and add auto-generated keywords
      const submitData = {
        ...formData,
        seo: {
          ...formData.seo,
          // Copy social fields to og fields for proper SEO metadata
          og_title: formData.seo.social_title,
          og_description: formData.seo.social_description,
          keywords: generateKeywords(
            locale === 'ar' ? formData.title_ar : formData.title_en,
            extractTextFromContent(locale === 'ar' ? formData.content.ar : formData.content.en)
          )
        }
      };

      onSubmit(submitData);
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
              {locale === 'ar' ? 'العميل' : 'Client'}
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={locale === 'ar' ? 'اسم العميل' : 'Client name'}
            />
            {errors.client && (
              <p className="mt-1 text-sm text-red-600">{errors.client}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الفئة' : 'Category'}
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => handleInputChange('category_id', e.target.value ? Number(e.target.value) : null)}
              disabled={loadingCategories}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isRTL ? 'text-right' : 'text-left'} ${loadingCategories ? 'bg-gray-100' : ''}`}
            >
              <option value="">
                {loadingCategories 
                  ? (locale === 'ar' ? 'جاري التحميل...' : 'Loading...')
                  : (locale === 'ar' ? 'اختر فئة' : 'Select category')
                }
              </option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {locale === 'ar' ? category.name_ar : category.name_en}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'تاريخ الإنجاز' : 'Completion Date'}
            </label>
            <input
              type="date"
              value={formData.completed_at ? new Date(formData.completed_at).toISOString().split('T')[0] : ''}
              onChange={(e) => handleInputChange('completed_at', new Date(e.target.value).toISOString())}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>
        </div>
      </div>

      {/* Title Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* English Title */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-primary rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'العنوان بالإنجليزية' : 'English Title'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'العنوان (بالإنجليزية)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => handleInputChange('title_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل عنوان المشروع بالإنجليزية' : 'Enter project title in English'}
              />
              {errors.title_en && (
                <p className="mt-1 text-sm text-red-600">{errors.title_en}</p>
              )}
            </div>
          </div>
        </div>

        {/* Arabic Title */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-primary rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'العنوان (بالعربية)' : 'Title (Arabic)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'العنوان (بالعربية)' : 'Title (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => handleInputChange('title_ar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل عنوان المشروع بالعربية' : 'Project title in Arabic'}
                dir="rtl"
              />
              {errors.title_ar && (
                <p className="mt-1 text-sm text-red-600">{errors.title_ar}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* English Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-primary rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'الموقع بالإنجليزية' : 'English Location'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الموقع (بالإنجليزية)' : 'Location (English)'}
              </label>
              <input
                type="text"
                value={formData.location_en}
                onChange={(e) => handleInputChange('location_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل الموقع بالإنجليزية' : 'Enter location in English'}
              />
              {errors.location_en && (
                <p className="mt-1 text-sm text-red-600">{errors.location_en}</p>
              )}
            </div>
          </div>
        </div>

        {/* Arabic Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-primary rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'الموقع (بالعربية)' : 'Location (Arabic)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الموقع (بالعربية)' : 'Location (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.location_ar}
                onChange={(e) => handleInputChange('location_ar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={locale === 'ar' ? 'أدخل الموقع بالعربية' : 'Location in Arabic'}
                dir="rtl"
              />
              {errors.location_ar && (
                <p className="mt-1 text-sm text-red-600">{errors.location_ar}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-purple-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'صورة المشروع' : 'Project Image'}
        </h2>
        
        <ImageUpload
          value={formData.image_url || ''}
          onChange={(imageData) => handleImageUpload(imageData)}
          placeholder={locale === 'ar' ? 'أدخل رابط صورة المشروع أو قم برفعها' : 'Enter project image URL or upload'}
          imageType="project"
          companyName={formData.title_en}
          companyNameAr={formData.title_ar}
          imageId={formData.image_id || undefined}
        />
        <p className="mt-1 text-xs text-gray-500">
          {locale === 'ar' ? 'PNG, JPG, GIF حتى 5 ميجابايت' : 'PNG, JPG, GIF up to 5MB'}
        </p>
        <p className="mt-1 text-xs text-blue-600">
          {locale === 'ar' ? 'سيتم إنشاء نص بديل وصفي تلقائياً للصورة لتحسين إمكانية الوصول' : 'Descriptive alt text will be automatically generated for accessibility'}
        </p>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* English Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-blue-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'المحتوى بالإنجليزية' : 'English Content'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'المحتوى (بالإنجليزية)' : 'Content (English)'}
              </label>
              <EditorComponent
                data={formData.content.en}
                onChange={(data: OutputData) => handleContentChange('en', data)}
                placeholder={locale === 'ar' ? 'ابدأ كتابة محتوى المشروع بالإنجليزية أو اكتب \'/\' للأوامر...' : 'Start writing project content in English or type \'/\' for commands...'}
              />
            </div>
          </div>
        </div>

        {/* Arabic Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-5 bg-green-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'المحتوى (بالعربية)' : 'Content (Arabic)'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'المحتوى (بالعربية)' : 'Content (Arabic)'}
              </label>
              <EditorComponent
                data={formData.content.ar}
                onChange={(data: OutputData) => handleContentChange('ar', data)}
                placeholder={locale === 'ar' ? 'ابدأ كتابة محتوى المشروع بالعربية أو اكتب \'/\' للأوامر...' : 'ابدأ كتابة محتوى المشروع بالعربية أو اكتب \'/\' للأوامر...'}
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className={`w-2 h-6 bg-indigo-500 rounded ${isRTL ? 'ml-3' : 'mr-3'}`}></span>
          {locale === 'ar' ? 'تحسين محركات البحث (SEO)' : 'Search Engine Optimization (SEO)'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'وصف محرك البحث' : 'Search Description'}
              <span className="text-xs text-gray-500 ml-2">({locale === 'ar' ? 'يظهر في نتائج جوجل' : 'Shows in Google results'})</span>
            </label>
            <textarea
              value={formData.seo.meta_description}
              onChange={(e) => handleSeoInputChange('meta_description', e.target.value)}
              placeholder={locale === 'ar' ? 'وصف مقنع يجعل المستخدمين ينقرون على رابطك' : 'Compelling description that makes users click your link'}
              rows={3}
              maxLength={160}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <div className="mt-1 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {locale === 'ar' ? '160 حرف كحد أقصى' : '160 characters max'}
              </p>
              <p className="text-xs text-primary">
                {formData.seo.meta_description.length}/160
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'عنوان وسائل التواصل الاجتماعي' : 'Social Media Title'}
              <span className="text-xs text-gray-500 ml-2">({locale === 'ar' ? 'عند المشاركة على فيسبوك، لينكدإن' : 'When sharing on Facebook, LinkedIn'})</span>
            </label>
            <input
              type="text"
              value={formData.seo.social_title}
              onChange={(e) => handleSeoInputChange('social_title', e.target.value)}
              placeholder={locale === 'ar' ? 'عنوان جذاب للوسائط الاجتماعية' : 'Engaging title for social media'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              {locale === 'ar' ? 'يتم إنشاؤه تلقائياً من العنوان' : 'Auto-generated from title'} • {locale === 'ar' ? 'يمكنك تخصيصه' : 'You can customize it'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'وصف وسائل التواصل الاجتماعي' : 'Social Media Description'}
              <span className="text-xs text-gray-500 ml-2">({locale === 'ar' ? 'عند المشاركة على فيسبوك، لينكدإن' : 'When sharing on Facebook, LinkedIn'})</span>
            </label>
            <textarea
              value={formData.seo.social_description}
              onChange={(e) => handleSeoInputChange('social_description', e.target.value)}
              placeholder={locale === 'ar' ? 'وصف جذاب للوسائط الاجتماعية' : 'Engaging description for social media'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              {locale === 'ar' ? 'يتم إنشاؤه تلقائياً من المحتوى' : 'Auto-generated from content'} • {locale === 'ar' ? 'يمكنك تخصيصه' : 'You can customize it'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className={`flex justify-end space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
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
          {isEdit ? (locale === 'ar' ? 'تحديث المشروع' : 'Update Project') : (locale === 'ar' ? 'إنشاء مشروع' : 'Create Project')}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
