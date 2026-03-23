import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EditorRenderer from '../../../../../components/editor/SimpleEditorRenderer';

// Project interface matching API response
interface Project {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string;
  content: {
    en: {
      time: number;
      blocks: Array<any>;
      version: string;
    };
    ar: {
      time: number;
      blocks: Array<any>;
      version: string;
    };
  };
  image: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  };
  category: {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    type: string;
  };
  location_en: string;
  location_ar: string;
  client: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  seo: {
    meta_description: string;
    og_title: string;
    og_description: string;
    social_title: string;
    social_description: string;
  };
}

interface ProjectPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Fetch project from API
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
  const timestamp = Date.now(); // Cache-busting parameter
  const response = await fetch(`${baseUrl}/projects/${slug}/?t=${timestamp}`, {
    next: { revalidate: 0 }, // Disable cache to get fresh data
    cache: 'no-store' // Force no caching
  });
  
  if (!response.ok) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.'
    };
  }
  
  const project: Project = await response.json();

  // Helper function to safely get localized content
  const getLocalizedValue = (enValue: string, arValue: string, locale: string): string => {
    return locale === 'ar' ? arValue : enValue;
  };

  const title = getLocalizedValue(project.title_en, project.title_ar, locale);
  const description = getLocalizedValue(
    `Project for ${project.client} in ${project.location_en}`,
    `مشروع لصالح ${project.client} في ${project.location_ar}`,
    locale
  );

  // Get SEO fields - prioritize social_title since it has the updated values
  const seoTitle = (project as any).seo?.social_title || (project as any).seo?.og_title || `${title} | Super Arc Group`;
  const seoDescription = (project as any).seo?.social_description || (project as any).seo?.og_description || description;

  return {
    title: title,        // ✅ Use content title for tab title
    description: description,
    openGraph: {
      title: seoTitle,  // ✅ Use SEO title for social sharing
      description: seoDescription,
      images: [
        {
          url: project.image?.url || '/images/default-project.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,  // ✅ Use SEO title for social sharing
      description: seoDescription,
      images: [project.image?.url || '/images/default-project.jpg'],
    },
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: {
        'en': `/en/projects/${slug}`,
        'ar': `/ar/projects/${slug}`,
      },
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  
  // Fetch project from API
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
  const response = await fetch(`${baseUrl}/projects/${slug}/`, {
    next: { revalidate: 0 } // Disable cache temporarily
  });

  // Handle 404
  if (!response.ok) {
    notFound();
  }

  const project: Project = await response.json();

  // Helper function to safely get localized content
  const getLocalizedValue = (enValue: string, arValue: string, locale: string): string => {
    return locale === 'ar' ? arValue : enValue;
  };

  const isRTL = locale === 'ar';
  const title = getLocalizedValue(project.title_en, project.title_ar, locale);
  
  // Get content with fallback to English if Arabic content doesn't exist
  let content = project.content[locale as 'en' | 'ar'];
  if (!content || !content.blocks || content.blocks.length === 0) {
    content = project.content.en;
  }

  return (
    <article className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section - Project Specific Design */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-primary/5">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
        </div>
        
        {/* Background Image with Lighter Overlay */}
        <div className="absolute inset-0">
          <img
            src={project.image?.url || '/images/default-project.jpg'}
            alt={locale === 'ar' ? project.image?.alt_ar || project.title_ar : project.image?.alt_en || project.title_en}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-black/8 to-black/12"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="text-white max-w-3xl">
            {/* Category Badge - Different Style */}
            <div className="inline-flex items-center px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-semibold text-primary mb-6 shadow-lg border border-white/20">
              <svg className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              {locale === 'ar' ? project.category?.name_ar : project.category?.name_en}
            </div>

            {/* Title - Different Typography */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              {title}
            </h1>

            {/* Project Stats - Unique to Projects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="flex items-center mb-2">
                  <svg className={`w-5 h-5 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  <span className="text-sm font-medium">{locale === 'ar' ? 'العميل' : 'Client'}</span>
                </div>
                <p className="text-lg font-bold">{project.client}</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="flex items-center mb-2">
                  <svg className={`w-5 h-5 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{locale === 'ar' ? 'الموقع' : 'Location'}</span>
                </div>
                <p className="text-lg font-bold">{locale === 'ar' ? project.location_ar : project.location_en}</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="flex items-center mb-2">
                  <svg className={`w-5 h-5 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{locale === 'ar' ? 'تاريخ الإنجاز' : 'Completed'}</span>
                </div>
                <p className="text-lg font-bold">
                  {new Date(project.completed_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    numberingSystem: 'latn'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Project Overview Card - Unique Design */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-12">
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center ${locale === 'ar' ? 'ml-4' : 'mr-4'}`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{locale === 'ar' ? 'نظرة عامة على المشروع' : 'Project Overview'}</h2>
              <p className="text-gray-600">{locale === 'ar' ? 'تفاصيل أساسية عن المشروع' : 'Key project information'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className={`w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center ${locale === 'ar' ? 'ml-3' : 'mr-3'} flex-shrink-0`}>
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{locale === 'ar' ? 'العميل' : 'Client'}</p>
                  <p className="text-lg font-semibold text-gray-900">{project.client}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center ${locale === 'ar' ? 'ml-3' : 'mr-3'} flex-shrink-0`}>
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{locale === 'ar' ? 'الموقع' : 'Location'}</p>
                  <p className="text-lg font-semibold text-gray-900">{locale === 'ar' ? project.location_ar : project.location_en}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className={`w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center ${locale === 'ar' ? 'ml-3' : 'mr-3'} flex-shrink-0`}>
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{locale === 'ar' ? 'الفئة' : 'Category'}</p>
                  <p className="text-lg font-semibold text-gray-900">{locale === 'ar' ? project.category?.name_ar : project.category?.name_en}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center ${locale === 'ar' ? 'ml-3' : 'mr-3'} flex-shrink-0`}>
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{locale === 'ar' ? 'تاريخ الإنجاز' : 'Completion Date'}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(project.completed_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      numberingSystem: 'latn'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Project Content - Different Styling */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-12">
          <div className="flex items-center mb-8">
            <div className={`w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center ${locale === 'ar' ? 'ml-4' : 'mr-4'}`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{locale === 'ar' ? 'تفاصيل المشروع' : 'Project Details'}</h2>
              <p className="text-gray-600">{locale === 'ar' ? 'المعلومات الكاملة عن المشروع' : 'Complete project information'}</p>
            </div>
          </div>
          
          <div className="prose prose-lg prose-primary max-w-none">
            <EditorRenderer 
              blocks={content?.blocks || []}
              locale={locale as 'en' | 'ar'}
            />
          </div>
        </div>
        
        {/* Back to Projects - Unique Design */}
        <div className="bg-gradient-to-r from-primary via-primary-dark to-primary rounded-2xl p-8 shadow-2xl text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-3">{locale === 'ar' ? 'عودة إلى معرض المشاريع' : 'Back to Project Gallery'}</h3>
              <p className="text-primary-light/90 text-lg">
                {locale === 'ar' ? 'اكتشف المزيد من مشاريعنا المتميزة' : 'Discover more of our exceptional projects'}
              </p>
            </div>
            <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <Link 
                href={`/${locale}/projects`}
                className="inline-flex items-center px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {locale === 'ar' ? (
                  <>
                    جميع المشاريع
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                ) : (
                  <>
                    All Projects
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// Generate static params for all projects
export async function generateStaticParams() {
  try {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
    const response = await fetch(`${baseUrl}/projects/`);
    
    if (!response.ok) {
      console.error('Failed to fetch projects for static params');
      return [];
    }
    
    const data = await response.json();
    const projects = data.results || data || [];
    
    // Generate params for both locales
    const params = [];
    for (const project of projects) {
      params.push({ slug: project.slug, locale: 'en' });
      params.push({ slug: project.slug, locale: 'ar' });
    }
    
    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
