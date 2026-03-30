import { Metadata } from 'next';

interface ClientsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ClientsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'ar' ? 'عملاؤنا | مجموعة سوبر آرك' : 'Our Clients | Super Arc Group',
    description: locale === 'ar' 
      ? 'نفتخر بالعمل مع شركات رائدة في مختلف القطاعات'
      : 'We are proud to work with leading companies across various sectors',
  };
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-white pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 border-[1px] rounded-full px-4 py-2 backdrop-blur-[16px] mb-6" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a' }}>
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">
              {locale === 'ar' ? 'عملاؤنا' : 'Our Clients'}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-main leading-tight mb-6 relative">
            <span className="bg-gradient-to-br from-text-main via-text-main to-text-main bg-clip-text text-transparent">
              {locale === 'ar' ? 'شركاء النجاح' : 'Partners in Success'}
            </span>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-secondary rounded-full"></div>
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted leading-relaxed font-medium">
            {locale === 'ar' 
              ? 'نفتخر بالعمل مع شركات رائدة في مختلف القطاعات، مساهمين في تحقيق أهدافهم وتطلعاتهم'
              : 'We are proud to work with leading companies across various sectors, contributing to their success and growth'
            }
          </p>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-8 lg:gap-10">
          {/* Generate 105 client slots (7 columns x 15 rows) */}
          {Array.from({ length: 105 }, (_, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex items-center justify-center aspect-square border border-gray-100 hover:border-primary/30 hover:scale-105"
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400 text-sm font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {locale === 'ar' ? `عميل ${index + 1}` : `Client ${index + 1}`}
                </div>
                {/* Placeholder for client logo */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'ar' ? 'انضم إلى شبكة عملائنا المرموقين' : 'Join Our Prestigious Client Network'}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {locale === 'ar' 
                ? 'دعنا نساعدك في تحقيق أهدافك المقبلة'
                : 'Let us help you achieve your next goals'
              }
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center bg-white text-primary px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out"
            >
              {locale === 'ar' ? (
                <>
                  تواصل معنا
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8l-4 4m0 0l4 4m-4-4h18" />
                  </svg>
                </>
              ) : (
                <>
                  Get in Touch
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
