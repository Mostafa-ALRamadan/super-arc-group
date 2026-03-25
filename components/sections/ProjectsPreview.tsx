'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProjectCard from '../ui/public/ProjectCard';
import { useScrollAnimation } from '../../src/hooks/useScrollAnimation';

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
}

const translations = {
  en: {
    sectionLabel: 'Our Projects',
    title: 'Delivering Complex Projects with Proven Excellence',
    description: 'Explore a selection of our recent and landmark projects that demonstrate our technical expertise, execution capability, and commitment to international standards.',
    viewAllButton: 'View All Projects'
  },
  ar: {
    sectionLabel: 'مشاريعنا',
    title: 'تنفيذ مشاريع معقدة بكفاءة وتميز',
    description: 'استكشف مجموعة من مشاريعنا الحديثة والرائدة التي تعكس خبرتنا الفنية وقدرتنا التنفيذية والتزامنا بالمعايير الدولية.',
    viewAllButton: 'عرض جميع المشاريع'
  }
};

export default function ProjectsPreview() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { isVisible, setElement } = useScrollAnimation(0.1);

  const isRTL = locale === 'ar';
  const t = translations[locale as keyof typeof translations];

  useEffect(() => {
    setMounted(true);
    const pathname = window.location.pathname;
    
    // Extract locale from pathname
    if (pathname.startsWith('/ar')) {
      setLocale('ar');
    } else if (pathname.startsWith('/en')) {
      setLocale('en');
    } else {
      // Default to English for root path or any other path
      setLocale('en');
    }
  }, []);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
        const response = await fetch(`${baseUrl}/projects/?page=1&limit=6`);
        if (response.ok) {
          const data = await response.json();
          // Take only first 6 projects
          const projectsData = data.results || data || [];
          setProjects(projectsData.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchProjects();
    }
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-white to-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto mb-8"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Transform API data to match component structure
  const transformedProjects = projects.map(project => ({
    slug: project.slug,
    title: {
      en: project.title_en,
      ar: project.title_ar
    },
    category: isRTL ? project.category?.name_ar : project.category?.name_en,
    description: {
      en: `Project for ${project.client} in ${project.location_en}`,
      ar: `مشروع لصالح ${project.client} في ${project.location_ar}`
    },
    location: {
      en: project.location_en,
      ar: project.location_ar
    },
    year: new Date(project.completed_at).getFullYear().toString(),
    image: project.image?.url || '/images/default-project.jpg',
    imageAlt: {
      en: project.image?.alt_en || `Project showcase image for ${project.title_en}`,
      ar: project.image?.alt_ar || `صورة معرض المشروع لـ ${project.title_ar}`
    }
  }));

  return (
    <section id="projects" ref={setElement} className="py-20 bg-gradient-to-br from-white to-bg-light">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-light to-primary-light text-primary rounded-full text-sm font-semibold mb-8 border border-primary/20 shadow-sm" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
            <span>{t.sectionLabel}</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-main max-w-5xl mx-auto leading-tight mb-10 tracking-tight" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.2s' }}>
            <span className="bg-gradient-to-br from-text-main via-text-main to-text-main bg-clip-text text-transparent">
              {t.title}
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-muted max-w-4xl mx-auto leading-relaxed font-medium" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.4s' }}>
            {t.description}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {transformedProjects.map((project, index) => (
            <ProjectCard
              key={project.slug || index}
              image={project.image}
              imageAlt={project.imageAlt}
              title={project.title}
              category={project.category}
              description={project.description}
              location={project.location}
              year={project.year}
              href={`/${locale}/projects`}
              locale={locale}
              className="h-full"
              style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.6s' }}
            />
          ))}
        </div>

        {/* CTA Button - Below Cards */}
        <div className="text-center mt-16" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out 0.8s' }}>
          <Link 
            key={`projects-button-${locale}`}
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>{t.viewAllButton}</span>
            {locale === 'en' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
            {locale === 'ar' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            )}
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
