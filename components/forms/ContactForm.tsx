'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContactSchema, type ContactFormData } from '../../src/utils/validation/contact';

interface ContactFormProps {
  locale?: string;
  onSuccess?: () => void;
  translations: {
    sectionLabel: string;
    title: string;
    description: string;
    form: {
      name: string;
      email: string;
      phone: string;
      subject: string;
      message: string;
      submit: string;
      submitting: string;
      success: string;
      error: string;
      required: string;
      invalidEmail: string;
      invalidPhone: string;
      minLength: string;
    };
    info: {
      title: string;
      email: string;
      phone: string;
      address: string;
    };
  };
}

export default function ContactForm({ locale = 'en', onSuccess, translations }: ContactFormProps) {
  const t = (key: string, params?: any) => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (params && typeof value === 'string') {
      return value.replace(/{(\w+)}/g, (match: string, param: string) => 
        params[param]?.toString() || match
      );
    }
    
    return value || key;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(createContactSchema(t)),
  });

  const isRTL = locale === 'ar';

  // Real API submission
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Call our API route instead of backend directly
      const response = await fetch('/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        reset();
        onSuccess?.();
        
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        throw new Error(result.message || 'Failed to submit contact form');
      }
      
    } catch (error) {
      setSubmitStatus('error');
      
      // Log the actual error for debugging
      console.error('Contact form submission error:', error);
      
      // Reset error message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = `
    w-full px-4 py-3 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-primary focus:border-transparent
    transition-all duration-200 outline-none
    ${isRTL ? 'text-right' : 'text-left'}
    ${errors.name ? 'border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}
  `;

  const labelClasses = `
    block text-sm font-medium text-main mb-2
    ${isRTL ? 'text-right' : 'text-left'}
  `;

  const errorClasses = `
    text-red-500 text-xs mt-1
    ${isRTL ? 'text-right' : 'text-left'}
  `;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">{t('form.success')}</p>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{t('form.error')}</p>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className={labelClasses}>
          {t('form.name')} *
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className={inputClasses}
          placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
          disabled={isSubmitting}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className={errorClasses} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className={labelClasses}>
          {t('form.email')} *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={inputClasses}
          placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
          disabled={isSubmitting}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className={errorClasses} role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className={labelClasses}>
          {t('form.phone')} *
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className={inputClasses}
          placeholder={isRTL ? '+966 50 123 4567' : '+966 50 123 4567'}
                  style={{ direction: isRTL ? 'ltr' : 'inherit' }}
          disabled={isSubmitting}
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className={errorClasses} role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className={labelClasses}>
          {t('form.subject')} *
        </label>
        <input
          id="subject"
          type="text"
          {...register('subject')}
          className={inputClasses}
          placeholder={isRTL ? 'موضوع رسالتك' : 'Subject of your message'}
          disabled={isSubmitting}
          aria-invalid={errors.subject ? 'true' : 'false'}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
        />
        {errors.subject && (
          <p id="subject-error" className={errorClasses} role="alert">
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className={labelClasses}>
          {t('form.message')} *
        </label>
        <textarea
          id="message"
          rows={5}
          {...register('message')}
          className={`${inputClasses} resize-none`}
          placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
          disabled={isSubmitting}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className={errorClasses} role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-4 px-6 bg-gradient-to-r from-[#DAA424] to-[#E5B84D]
          text-white font-semibold rounded-lg
          hover:from-[#B8891F] hover:to-[#DAA424]
          focus:outline-none focus:ring-2 focus:ring-[#DAA424] focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl
          ${isSubmitting ? 'cursor-not-allowed' : ''}
        `}
      >
        {isSubmitting ? (
          <span className={`flex items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <svg
              className={`animate-spin h-5 w-5 text-white ${isRTL ? 'ml-3' : '-ml-1 mr-3'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('form.submitting')}
          </span>
        ) : (
          t('form.submit')
        )}
      </button>
    </form>
  );
}
