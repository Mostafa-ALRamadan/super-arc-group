interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateBlogForm = (data: any, locale: 'en' | 'ar'): ValidationResult => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!data.titleEn || data.titleEn.trim() === '') {
    errors.push({
      field: 'titleEn',
      message: locale === 'ar' ? 'العنوان (إنجليزي) مطلوب' : 'Title (English) is required'
    });
  }

  if (!data.titleAr || data.titleAr.trim() === '') {
    errors.push({
      field: 'titleAr',
      message: locale === 'ar' ? 'العنوان (عربي) مطلوب' : 'Title (Arabic) is required'
    });
  }

  // Slug validation
  if (!data.slug || data.slug.trim() === '') {
    errors.push({
      field: 'slug',
      message: locale === 'ar' ? 'الرابط المختصر مطلوب' : 'Slug is required'
    });
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push({
      field: 'slug',
      message: locale === 'ar' ? 'الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط' : 'Slug must contain only lowercase letters, numbers, and hyphens'
    });
  }

  // Excerpt validation
  if (!data.excerptEn || data.excerptEn.trim() === '') {
    errors.push({
      field: 'excerptEn',
      message: locale === 'ar' ? 'المقتطف (إنجليزي) مطلوب' : 'Excerpt (English) is required'
    });
  }

  if (!data.excerptAr || data.excerptAr.trim() === '') {
    errors.push({
      field: 'excerptAr',
      message: locale === 'ar' ? 'المقتطف (عربي) مطلوب' : 'Excerpt (Arabic) is required'
    });
  }

  // Content validation
  if (!data.contentEn || data.contentEn.trim() === '') {
    errors.push({
      field: 'contentEn',
      message: locale === 'ar' ? 'المحتوى (إنجليزي) مطلوب' : 'Content (English) is required'
    });
  }

  if (!data.contentAr || data.contentAr.trim() === '') {
    errors.push({
      field: 'contentAr',
      message: locale === 'ar' ? 'المحتوى (عربي) مطلوب' : 'Content (Arabic) is required'
    });
  }

  // Cover image validation
  if (!data.coverImage || data.coverImage.trim() === '') {
    errors.push({
      field: 'coverImage',
      message: locale === 'ar' ? 'صورة الغلاف مطلوبة' : 'Cover image is required'
    });
  } else {
    try {
      new URL(data.coverImage);
    } catch {
      errors.push({
        field: 'coverImage',
        message: locale === 'ar' ? 'صورة الغلاف يجب أن تكون رابط صحيح' : 'Cover image must be a valid URL'
      });
    }
  }

  // Category validation
  if (!data.categoryId || data.categoryId.trim() === '') {
    errors.push({
      field: 'categoryId',
      message: locale === 'ar' ? 'الفئة مطلوبة' : 'Category is required'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
