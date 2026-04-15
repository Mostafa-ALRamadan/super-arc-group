'use client';

import { useState, useEffect } from 'react';
import ContactForm from '../forms/ContactForm';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';

interface ContactSectionProps {
  locale?: string;
}

export default function ContactSection({ locale = 'en' }: ContactSectionProps) {
  const [mounted, setMounted] = useState(false);
  const { isVisible, setElement } = useScrollAnimation(0.1);
  const isRTL = locale === 'ar';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Direct translations object to avoid useTranslations issues
  const translations = locale === 'ar' ? {
    sectionLabel: 'تواصل معنا',
    title: 'دعنا نناقش مشروعك القادم',
    description: 'تواصل مع مجموعة سوبر آرك لمناقشة متطلبات مشروعك وسيقوم فريقنا بالرد عليك في أقرب وقت.',
    form: {
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      subject: 'الموضوع',
      message: 'الرسالة',
      submit: 'إرسال الرسالة',
      submitting: 'جاري الإرسال...',
      success: 'تم إرسال الرسالة بنجاح! سنتواصل معك قريباً.',
      error: 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.',
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
      invalidPhone: 'يرجى إدخال رقم هاتف صحيح',
      minLength: 'يجب أن يكون على الأقل {min} أحرف',
    },
    info: {
      title: 'معلومات الاتصال',
      email: 'info@superarcgroup.com',
      phone: '+971 547 2020 14',
      phone2: '+963 947 964 829',
      address: 'سوريا ، حماة , أبوظبي الإامارات العربية المتحدة',
    },
  } : {
    sectionLabel: 'Contact Us',
    title: "Let's Discuss Your Next Project",
    description: 'Get in touch with Super Arc Group to discuss your project requirements. Our team will respond promptly.',
    form: {
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      subject: 'Subject',
      message: 'Message',
      submit: 'Send Message',
      submitting: 'Sending...',
      success: 'Message sent successfully! We\'ll get back to you soon.',
      error: 'Failed to send message. Please try again.',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      minLength: 'Must be at least {min} characters',
    },
    info: {
      title: 'Contact Information',
      email: 'info@superarcgroup.com',
      phone: '+971 547 2020 14',
      phone2: '+963 947 964 829',
      address: 'Syria, Hama, Abu Dhabi United Arab Emirates',
    },
  };

  const handleFormSuccess = () => {
    // Optional: Add success handling logic
    // Form submission success will be handled by ContactForm component
  };

  return (
    <section ref={setElement} className="py-20 bg-gradient-to-br from-bg-light to-white scroll-mt-32">
      <div id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 border-[1px] rounded-full px-4 py-2 backdrop-blur-[16px] mb-2" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">
              {translations.sectionLabel}
            </span>
          </div>
          <h3 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 relative"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
              transition: 'all 0.8s ease-out 0.2s' 
            }}
          >
            {translations.title}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-secondary rounded-full"></div>
          </h3>
          <p 
            className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed mt-8"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
              transition: 'all 0.8s ease-out 0.4s' 
            }}
          >
            {translations.description}
          </p>
        </div>
      </div>
      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info Panel */}
          <div className="space-y-8" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.8s' }}>
            <div>
              <h3 className="text-2xl font-bold text-main mb-6">
                {translations.info.title}
              </h3>
              
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1F5142' }}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-main mb-1">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </h4>
                    <a
                      href={`mailto:${translations.info.email}`}
                      className="text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      {translations.info.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1F5142' }}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-main mb-2">
                      {isRTL ? 'رقم الهاتف' : 'Phone'}
                    </h4>
                    <a
                      href={`tel:${translations.info.phone}`}
                      className="text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <span dir="ltr">{translations.info.phone}</span>
                    </a>
                    <br />
                    <a
                      href={`tel:${translations.info.phone2}`}
                      className="text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <span dir="ltr">{translations.info.phone2}</span>
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1F5142' }}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-main mb-1">
                      {isRTL ? 'العنوان' : 'Address'}
                    </h4>
                    <a
                      href="https://maps.google.com/?q=Super+Arc+Consultant+L.L.C,+Abu+Dhabi,+United+Arab+Emirates"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <span dir="ltr">{translations.info.address}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="rounded-2xl p-8 border border-primary/50" style={{ backgroundColor: '#1F5142' }}>
              <h4 className="text-lg font-semibold text-white mb-3">
                {isRTL ? 'وقت الاستجابة' : 'Response Time'}
              </h4>
              <p className="text-white/90 leading-relaxed mb-4">
                {isRTL 
                  ? <span>نلتزم بالرد على جميع الاستفسارات في غضون <span dir="ltr">24</span> ساعة عمل. للمسائل العاجلة، يرجى الاتصال بنا مباشرة.</span>
                  : 'We respond to all inquiries within 24 business hours. For urgent matters, please call us directly.'
                }
              </p>
              <div className="flex items-center gap-2 text-sm text-white font-medium">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {isRTL ? <span><span dir="ltr">24</span> ساعة عمل</span> : '24 business hours'}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.8s' }}>
            <ContactForm 
              locale={locale} 
              onSuccess={handleFormSuccess}
              translations={translations}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
