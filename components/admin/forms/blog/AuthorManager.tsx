'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from '../../../../src/contexts/TranslationContext';
import ImageUpload from '../../shared/ImageUpload';

interface ImageData {
  id: number;
  url: string;
  alt_en: string;
  alt_ar: string;
  created_at: string;
  updated_at: string;
}

interface Author {
  id?: number;
  name_en: string;
  name_ar: string;
  image_id?: number | null;
  image?: number | ImageData | null;  // Can be a number or an object with id
  photo_id?: number | null;  // Alternative field name
}

interface AuthorManagerProps {
  onAuthorUpdated: (author: Author) => void;
  onClose: () => void;
  initialAuthor?: Author | null;
}

const AuthorManager: React.FC<AuthorManagerProps> = ({ onAuthorUpdated, onClose, initialAuthor }) => {
  const { t } = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Extract image_id and image_url from various possible field names
  let imageId: number | null = null;
  let imageUrl: string = '';
  
  if (initialAuthor?.image_id) {
    imageId = initialAuthor.image_id;
    imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${imageId}/`;
  } else if (initialAuthor?.image && typeof initialAuthor.image === 'object') {
    imageId = initialAuthor.image.id;
    imageUrl = initialAuthor.image.url; // Use the direct URL from the object
  } else if (initialAuthor?.image && typeof initialAuthor.image === 'number') {
    imageId = initialAuthor.image;
    imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${imageId}/`;
  } else if (initialAuthor?.photo_id) {
    imageId = initialAuthor.photo_id;
    imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${imageId}/`;
  }
  
  const [formData, setFormData] = useState({
    name_en: initialAuthor?.name_en || '',
    name_ar: initialAuthor?.name_ar || '',
    image_url: imageUrl,
    image_id: imageId
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(!!initialAuthor);

  // Fetch full author details if initialAuthor doesn't have image data
  useEffect(() => {
    if (initialAuthor?.id && !initialAuthor?.image_id && !initialAuthor?.image) {
      const fetchAuthorDetails = async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) return;

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/authors/${initialAuthor.id}/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (response.ok) {
            const authorData = await response.json();
          
          if (authorData.image_id) {
            const detailedImageId = authorData.image_id;
            const detailedImageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${detailedImageId}/`;
            
            setFormData(prev => ({
              ...prev,
              image_url: detailedImageUrl,
              image_id: detailedImageId
            }));
          } 
          }
        } catch (error) {
          // Failed to fetch detailed author data, continue with basic data
        }
      };

      fetchAuthorDetails();
    }
  }, [initialAuthor]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    
    // Note: Automatic alt text update disabled since images/{id}/ endpoint doesn't exist
    // Alt text is already properly set during image upload
    // if ((field === 'name_en' || field === 'name_ar') && formData.image_id) {
    //   updateImageAltText(field, value);
    // }
  };

  const updateImageAltText = async (changedField: 'name_en' | 'name_ar', newValue: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !formData.image_id) {
        return;
      }

      // Generate new alt text based on current names
      const nameEn = changedField === 'name_en' ? newValue : formData.name_en;
      const nameAr = changedField === 'name_ar' ? newValue : formData.name_ar;
      
      const altText = {
        alt_en: `${nameEn || 'Unknown'} Employee Photo`,
        alt_ar: `صورة الموظف ${nameAr || 'غير معروف'}`
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${formData.image_id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(altText),
      });

      if (!response.ok) {
        const responseText = await response.text();
        
        // Try to parse as JSON, fallback to text if it fails
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} author`);
        } catch {
          throw new Error(responseText);
        }
      } else {
        // Successfully updated image alt text
      }
    } catch (error) {
      // Error updating image alt text, continue without it
    }
  };

  const handleImageChange = (imageData: string | { url: string; id: number }) => {
    if (typeof imageData === 'string') {
      setFormData(prev => ({ ...prev, image_url: imageData }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        image_url: imageData.url,
        image_id: imageData.id
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_en.trim() || !formData.name_ar.trim()) {
      setError(locale === 'ar' ? 'يجب إدخال الاسم باللغتين' : 'Both names are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Use the stored image_id directly
      const authorData = {
        name_en: formData.name_en.trim(),
        name_ar: formData.name_ar.trim(),
        image_id: formData.image_id
      };
      
      let response;
      if (isEditMode && initialAuthor?.id) {
        // Update existing author
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/authors/${initialAuthor.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(authorData),
        });
      } else {
        // Create new author
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/authors/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(authorData),
        });
      }

      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          
          // Try to parse as JSON, fallback to text if it fails
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { error: responseText };
          }
        } catch (error) {
          errorData = { error: 'Unknown error occurred' };
        }
        
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} author`);
      }

      const data = await response.json();
      
      onAuthorUpdated(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save author');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode 
              ? (locale === 'ar' ? 'تعديل معلومات المؤلف' : 'Edit Author Information')
              : (locale === 'ar' ? 'إعداد معلومات المؤلف' : 'Setup Author Information')
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
            </label>
            <input
              type="text"
              value={formData.name_en}
              onChange={(e) => handleInputChange('name_en', e.target.value)}
              placeholder={locale === 'ar' ? 'John Doe' : 'John Doe'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
            </label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={(e) => handleInputChange('name_ar', e.target.value)}
              placeholder={locale === 'ar' ? 'جون دو' : 'جون دو'}
              dir="rtl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'صورة المؤلف' : 'Author Picture'}
            </label>
            <ImageUpload
              value={formData.image_url}
              onChange={handleImageChange}
              placeholder={locale === 'ar' ? 'https://example.com/author-image.jpg' : 'https://example.com/author-image.jpg'}
              companyName={formData.name_en}
              companyNameAr={formData.name_ar}
              imageType="photo"
            />
            <p className="mt-1 text-xs text-gray-500">
              {locale === 'ar' ? 'ارفع صورة للمؤلف أو أدخل رابط الصورة' : 'Upload author picture or enter image URL'}
            </p>
            {formData.name_en && formData.name_ar && (
              <p className="mt-1 text-xs text-blue-600">
                {locale === 'ar' 
                  ? `سيتم تعيين نص الصورة البديل: "صورة الموظف ${formData.name_ar}"` 
                  : `Alt text will be set to: "${formData.name_en} Employee Photo"`
                }
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                </div>
              ) : (
                isEditMode 
                  ? (locale === 'ar' ? 'تحديث' : 'Update')
                  : (locale === 'ar' ? 'حفظ' : 'Save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorManager;
