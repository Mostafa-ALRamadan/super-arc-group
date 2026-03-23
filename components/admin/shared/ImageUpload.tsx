'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { fetchWithTokenRefresh, handleAuthError } from '../../../src/services/auth/auth-fetch';
import { useTranslations, useLocale } from '../../../src/contexts/TranslationContext';

interface ImageUploadProps {
  value: string;
  onChange: (imageData: { url: string; id: number } | string) => void;
  placeholder?: string;
  className?: string;
  companyName?: string; // Name for alt text generation (English)
  companyNameAr?: string; // Name for alt text generation (Arabic)
  imageType?: 'logo' | 'photo' | 'default' | 'project'; // Type of image for alt text
  imageId?: number; // Existing image ID for alt text updates
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  placeholder = 'https://example.com/image.jpg',
  className = '',
  companyName = '',
  companyNameAr = '',
  imageType = 'default',
  imageId
}) => {
  const { t, locale } = useTranslations();
  const isRTL = locale === 'ar';
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentImageData, setCurrentImageData] = useState<{ url: string; id: number } | string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update alt text when company name changes and we have an existing image
  useEffect(() => {
    const existingImageId = imageId || (currentImageData && typeof currentImageData === 'object' ? currentImageData.id : null);
    if (existingImageId) {
      // Only update if we have a meaningful company name change
      if (companyName || companyNameAr) {
        updateImageAltText(existingImageId);
      }
    }
  }, [companyName, companyNameAr]);

  // Initialize current image data when value prop changes
  useEffect(() => {
    if (value && typeof value === 'string' && value !== currentImageData) {
      // If we have an imageId, create an object with both URL and ID
      if (imageId) {
        setCurrentImageData({ url: value, id: imageId });
      } else {
        // If it's a URL string, we don't have the ID, so we can't update alt text
        setCurrentImageData(value);
      }
    }
  }, [value, imageId]);

  // Function to update image alt text
  const updateImageAltText = async (imageId: number) => {
    try {
      // Generate new alt text based on current company names
      let altTextBase = '';
      let altTextAr = '';
      
      if (companyName || companyNameAr) {
        switch (imageType) {
          case 'logo':
            altTextBase = companyName ? `${companyName} Company Logo` : 'Company Logo';
            altTextAr = companyNameAr ? `شعار شركة ${companyNameAr}` : 'شعار الشركة';
            break;
          case 'photo':
            altTextBase = companyName ? `${companyName} Employee Photo` : 'Employee Photo';
            altTextAr = companyNameAr ? `صورة الموظف ${companyNameAr}` : 'صورة الموظف';
            break;
          case 'project':
            // For project images, generate more descriptive alt text
            altTextBase = companyName ? `Project showcase image for ${companyName}` : 'Project showcase image with relevant visual content';
            altTextAr = companyNameAr ? `صورة معرض المشروع لـ ${companyNameAr}` : 'صورة معرض المشروع مع محتوى بصري ذي صلة';
            break;
          default:
            // For blog cover images, generate more descriptive alt text
            altTextBase = companyName ? `Cover image for blog post about ${companyName}` : 'Blog post cover image featuring relevant content';
            altTextAr = companyNameAr ? `صورة الغلاف لمقال عن ${companyNameAr}` : 'صورة غلاف المقال تحتوي على محتوى ذي صلة';
        }
      } else {
        // Fallback when no name provided
        switch (imageType) {
          case 'logo':
            altTextBase = 'Company Logo';
            altTextAr = 'شعار الشركة';
            break;
          case 'photo':
            altTextBase = 'Employee Photo';
            altTextAr = 'صورة الموظف';
            break;
          case 'project':
            // For project images, provide more descriptive fallback
            altTextBase = 'Project showcase image with relevant visual content';
            altTextAr = 'صورة معرض المشروع مع محتوى بصري ذي صلة';
            break;
          default:
            // For blog cover images, provide more descriptive fallback
            altTextBase = 'Blog post cover image with relevant visual content';
            altTextAr = 'صورة غلاف المقال مع محتوى بصري ذي صلة';
        }
      }

      // Update the image alt text via API
      const response = await fetchWithTokenRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${imageId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alt_en: altTextBase,
          alt_ar: altTextAr
        })
      });

      if (response.ok) {
        // Image alt text updated successfully
      }
    } catch (error) {
      console.error('Error updating image alt text:', error);
    }
  };

  // Upload image to API
  const uploadImage = async (file: File): Promise<{ url: string; id: number }> => {
    const formData = new FormData();
    formData.append('url', file); // Django backend expects 'url' for the file field
    
    // Generate alt text based on image type and name
    let altTextBase = '';
    let altTextAr = '';
    
    if (companyName || companyNameAr) {
      switch (imageType) {
        case 'logo':
          altTextBase = companyName ? `${companyName} Company Logo` : 'Company Logo';
          altTextAr = companyNameAr ? `شعار شركة ${companyNameAr}` : 'شعار الشركة';
          break;
        case 'photo':
          altTextBase = companyName ? `${companyName} Employee Photo` : 'Employee Photo';
          altTextAr = companyNameAr ? `صورة الموظف ${companyNameAr}` : 'صورة الموظف';
          break;
        case 'project':
          // For project images, generate more descriptive alt text
          altTextBase = companyName ? `Project showcase image for ${companyName}` : 'Project showcase image with relevant visual content';
          altTextAr = companyNameAr ? `صورة معرض المشروع لـ ${companyNameAr}` : 'صورة معرض المشروع مع محتوى بصري ذي صلة';
          break;
        default:
          // For blog cover images, generate more descriptive alt text
          altTextBase = companyName ? `Cover image for blog post about ${companyName}` : 'Blog post cover image featuring relevant content';
          altTextAr = companyNameAr ? `صورة الغلاف لمقال عن ${companyNameAr}` : 'صورة غلاف المقال تحتوي على محتوى ذي صلة';
      }
    } else {
      // Fallback when no name provided
      switch (imageType) {
        case 'logo':
          altTextBase = 'Company Logo';
          altTextAr = 'شعار الشركة';
          break;
        case 'photo':
          altTextBase = 'Employee Photo';
          altTextAr = 'صورة الموظف';
          break;
        case 'project':
          // For project images, provide more descriptive fallback
          altTextBase = 'Project showcase image with relevant visual content';
          altTextAr = 'صورة معرض المشروع مع محتوى بصري ذي صلة';
          break;
        default:
          // For blog cover images, provide more descriptive fallback
          altTextBase = 'Blog post cover image with relevant visual content';
          altTextAr = 'صورة غلاف المقال مع محتوى بصري ذي صلة';
      }
    }
    
    formData.append('alt_en', altTextBase);
    formData.append('alt_ar', altTextAr);

    // Check if we're on client side
    const isClient = typeof window !== 'undefined';
    
    let response: Response;
    
    const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
    
    if (isClient) {
      // Client-side: use automatic token refresh
      response = await fetchWithTokenRefresh(`${baseUrl}/images/`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData - browser sets it automatically with boundary
      });
    } else {
      // Server-side: use absolute URL (for SSR compatibility)
      response = await fetch(`${baseUrl}/images/`, {
        method: 'POST',
        body: formData,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Django backend returns the image data directly, not wrapped in a success object
    // If we have a url field, the upload was successful
    if (!result.url) {
      throw new Error('Invalid response from server');
    }

    // Return both URL and ID for the company form
    return {
      url: result.url,
      id: result.id
    };
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(locale === 'ar' ? 'يرجى اختيار ملف صورة' : 'Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(locale === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const imageData = await uploadImage(file);
      setCurrentImageData(imageData); // Track the current image data
      onChange(imageData);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle authentication errors
      if (handleAuthError(error)) {
        return; // Auth error handled, function will redirect
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a 404 (endpoint doesn't exist)
      if (errorMessage.includes('404')) {
        const userMessage = locale === 'ar' 
          ? 'خدمة رفع الصور غير متاحة حالياً. يرجى استخدام حقل إدخال الرابط أدناه.' 
          : 'Image upload service is not available. Please use the URL input field below.';
        alert(userMessage);
      } else {
        const userMessage = locale === 'ar' 
          ? `فشل رفع الصورة: ${errorMessage}. يرجى استخدام حقل إدخال الرابط أدناه.` 
          : `Failed to upload image: ${errorMessage}. Please use the URL input field below.`;
        alert(userMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setCurrentImageData(newUrl); // Track the current image data
    onChange(newUrl);
  };

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">
              {locale === 'ar' ? 'جاري رفع الصورة...' : 'Uploading image...'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                {locale === 'ar' ? 'اسحب الصورة هنا أو' : 'Drag and drop image here or'}
              </p>
              <p className="text-blue-600 hover:text-blue-500">
                {locale === 'ar' ? 'اختر من جهازك' : 'browse from your device'}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {locale === 'ar' ? 'PNG, JPG, GIF حتى 5 ميجابايت' : 'PNG, JPG, GIF up to 5MB'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {locale === 'ar' ? 'أو أدخل رابط الصورة مباشرة في الحقل أدناه' : 'Or enter image URL directly in the field below'}
            </p>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isRTL ? 'pl-10 pr-3' : ''
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={clearImage}
            className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
              isRTL ? 'left-3' : 'right-3'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Image Preview */}
      {value && (
        <div className="mt-3">
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="max-w-full h-auto rounded-lg shadow-md max-h-48 object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
