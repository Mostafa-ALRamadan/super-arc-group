import { Metadata } from 'next';

interface PrivacyPolicyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const title = locale === 'ar' 
    ? 'سياسة الخصوصية | مجموعة سوبر آرك' 
    : 'Privacy Policy | Super Arc Group';
    
  const description = locale === 'ar'
    ? 'سياسة الخصوصية لمجموعة سوبر آرك - كيف نجمع ونستخدم ونحمي معلوماتك'
    : 'Super Arc Group Privacy Policy - How we collect, use, and protect your information';

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

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
  const { locale } = await params;
  const actualLocale = locale || 'en';
  const isRTL = actualLocale === 'ar';

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: March 18, 2026',
      sections: [
        {
          title: '1. Information We Collect',
          content: `We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, phone number, and other contact information.`
        },
        {
          title: '2. How We Use Your Information',
          content: `We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers.`
        },
        {
          title: '3. Information Sharing',
          content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted service providers who assist us in operating our business.`
        },
        {
          title: '4. Data Security',
          content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`
        },
        {
          title: '5. Your Rights',
          content: `You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. To exercise these rights, please contact us using the information provided below.`
        },
        {
          title: '6. Contact Us',
          content: `If you have any questions about this Privacy Policy, please contact us:
          Email: info@superarcgroup.com
          Phone: +971 00 000 0000
          Address: Dubai, United Arab Emirates`
        }
      ]
    },
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: 18 مارس 2026',
      sections: [
        {
          title: '1. المعلومات التي نجمعها',
          content: `نجمع المعلومات التي تقدمها لنا مباشرة، مثل إنشاء حساب، استخدام خدماتنا، أو الاتصال بنا للحصول على الدعم. قد يشمل ذلك اسمك وعنوان البريد الإلكتروني ورقم الهاتف ومعلومات الاتصال الأخرى.`
        },
        {
          title: '2. كيف نستخدم معلوماتك',
          content: `نستخدم المعلومات التي نجمعها لتقديم وصيانة وتحسين خدماتنا، ومعالجة المعاملات، وإرسال الإشعارات الفنية ورسائل الدعم، والتواصل معك حول المنتجات والخدمات والعروض الترويجية.`
        },
        {
          title: '3. مشاركة المعلومات',
          content: `نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف ثالثة دون موافقتك، كما هو موضح في هذه السياسة. قد نشارك معلوماتك مع مقدمي الخدمات الموثوق بهم الذين يساعدوننا في تشغيل أعمالنا.`
        },
        {
          title: '4. أمان البيانات',
          content: `نحن نطبق التدابير التقنية والتنظيمية المناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%.`
        },
        {
          title: '5. حقوقك',
          content: `لديك الحق في الوصول إلى معلوماتك الشخصية أو تحديثها أو حذفها. يمكنك أيضاً إلغاء الاشتراك في بعض الاتصالات منا. لممارسة هذه الحقوق، يرجى الاتصال بنا باستخدام المعلومات المقدمة أدناه.`
        },
        {
          title: '6. اتصل بنا',
          content: `إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا:
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
