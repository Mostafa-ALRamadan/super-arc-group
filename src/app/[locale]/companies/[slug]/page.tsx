import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { companiesService } from '../../../../services/entities/companies.service';
import CompanyHero from '../../../../../components/companies/CompanyHero';
import EmployeesGrid from '../../../../../components/companies/EmployeesGrid';

// Disable caching for company pages to ensure updates are visible immediately
export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface CompanyPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  // Get company using service
  const company = await companiesService.getCompanyBySlug(slug);

  if (!company) {
    return {
      title: 'Company Not Found',
      description: 'The requested company could not be found.'
    };
  }

  // Helper function to safely get localized content
  const getLocalizedValue = (obj: any, locale: string): string => {
    if (typeof obj === 'string') {
      return obj;
    }
    if (obj && typeof obj === 'object' && 'en' in obj && 'ar' in obj) {
      return locale === 'ar' ? obj.ar : obj.en;
    }
    return '';
  };

  const companyName = getLocalizedValue(company.name, locale);
  const description = getLocalizedValue(company.description, locale);

  return {
    title: companyName,
    description: description,
    openGraph: {
      title: `${companyName} | Super Arc Group`,
      description: description,
      images: company.image ? [
        {
          url: company.image.url,
          width: 800,
          height: 600,
          alt: companyName,
        },
      ] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: companyName,
      description: description,
      images: company.image ? [company.image.url] : [],
    },
    alternates: {
      canonical: `/${locale}/companies/${slug}`,
      languages: {
        'en': `/en/companies/${slug}`,
        'ar': `/ar/companies/${slug}`,
      },
    },
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { locale, slug } = await params;
  
  // Get company using service
  const company = await companiesService.getCompanyBySlug(slug);

  // Handle 404
  if (!company) {
    notFound();
  }

  // Transform employee data to match frontend interface
  const transformedEmployees = (company.employees || []).map((emp: any) => ({
    id: emp.id,
    name: {
      en: emp.name_en,
      ar: emp.name_ar
    },
    position: {
      en: emp.position_en,
      ar: emp.position_ar
    },
    image: emp.image ? {
      id: emp.image.id,
      url: emp.image.url.startsWith('http') 
        ? emp.image.url 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${emp.image.url}`,
      alt_en: emp.image.alt_en,
      alt_ar: emp.image.alt_ar
    } : undefined,
    image_id: emp.image?.id,
    company_id: company.id,
    company: emp.company,
    initials: emp.name_en.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    createdAt: emp.created_at,
    updatedAt: emp.updated_at
  }));

  // Get links for this company
  const links = company.links || [];

  // Helper function to safely get localized content
  const getLocalizedValue = (obj: any, locale: string): string => {
    if (typeof obj === 'string') {
      return obj; // Fallback for old structure
    }
    if (obj && typeof obj === 'object' && 'en' in obj && 'ar' in obj) {
      return locale === 'ar' ? obj.ar : obj.en;
    }
    return ''; // Fallback
  };

  const isRTL = locale === 'ar';
  const companyName = getLocalizedValue(company.name, locale);

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'} pt-20`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Company Hero */}
      <CompanyHero company={company} locale={locale as 'en' | 'ar'} />

      {/* Company Links Section */}
      {links && links.length > 0 && (
        <section className="bg-white py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className={`text-2xl sm:text-3xl font-bold text-main mb-3 sm:mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                {locale === 'en' ? 'Quick Links' : 'روابط سريعة'}
              </h2>
              <p className={`text-muted text-base sm:text-lg ${isRTL ? 'font-arabic' : ''}`}>
                {locale === 'en' 
                  ? 'Connect with us through these platforms' 
                  : 'تواصل معنا من خلال هذه المنصات'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {links.map((link: any) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center p-4 sm:p-5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary hover:bg-primary-light transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center space-x-3 sm:space-x-3 rtl:space-x-reverse">
                    {/* Link Icon */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-dark transition-colors">
                      <svg 
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                        />
                      </svg>
                    </div>
                    
                    {/* Link Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base sm:text-lg font-semibold text-main group-hover:text-primary transition-colors ${isRTL ? 'font-arabic' : ''}`}>
                        {link.title}
                      </h3>
                      <p className={`text-xs sm:text-sm text-muted truncate ${isRTL ? 'font-arabic' : ''}`}>
                        {link.url}
                      </p>
                    </div>

                    {/* External Link Indicator */}
                    <div className="flex-shrink-0 ml-1 rtl:mr-1">
                      <svg 
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted group-hover:text-primary transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Employees Section */}
      {transformedEmployees && transformedEmployees.length > 0 && (
        <section className="bg-white py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <EmployeesGrid 
              employees={transformedEmployees} 
              locale={locale as 'en' | 'ar'} 
            />
          </div>
        </section>
      )}

      {/* Back to Companies */}
      <div className="bg-white border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Link 
              href={`/${locale}/who-we-are#companies`}
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              {locale === 'en' ? 'Back to Companies' : 'العودة إلى الشركات'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all companies
export async function generateStaticParams() {
  const companies = [
    { slug: 'al-shallal-drilling', locale: 'en' },
    { slug: 'al-shallal-drilling', locale: 'ar' },
    { slug: 'super-arc-engineering', locale: 'en' },
    { slug: 'super-arc-engineering', locale: 'ar' },
    { slug: 'super-arc-consultancy', locale: 'en' },
    { slug: 'super-arc-consultancy', locale: 'ar' },
  ];

  return companies;
}
