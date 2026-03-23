'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from '../../../../src/contexts/TranslationContext';
import EditorComponent from './EditorComponent';
import type { OutputData } from '@editorjs/editorjs';
import BlogPreview from './BlogPreview';
import ImageUpload from '../../shared/ImageUpload';
import AuthorManager from './AuthorManager';
import AuthorSelector from './AuthorSelector';

interface BlogFormData {
  title: {
    en: string;
    ar: string;
  };
  excerpt: {
    en: string;
    ar: string;
  };
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
  cover_image_id: number | null;
  cover_image_url: string;
  category_id: number | null;
  author_id: number | null;
  reading_time: number;
  tags: {
    en: string[];
    ar: string[];
  };
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  seo: {
    meta_description: string;
    social_title: string;
    social_description: string;
  };
}

// Make PartialBlogFormData have the same nullable types as BlogFormData
type PartialBlogFormData = {
  title?: {
    en?: string;
    ar?: string;
  };
  excerpt?: {
    en?: string;
    ar?: string;
  };
  content?: {
    en?: {
      time: number;
      blocks: Array<{
        id?: string;
        type: string;
        data: any;
      }>;
      version: string;
    };
    ar?: {
      time: number;
      blocks: Array<{
        id?: string;
        type: string;
        data: any;
      }>;
      version: string;
    };
  };
  cover_image_id?: number | null;
  cover_image_url?: string;
  category_id?: number | null;
  author_id?: number | null;
  reading_time?: number;
  tags?: {
    en?: string[];
    ar?: string[];
  };
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  seo?: {
    meta_description?: string;
    social_title?: string;
    social_description?: string;
    keywords?: string; // Keep for backward compatibility
    og_title?: string; // Keep for backward compatibility
    og_description?: string; // Keep for backward compatibility
  };
};

interface BlogFormProps {
  initialData?: PartialBlogFormData;
  onSubmit: (data: BlogFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}
const BlogForm: React.FC<BlogFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEdit = false,
  isLoading = false 
}) => {
  const { t } = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [showPreview, setShowPreview] = useState(false);
  const [showAuthorManager, setShowAuthorManager] = useState(false);
  const [authorToEdit, setAuthorToEdit] = useState<any>(null);
  const [authorRefreshTrigger, setAuthorRefreshTrigger] = useState(0);
  const [autoSelectNewestAuthor, setAutoSelectNewestAuthor] = useState(false);
  
  // State for author and category data
  const [currentAuthorData, setCurrentAuthorData] = useState<any>(null);
  const [currentCategoryData, setCurrentCategoryData] = useState<any>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: { en: string; ar: string } }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        // Fetch blog categories using baseUrl approach
        const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
        const categoriesResponse = await fetch(`${baseUrl}/categories/?type=blog`, {
          headers
        });
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const categoriesArray = categoriesData.results || categoriesData.data || categoriesData;
          const mappedCategories = categoriesArray.map((cat: any) => ({
            id: cat.id,
            name: {
              en: cat.name_en,
              ar: cat.name_ar
            }
          }));
          setCategories(mappedCategories);
          
          // Set default category if initialData doesn't have one
          if (mappedCategories.length > 0 && (!initialData || !initialData.category_id)) {
            setFormData(prev => ({ ...prev, category_id: mappedCategories[0].id }));
          }
        } else {
          console.error('Failed to fetch categories:', categoriesResponse.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState<BlogFormData>({
    title: {
      en: '',
      ar: ''
    },
    excerpt: {
      en: '',
      ar: ''
    },
    content: {
      en: {
        time: Date.now(),
        blocks: [],
        version: '2.28.2'
      },
      ar: {
        time: Date.now(),
        blocks: [],
        version: '2.28.2'
      }
    },
    cover_image_id: null,
    cover_image_url: '',
    category_id: null,
    author_id: null,
    reading_time: 5,
    tags: {
      en: [],
      ar: []
    },
    status: 'draft',
    is_featured: false,
    seo: {
      meta_description: '',
      social_title: '',
      social_description: '',
    }
  });

  // Apply timezone adjustment to initialData if editing

  useEffect(() => {
    if (initialData) {
      setFormData(prev => { 
        const newData = {
          ...prev,
          title: {
            en: initialData.title?.en || prev.title.en,
            ar: initialData.title?.ar || prev.title.ar
          },
          excerpt: {
            en: initialData.excerpt?.en || prev.excerpt.en,
            ar: initialData.excerpt?.ar || prev.excerpt.ar
          },
          content: {
            en: initialData.content?.en || prev.content.en,
            ar: initialData.content?.ar || prev.content.ar
          },
          cover_image_id: initialData.cover_image_id ?? prev.cover_image_id,
          cover_image_url: initialData.cover_image_url ?? prev.cover_image_url,
          category_id: initialData.category_id ?? prev.category_id,
          author_id: initialData.author_id ?? prev.author_id,
          reading_time: initialData.reading_time ?? prev.reading_time,
          tags: {
            en: initialData.tags?.en ?? prev.tags.en,
            ar: initialData.tags?.ar ?? prev.tags.ar
          },
          status: initialData.status ?? prev.status,
          is_featured: initialData.is_featured ?? prev.is_featured,
          seo: {
            meta_description: initialData.seo?.meta_description ?? prev.seo.meta_description,
            social_title: initialData.seo?.social_title ?? initialData.seo?.og_title ?? prev.seo.social_title,
            social_description: initialData.seo?.social_description ?? initialData.seo?.og_description ?? prev.seo.social_description,
            keywords: initialData.seo?.keywords,
            og_title: initialData.seo?.og_title,
            og_description: initialData.seo?.og_description
          }
        };
        return newData;
      });
    }
  }, [initialData]);

  // Auto-generate SEO fields from title and excerpt (only if fields are empty)
  useEffect(() => {
    const currentTitle = locale === 'ar' ? formData.title.ar : formData.title.en;
    const currentExcerpt = locale === 'ar' ? formData.excerpt.ar : formData.excerpt.en;
    
    // Only auto-generate if fields are empty (to respect user overrides)
    setFormData(prev => {
      const newSeo = { ...prev.seo };
      
      // Only auto-generate meta_description if empty
      if (!prev.seo.meta_description.trim()) {
        newSeo.meta_description = currentExcerpt.substring(0, 160);
      }
      
      // Only auto-generate social_title if empty
      if (!prev.seo.social_title.trim()) {
        newSeo.social_title = currentTitle;
      }
      
      // Only auto-generate social_description if empty
      if (!prev.seo.social_description.trim()) {
        newSeo.social_description = currentExcerpt;
      }
      
      return {
        ...prev,
        seo: newSeo
      };
    });
  }, [formData.title.en, formData.title.ar, formData.excerpt.en, formData.excerpt.ar, locale]);

  const [errors, setErrors] = useState<Partial<Record<keyof BlogFormData, string>>>({});

  // Auto-clear title error when titles have content
  useEffect(() => {
    if (errors.title && (formData.title.en.trim() || formData.title.ar.trim())) {
            setErrors(prev => {
        const { title, ...rest } = prev;
        return rest;
      });
    }
  }, [formData.title.en, formData.title.ar, errors.title]);

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing or selects a value
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    // Get current values from formData state
    const currentTitleEn = formData.title.en;
    const currentTitleAr = formData.title.ar;
    
    const newErrors: Partial<Record<keyof BlogFormData, string>> = {};
    
    // Only set error if BOTH titles are empty
    const enEmpty = !currentTitleEn.trim();
    const arEmpty = !currentTitleAr.trim();
    
    if (enEmpty && arEmpty) {
      newErrors.title = 'Both English and Arabic titles are required';
    }
    
    // Validate category is selected
    if (!formData.category_id || formData.category_id === 0) {
      newErrors.category_id = 'Please select a category';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      // Transform SEO data for backend and add auto-generated keywords
      const submitData = {
        ...formData,
        seo: {
          ...formData.seo,
          keywords: generateKeywords(formData.title[locale as 'en' | 'ar'], formData.excerpt[locale as 'en' | 'ar']),
          og_title: formData.seo.social_title,
          og_description: formData.seo.social_description
        }
      };
      onSubmit(submitData as BlogFormData);
    }
  };

  // Helper function to generate keywords from title and excerpt
  const generateKeywords = (title: string, excerpt: string): string => {
    // Extract keywords from title and excerpt
    const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
    const excerptWords = excerpt.toLowerCase().split(' ').filter(word => word.length > 3);
    
    // Combine and remove duplicates
    const allWords = [...new Set([...titleWords, ...excerptWords])];
    
    // Take first 8 relevant words and join with commas
    return allWords.slice(0, 8).join(', ');
  };

  const handleNestedInputChange = (parent: keyof BlogFormData, field: string, value: string | any) => {
    // IMMEDIATELY clear title error when typing in title fields
    if (parent === 'title') {
      setErrors(prev => {
        if (prev.title) {
          const { title, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
    
    setFormData(prev => {
      const newState = {
        ...prev,
        [parent]: {
          ...(prev[parent] as any),
          [field]: value
        }
      };
      return newState;
    });
  };

  const handleCoverImageChange = (imageData: { url: string; id: number } | string) => {
    if (typeof imageData === 'string') {
      // Handle URL string directly
      setFormData(prev => ({ ...prev, cover_image_url: imageData, cover_image_id: null }));
    } else {
      // Handle image object with url and id
      setFormData(prev => ({ ...prev, cover_image_url: imageData.url, cover_image_id: imageData.id }));
    }
  };

  const handleSeoInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const handleTagsChange = (language: 'en' | 'ar', newTags: string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: {
        ...prev.tags,
        [language]: newTags
      }
    }));
  };

  const handleAddTag = (language: 'en' | 'ar', tag: string) => {
    if (tag.trim() && !formData.tags[language].includes(tag.trim())) {
      handleTagsChange(language, [...formData.tags[language], tag.trim()]);
    }
  };

  const handleRemoveTag = (language: 'en' | 'ar', tagToRemove: string) => {
    handleTagsChange(language, formData.tags[language].filter(tag => tag !== tagToRemove));
  };

  // Function to handle adding a new author
  const handleAddNewAuthor = () => {
    // Clear any existing author being edited
    setAuthorToEdit(null);
    // Open the modal for creating a new author
    setShowAuthorManager(true);
  };

  // Function to handle when a new author is created
  const handleAuthorCreated = () => {
    // Handle new author creation with auto-select
    handleAuthorUpdated(true);
  };

  // Function to handle editing an existing author
  const handleEditAuthor = (author: any) => {
        setAuthorToEdit(author);
    setShowAuthorManager(true);
  };

  // Function to handle when an author is updated (either created or edited)
  const handleAuthorUpdated = (isNewAuthor = false) => {
    // Clear the author being edited
    setAuthorToEdit(null);
    // Close the modal
    setShowAuthorManager(false);
    
    if (isNewAuthor) {
      // If it's a new author, enable auto-select and trigger refresh
            setAutoSelectNewestAuthor(true);
    }
    
    // Refresh the author list
    setAuthorRefreshTrigger(prev => prev + 1);
  };

  // Reset auto-select flag after a short delay to prevent re-triggering
  useEffect(() => {
    if (autoSelectNewestAuthor) {
      const timer = setTimeout(() => {
        setAutoSelectNewestAuthor(false);
      }, 1000); // Reset after 1 second
      return () => clearTimeout(timer);
    }
  }, [autoSelectNewestAuthor]);

  // Fetch author data when author_id changes
  useEffect(() => {
    const fetchAuthorData = async () => {
      if (formData.author_id) {
        try {
          const token = localStorage.getItem('access_token');
          const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
          const response = await fetch(`${baseUrl}/authors/${formData.author_id}/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const authorData = await response.json();
            setCurrentAuthorData(authorData);
          }
        } catch (error) {
          console.error('Error fetching author data:', error);
        }
      } else {
        setCurrentAuthorData(null);
      }
    };

    fetchAuthorData();
  }, [formData.author_id]);

  // Fetch category data when category_id changes
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (formData.category_id && categories.length > 0) {
        const category = categories.find(cat => cat.id === formData.category_id);
        if (category) {
          setCurrentCategoryData(category);
        }
      } else {
        setCurrentCategoryData(null);
      }
    };

    fetchCategoryData();
  }, [formData.category_id, categories]);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-6 bg-blue-500 rounded ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
          </h2>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الفئة' : 'Category'}
              </label>
              {loading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <div className="animate-pulse h-4 bg-gray-300 rounded"></div>
                </div>
              ) : (
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => handleInputChange('category_id', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.category_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{locale === 'ar' ? 'اختر فئة' : 'Select a category'}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name[locale as 'en' | 'ar']}
                    </option>
                  ))}
                </select>
              )}
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>

            <AuthorSelector
              selectedAuthorId={formData.author_id}
              onAuthorSelect={(authorId) => handleInputChange('author_id', authorId)}
              onAddNewAuthor={handleAddNewAuthor}
              onEditAuthor={handleEditAuthor}
              refreshTrigger={authorRefreshTrigger}
              autoSelectNewest={autoSelectNewestAuthor}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'وقت القراءة (دقائق)' : 'Reading Time (minutes)'}
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.reading_time}
                onChange={(e) => handleInputChange('reading_time', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>



        {/* Content Sections */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* English Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <span className={`w-2 h-5 bg-blue-500 rounded ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}></span>
              {locale === 'ar' ? 'المحتوى بالإنجليزية' : 'English Content'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'العنوان (بالإنجليزية)' : 'Title (English)'}
                </label>
                <input
                  type="text"
                  value={formData.title.en}
                  onChange={(e) => handleNestedInputChange('title', 'en', e.target.value)}
                  placeholder={locale === 'ar' ? 'أدخل عنوان المدونة بالإنجليزية' : 'Enter blog title in English'}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'المقتطف (بالإنجليزية)' : 'Excerpt (English)'}
                </label>
                <textarea
                  value={formData.excerpt.en}
                  onChange={(e) => handleNestedInputChange('excerpt', 'en', e.target.value)}
                  placeholder={locale === 'ar' ? 'مقتطف موجز للمدونة بالإنجليزية' : 'Brief excerpt of the blog post in English'}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.excerpt ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'المحتوى (بالإنجليزية)' : 'Content (English)'}
                </label>
                <EditorComponent
                  data={formData.content.en}
                  onChange={(data: OutputData) => handleNestedInputChange('content', 'en', data)}
                  placeholder={locale === 'ar' ? '' : 'Start writing or type \'/\' for commands...'}
                  dir="ltr"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
            </div>
          </div>



          {/* Arabic Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <span className={`w-2 h-5 bg-green-500 rounded ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}></span>
              {locale === 'ar' ? 'المحتوى بالعربية' : 'Arabic Content'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'العنوان (بالعربية)' : 'Title (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.title.ar}
                  onChange={(e) => handleNestedInputChange('title', 'ar', e.target.value)}
                  placeholder={locale === 'ar' ? 'عنوان المقال باللغة العربية' : 'عنوان المقال باللغة العربية'}
                  dir="rtl"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  {locale === 'ar' ? 'المقتطف (بالعربية)' : 'Excerpt (Arabic)'}

                </label>

                <textarea
                  value={formData.excerpt.ar}
                  onChange={(e) => handleNestedInputChange('excerpt', 'ar', e.target.value)}
                  placeholder={locale === 'ar' ? 'مقتطف قصير من المقال باللغة العربية' : 'مقتطف قصير من المقال باللغة العربية'}
                  rows={3}
                  dir="rtl"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.excerpt ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  {locale === 'ar' ? 'المحتوى (بالعربية)' : 'Content (Arabic)'}

                </label>

                <EditorComponent
                  data={formData.content.ar}
                  onChange={(data: OutputData) => handleNestedInputChange('content', 'ar', data)}
                  placeholder="ابدأ الكتابة أو اكتب '/' للأوامر..."
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-6 bg-purple-500 rounded ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'صورة الغلاف' : 'Cover Image'}
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'صورة الغلاف' : 'Cover Image'}
            </label>
            <ImageUpload
              value={formData.cover_image_url || ''}
              onChange={(imageData) => handleCoverImageChange(imageData)}
              placeholder={locale === 'ar' ? 'أدخل رابط صورة الغلاف أو قم برفعها' : 'Enter cover image URL or upload'}
              imageType="default"
              companyName={formData.title.en}
              companyNameAr={formData.title.ar}
              imageId={formData.cover_image_id || undefined}
            />
            <p className="mt-1 text-xs text-gray-500">
              {locale === 'ar' ? 'PNG, JPG, GIF حتى 5 ميجابايت' : 'PNG, JPG, GIF up to 5MB'}
            </p>
            <p className="mt-1 text-xs text-blue-600">
              {locale === 'ar' ? 'سيتم إنشاء نص بديل وصفي تلقائياً للصورة لتحسين إمكانية الوصول' : 'Descriptive alt text will be automatically generated for accessibility'}
            </p>
          </div>
        </div>



        {/* Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-6 bg-orange-500 rounded ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'الوسوم' : 'Tags'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الوسوم الإنجليزية' : 'English Tags'}
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'أضف وسماً إنجليزياً واضغط Enter' : 'Add English tag and press Enter'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value;
                        if (value.trim() && !formData.tags.en.includes(value.trim())) {
                          handleInputChange('tags', {
                            ...formData.tags,
                            en: [...formData.tags.en, value.trim()]
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.en.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleInputChange('tags', {
                          ...formData.tags,
                          en: formData.tags.en.filter(t => t !== tag)
                        })}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                {locale === 'ar' ? 'الوسوم العربية' : 'Arabic Tags'}

              </label>

              <div className="space-y-2">

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'أضف وسماً باللغة العربية واضغط Enter' : 'أضف وسماً باللغة العربية واضغط Enter'}
                    dir="rtl"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value;
                        if (value.trim() && !formData.tags.ar.includes(value.trim())) {
                          handleInputChange('tags', {
                            ...formData.tags,
                            ar: [...formData.tags.ar, value.trim()]
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.ar.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleInputChange('tags', {
                          ...formData.tags,
                          ar: formData.tags.ar.filter(t => t !== tag)
                        })}
                        className={`${locale === 'ar' ? 'mr-2' : 'ml-2'} text-green-600 hover:text-green-800`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-6 bg-indigo-500 rounded ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}></span>
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
                  {(typeof formData.seo.meta_description === 'string' 
                    ? formData.seo.meta_description 
                    : formData.seo.meta_description?.[locale as 'en' | 'ar'] || ''
                  ).length}/160
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
                {locale === 'ar' ? 'يتم إنشاؤه تلقائياً من الملخص' : 'Auto-generated from excerpt'} • {locale === 'ar' ? 'يمكنك تخصيصه' : 'You can customize it'}
              </p>
            </div>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className={`w-2 h-6 bg-indigo-500 rounded ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}></span>
            {locale === 'ar' ? 'خيارات النشر' : 'Publishing Options'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الحالة' : 'Status'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published' | 'archived')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="draft">{locale === 'ar' ? 'مسودة' : 'Draft'}</option>
                <option value="published">{locale === 'ar' ? 'منشور' : 'Published'}</option>
                <option value="archived">{locale === 'ar' ? 'مؤرشف' : 'Archived'}</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                {locale === 'ar' ? 'منشور مميز' : 'Featured Post'}
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={`flex justify-end space-x-4 ${locale === 'ar' ? 'space-x-reverse' : ''}`}>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-6 py-2 border border-purple-300 rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {locale === 'ar' ? 'معاينة' : 'Preview'}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              isEdit ? (locale === 'ar' ? 'تحديث المنشور' : 'Update Post') : (locale === 'ar' ? 'إنشاء منشور' : 'Create Post')
            )}
          </button>
        </div>

        {/* Preview Modal */}
      <BlogPreview
        formData={{
          title: formData.title?.[locale as 'en' | 'ar'] || '',
          excerpt: formData.excerpt?.[locale as 'en' | 'ar'] || '',
          content: formData.content?.[locale as 'en' | 'ar'] || { blocks: [], time: Date.now(), version: '2.0' },
          cover_image_url: formData.cover_image_url,
          cover_image_id: formData.cover_image_id,
          category_id: formData.category_id,
          author_id: formData.author_id,
          reading_time: formData.reading_time,
          tags: formData.tags?.[locale as 'en' | 'ar'] || [],
          status: formData.status,
          is_featured: formData.is_featured,
          seo: {
            meta_description: formData.seo?.meta_description || '',
            keywords: generateKeywords(formData.title?.[locale as 'en' | 'ar'] || '', formData.excerpt?.[locale as 'en' | 'ar'] || ''),
            og_title: formData.seo?.social_title || '',
            og_description: formData.seo?.social_description || ''
          }
        }}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        authorData={currentAuthorData ? {
          name: currentAuthorData[`name_${locale}`] || currentAuthorData.name_en || currentAuthorData.name,
          avatar: currentAuthorData.image?.url || currentAuthorData.avatar
        } : undefined}
        categoryData={currentCategoryData ? {
          name: currentCategoryData[`name_${locale}`] || currentCategoryData.name_en || currentCategoryData.name
        } : undefined}
      />

      </form>

      {/* Author Manager Modal - Outside the form to prevent nesting */}
      {showAuthorManager && (
        <AuthorManager
          initialAuthor={authorToEdit}
          onAuthorUpdated={() => authorToEdit ? handleAuthorUpdated(false) : handleAuthorCreated()}
          onClose={() => {
            setShowAuthorManager(false);
            setAuthorToEdit(null);
          }}
        />
      )}
    </>
  );

};

export default BlogForm;

