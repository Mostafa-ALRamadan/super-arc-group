// Error message translations for admin pages
// Backend returns English errors, we translate them for Arabic layout

export const errorTranslations: Record<string, { en: string; ar: string }> = {
  // Common field errors
  'This field is required': {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
  },
  'This field may not be blank': {
    en: 'This field may not be blank',
    ar: 'هذا الحقل لا يمكن أن يكون فارغاً',
  },
  'This field may not be null': {
    en: 'This field may not be null',
    ar: 'هذا الحقل مطلوب',
  },
  'Enter a valid URL': {
    en: 'Enter a valid URL',
    ar: 'أدخل رابطاً صالحاً',
  },
  'Enter a valid email address': {
    en: 'Enter a valid email address',
    ar: 'أدخل بريداً إلكترونياً صالحاً',
  },
  'Ensure this field has no more than': {
    en: 'Text is too long',
    ar: 'النص طويل جداً',
  },
  'Ensure this field has at least': {
    en: 'Text is too short',
    ar: 'النص قصير جداً',
  },
  
  // Not found errors
  'not found': {
    en: 'not found',
    ar: 'غير موجود',
  },
  'Client not found': {
    en: 'Client not found',
    ar: 'العميل غير موجود',
  },
  'Employee not found': {
    en: 'Employee not found',
    ar: 'الموظف غير موجود',
  },
  'Company not found': {
    en: 'Company not found',
    ar: 'الشركة غير موجودة',
  },
  
  // Company errors
  'Failed to create company': {
    en: 'Failed to create company',
    ar: 'فشل في إنشاء الشركة',
  },
  'A company with a similar name already exists': {
    en: 'A company with a similar name already exists',
    ar: 'شركة باسم مشابه موجودة بالفعل',
  },
  'Failed to update company': {
    en: 'Failed to update company',
    ar: 'فشل في تحديث الشركة',
  },
  'Failed to load company': {
    en: 'Failed to load company',
    ar: 'فشل في تحميل الشركة',
  },
  'Failed to create client': {
    en: 'Failed to create client',
    ar: 'فشل في إنشاء العميل',
  },
  'Failed to update client': {
    en: 'Failed to update client',
    ar: 'فشل في تحديث العميل',
  },
  'Failed to load client': {
    en: 'Failed to load client',
    ar: 'فشل في تحميل العميل',
  },
  'Failed to fetch client data': {
    en: 'Failed to fetch client data',
    ar: 'فشل في جلب بيانات العميل',
  },
  'Failed to create employee': {
    en: 'Failed to create employee',
    ar: 'فشل في إنشاء الموظف',
  },
  'Failed to update employee': {
    en: 'Failed to update employee',
    ar: 'فشل في تحديث الموظف',
  },
  'Failed to load employee': {
    en: 'Failed to load employee',
    ar: 'فشل في تحميل الموظف',
  },
  'Failed to fetch employee data': {
    en: 'Failed to fetch employee data',
    ar: 'فشل في جلب بيانات الموظف',
  },
  'Failed to create blog post': {
    en: 'Failed to create blog post',
    ar: 'فشل في إنشاء المقال',
  },
  'Failed to update blog post': {
    en: 'Failed to update blog post',
    ar: 'فشل في تحديث المقال',
  },
  'Failed to load blog post': {
    en: 'Failed to load blog post',
    ar: 'فشل في تحميل المقال',
  },
  'Failed to create project': {
    en: 'Failed to create project',
    ar: 'فشل في إنشاء المشروع',
  },
  'Failed to update project': {
    en: 'Failed to update project',
    ar: 'فشل في تحديث المشروع',
  },
  'Failed to load project': {
    en: 'Failed to load project',
    ar: 'فشل في تحميل المشروع',
  },
  'Failed to create category': {
    en: 'Failed to create category',
    ar: 'فشل في إنشاء الفئة',
  },
  'Failed to create category in backend': {
    en: 'Failed to create category in backend',
    ar: 'فشل في إنشاء الفئة في الخادم',
  },
  'A category with this name already exists': {
    en: 'A category with this name already exists',
    ar: 'فئة بهذا الاسم موجودة بالفعل',
  },
  'A category with this name and type already exists': {
    en: 'A category with this name and type already exists',
    ar: 'فئة بهذا الاسم والنوع موجودة بالفعل',
  },
  'You cannot create a category with the same name and type': {
    en: 'You cannot create a category with the same name and type',
    ar: 'لا يمكنك إنشاء فئة بنفس الاسم والنوع',
  },
  'Category with this name and type already exists': {
    en: 'Category with this name and type already exists',
    ar: 'فئة بهذا الاسم والنوع موجودة بالفعل',
  },
  'Failed to update category': {
    en: 'Failed to update category',
    ar: 'فشل في تحديث الفئة',
  },
  'Failed to load category': {
    en: 'Failed to load category',
    ar: 'فشل في تحميل الفئة',
  },
  'Category not found': {
    en: 'Category not found',
    ar: 'الفئة غير موجودة',
  },
  'Leadership member not found': {
    en: 'Leadership member not found',
    ar: 'عضو القيادة غير موجود',
  },
  'Link not found': {
    en: 'Link not found',
    ar: 'الرابط غير موجود',
  },
  'Post not found': {
    en: 'Post not found',
    ar: 'المقال غير موجود',
  },
  
  // Duplicate/slug errors
  'with this slug already exists': {
    en: 'This slug is already in use',
    ar: 'هذا المعرف مستخدم بالفعل',
  },
  'already exists': {
    en: 'already exists',
    ar: 'موجود بالفعل',
  },
  
  // Operation errors
  'Failed to create': {
    en: 'Failed to create',
    ar: 'فشل في الإنشاء',
  },
  'Failed to update': {
    en: 'Failed to update',
    ar: 'فشل في التحديث',
  },
  'Failed to delete': {
    en: 'Failed to delete',
    ar: 'فشل في الحذف',
  },
  'Failed to fetch': {
    en: 'Failed to fetch',
    ar: 'فشل في جلب البيانات',
  },
  
  // Auth errors
  'Your session has expired': {
    en: 'Your session has expired. Please log in again.',
    ar: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.',
  },
  'You do not have permission': {
    en: 'You do not have permission to access this resource.',
    ar: 'ليس لديك صلاحية الوصول إلى هذا المورد.',
  },
  'Server is temporarily unavailable': {
    en: 'Server is temporarily unavailable. Please try again later.',
    ar: 'الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.',
  },
};

/**
 * Translate an English error message to Arabic
 * Falls back to the original message if no translation found
 */
export function translateError(errorMessage: string, locale: string): string {
  if (locale !== 'ar') {
    return errorMessage;
  }

  // Check for exact match first
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage].ar;
  }

  // Check for partial matches
  for (const [key, translations] of Object.entries(errorTranslations)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return translations.ar;
    }
  }

  // If field-specific error (format: "Field: error message")
  if (errorMessage.includes(':')) {
    const [field, ...rest] = errorMessage.split(':');
    const fieldError = rest.join(':').trim();
    
    // Translate field names
    const fieldTranslations: Record<string, string> = {
      'English name': 'الاسم بالإنجليزية',
      'Arabic name': 'الاسم بالعربية',
      'English title': 'العنوان بالإنجليزية',
      'Arabic title': 'العنوان بالعربية',
      'English position': 'المنصب بالإنجليزية',
      'Arabic position': 'المنصب بالعربية',
      'English bio': 'النبذة بالإنجليزية',
      'Arabic bio': 'النبذة بالعربية',
      'Slug': 'المعرف',
      'Category': 'الفئة',
      'Company': 'الشركة',
      'Title': 'العنوان',
      'URL': 'الرابط',
    };

    const translatedField = fieldTranslations[field] || field;
    
    // Try to translate the error part
    for (const [key, translations] of Object.entries(errorTranslations)) {
      if (fieldError.toLowerCase().includes(key.toLowerCase())) {
        return `${translatedField}: ${translations.ar}`;
      }
    }
    
    // If no specific error translation, use generic message
    return `${translatedField}: ${fieldError}`;
  }

  // Return original if no translation found
  return errorMessage;
}
