import { Metadata } from 'next';

interface TermsOfServicePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: TermsOfServicePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const title = locale === 'ar' 
    ? 'شروط الخدمة | مجموعة سوبر آرك' 
    : 'Terms of Service | Super Arc Group';
    
  const description = locale === 'ar'
    ? 'شروط الخدمة لمجموعة سوبر آرك - الشروط والأحكام لاستخدام خدماتنا'
    : 'Super Arc Group Terms of Service - Terms and conditions for using our services';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function TermsOfServicePage({ params }: TermsOfServicePageProps) {
  const { locale } = await params;
  const actualLocale = locale || 'en';
  const isRTL = actualLocale === 'ar';

  const content = {
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: March 18, 2026',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: `By accessing and using Super Arc Group's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
        },
        {
          title: '2. Description of Service',
          content: `Super Arc Group provides engineering, construction, and consulting services across multiple sectors. Our services include but are not limited to project management, technical consulting, and infrastructure development.`
        },
        {
          title: '3. User Responsibilities',
          content: `Users must provide accurate and complete information when using our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`
        },
        {
          title: '4. Payment Terms',
          content: `Payment for services must be made according to the terms specified in individual project agreements. Late payments may result in service suspension or additional fees. All prices are subject to change without notice.`
        },
        {
          title: '5. Intellectual Property',
          content: `All content, trademarks, service marks, logos, trade names, and other intellectual property displayed on our services are the property of Super Arc Group or their respective owners. You may not use any of our intellectual property without prior written consent.`
        },
        {
          title: '6. Limitation of Liability',
          content: `Super Arc Group shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.`
        },
        {
          title: '7. Termination',
          content: `We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation.`
        },
        {
          title: '8. Contact Information',
          content: `If you have any questions about these Terms of Service, please contact us:
          Email: info@superarcgroup.com
          Phone: +971 00 000 0000
          Address: Dubai, United Arab Emirates`
        }
      ]
    },
    ar: {
      title: 'شروط الخدمة',
      lastUpdated: 'آخر تحديث: 18 مارس 2026',
      sections: [
        {
          title: '1. قبول الشروط',
          content: `بالوصول إلى واستخدام خدمات مجموعة سوبر آرك، فإنك تقبل وتوافق على الالتزام بشروط وأحكام هذا الاتفاق. إذا كنت لا توافق على الالتزام بما سبق، يرجى عدم استخدام هذه الخدمة.`
        },
        {
          title: '2. وصف الخدمة',
          content: `تقدم مجموعة سوبر آرك خدمات الهندسة والإنشاءات والاستشارات عبر قطاعات متعددة. تشمل خدماتنا على سبيل المثال لا الحصر إدارة المشاريع والاستشارات الفنية وتطوير البنية التحتية.`
        },
        {
          title: '3. مسؤوليات المستخدم',
          content: `يجب على المستخدمين تقديم معلومات دقيقة وكاملة عند استخدام خدماتنا. أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك وعن جميع الأنشطة التي تحدث تحت حسابك.`
        },
        {
          title: '4. شروط الدفع',
          content: `يجب دفع مقابل الخدمات وفقاً للشروط المحددة في اتفاقات المشاريع الفردية. قد تؤدي المدفوعات المتأخرة إلى تعليق الخدمة أو رسوم إضافية. جميع الأسعار عرضة للتغيير دون إشعار.`
        },
        {
          title: '5. الملكية الفكرية',
          content: `جميع المحتوى والعلامات التجارية وعلامات الخدمة والشعارات والأسماء التجارية والممتلكات الفكرية الأخرى المعروضة في خدماتنا هي ملك لمجموعة سوبر آرك أو أصحابها المعنيين. لا يجوز لك استخدام أي من مملكاتنا الفكرية دون موافقة كتابية مسبقة.`
        },
        {
          title: '6. تحديد المسؤولية',
          content: `لا تكون مجموعة سوبر آرك مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية، بما في ذلك على سبيل المثال لا الحصر فقدان الأرباح أو البيانات أو الاستخدام أو السمعة أو الخسائر غير الملموسة الأخرى.`
        },
        {
          title: '7. الإنهاء',
          content: `يجوز لنا إنهاء أو تعليق حسابك ومنع الوصول إلى الخدمة فوراً، دون إشعار مسبق أو مسؤولية، وفق تقديرنا المطلق، لأي سبب كان ودون تحديد.`
        },
        {
          title: '8. معلومات الاتصال',
          content: `إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يرجى الاتصال بنا:
          البريد الإلكتروني: info@superarcgroup.com
          الهاتف: +971 00 000 0000
          العنوان: دبي، الإمارات العربية المتحدة`
        }
      ]
    }
  };

  const t = content[actualLocale as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-bg-light pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold text-text-main mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t.title}
            </h1>
            <p className={`text-text-muted ${isRTL ? 'text-right' : 'text-left'}`}>
              {t.lastUpdated}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {t.sections.map((section, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <h2 className={`text-xl font-semibold text-text-main mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {section.title}
                </h2>
                <p className={`text-text-muted leading-relaxed whitespace-pre-line ${isRTL ? 'text-right' : 'text-left'}`}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
