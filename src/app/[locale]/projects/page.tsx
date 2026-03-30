'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../../../../components/ui/admin/LoadingSpinner';
import EmptyState from '../../../../components/ui/admin/EmptyState';
import Alert from '../../../../components/ui/admin/Alert';
import Pagination from '../../../../components/ui/public/Pagination';

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
  created_at: string;
  updated_at: string;
}

const translations = {
  en: {
    title: "Our Projects",
    description: "Browse our portfolio of executed projects across multiple sectors.",
    searchPlaceholder: "Search projects...",
    noProjects: "No projects found for this category.",
    allCategories: "All"
  },
  ar: {
    title: "مشاريعنا",
    description: "تصفح محفظة مشاريعنا المنفذة في مختلف القطاعات.",
    searchPlaceholder: "البحث في المشاريع...",
    noProjects: "لم يتم العثور على مشاريع في هذه الفئة.",
    allCategories: "الكل"
  }
};

function ProjectsPageContent() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Array<{ value: string; label: { en: string; ar: string } }>>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Inline debouncing for search term (same as blog page)
  const debouncedSearchTermRef = useRef<string>(searchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);

  // Track previous values to prevent unnecessary updates
  const prevValuesRef = useRef({
    search: '',
    category: 'all',
    page: 1
  });

  // Initialize prevValuesRef after component mounts
  useEffect(() => {
    prevValuesRef.current = {
      search: searchTerm,
      category: selectedCategory,
      page: currentPage
    };
  }, []);

  // Flag to prevent URL sync from overriding user input
  const isUserInputRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const pathname = window.location.pathname;

    // Extract locale from pathname
    if (pathname.startsWith('/ar')) {
      setLocale('ar');
    } else {
      setLocale('en');
    }
  }, []);

  // Sync with URL query params
  useEffect(() => {
    if (!mounted || isUserInputRef.current) return;
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    const pageFromUrl = searchParams.get('page');
    const finalCategory = categoryFromUrl || 'all';
    const finalSearch = searchFromUrl || '';
    const finalPage = pageFromUrl ? parseInt(pageFromUrl) : 1;
    
    if (finalCategory !== selectedCategory) {
      setSelectedCategory(finalCategory);
    }
    if (finalSearch !== searchTerm) {
      setSearchTerm(finalSearch);
      // Set debounced search term immediately to avoid flash
      setDebouncedSearchTerm(finalSearch);
    }
    if (finalPage !== currentPage) {
      setCurrentPage(finalPage);
    }
  }, [searchParams, mounted, selectedCategory, searchTerm, currentPage]);

  // Load projects and categories from API
  useEffect(() => {
    if (!mounted) return;
    const loadData = async () => {
      try {
        const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
        // Fetch projects
        const projectsResponse = await fetch(`${baseUrl}/projects/?page=1&limit=1000`);
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData = await projectsResponse.json();
        // Handle paginated response - get all projects
        let allProjects = projectsData.results || projectsData || [];

        // If backend has pagination and we didn't get all projects, fetch remaining pages
        if (projectsData.next && projectsData.count > allProjects.length) {
          let currentPage = 2;
          let currentResult = projectsData;

          while (currentResult.next) {
            const nextPageUrl = currentResult.next;
            const pageResponse = await fetch(nextPageUrl);

            if (pageResponse.ok) {
              const pageResult = await pageResponse.json();
              const pageProjects = pageResult.results || pageResult.data || pageResult;
              allProjects = [...allProjects, ...pageProjects];
              currentResult = pageResult;
            } else {
              break;
            }
            currentPage++;
          }
        }

        setProjects(allProjects);

        // Fetch categories
        const categoriesResponse = await fetch(`${baseUrl}/categories/?type=project`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const categoriesArray = categoriesData.results || categoriesData || [];

          // Ensure projectsData is an array
          const projectsArray = Array.isArray(projectsData) ? projectsData : (projectsData.results || projectsData.data || []);

          // Filter categories to only include those that have actual projects
          const categoriesWithProjects = categoriesArray.filter((category: any) => {
            return allProjects.some((project: any) => 
              project.category?.id === category.id || 
              project.category?.slug === category.slug
            );
          });

          // Transform categories for the component
          const transformedCategories = [
            { value: 'all', label: { en: 'All', ar: 'الكل' } },
            ...categoriesWithProjects.map((cat: any) => ({
              value: cat.slug,
              label: { en: cat.name_en, ar: cat.name_ar }
            }))
          ];
          setCategories(transformedCategories);
        }

      } catch (error) {
        console.error('Error loading data:', error);
        setError(locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [mounted]);

  // Debounce search term effect (same as blog page)
  useEffect(() => {
    debouncedSearchTermRef.current = searchTerm;

    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Update URL when search term or category changes (debounced)
  useEffect(() => {
    if (!mounted) return;
    const searchChanged = prevValuesRef.current.search !== debouncedSearchTerm.trim();
    const categoryChanged = prevValuesRef.current.category !== selectedCategory;
    const pageChanged = prevValuesRef.current.page !== currentPage;

    if (!searchChanged && !categoryChanged && !pageChanged) return;

    isUserInputRef.current = true;

    prevValuesRef.current = {
      search: debouncedSearchTerm.trim(),
      category: selectedCategory,
      page: currentPage
    };

    const params = new URLSearchParams();

    if (debouncedSearchTerm.trim()) {
      params.set('search', debouncedSearchTerm);
    }

    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    const newUrl = `/${locale}/projects${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl, { scroll: false });

    setTimeout(() => {
      isUserInputRef.current = false;
    }, 100);
  }, [debouncedSearchTerm, selectedCategory, currentPage, locale, mounted, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-light to-white flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  const t = translations[locale as keyof typeof translations];

  // Helper function to get category colors (dynamic hash-based like blog page)
  const getCategoryColors = (categoryValue: string) => {
    // Dynamic color assignment based on category name hash (same as blog page)
    const colorOptions = [
      {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100 hover:border-blue-300'
      },
      {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100 hover:border-orange-300'
      },
      {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100 hover:border-purple-300'
      },
      {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        hover: 'hover:bg-green-100 hover:border-green-300'
      },
      {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        hover: 'hover:bg-red-100 hover:border-red-300'
      }
    ];

    if (categoryValue === 'all') {
      return {
        bg: 'bg-primary-light',
        text: 'text-primary',
        border: 'border-primary/50',
        hover: 'hover:bg-primary-light hover:border-primary'
      };
    }

    // Use a simple hash to assign consistent colors (same algorithm as blog page)
    let hash = 0;
    for (let i = 0; i < categoryValue.length; i++) {
      hash = categoryValue.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colorOptions.length;
    return colorOptions[colorIndex];
  };

  // Helper functions
  const getLocalizedText = (text: { en: string; ar: string } | string) => {
    if (typeof text === 'string') return text;
    return text[locale as keyof typeof text] || text.en;
  };

  const getCategoryDisplayName = (categoryValue: string) => {
    const category = categories.find((cat: { value: string; label: { en: string; ar: string } }) => cat.value === categoryValue);
    if (category) {
      return getLocalizedText(category.label);
    }
    return categoryValue;
  };

  // Apply filters - search works across all projects, category filters work on results (same as blog page)
  let filteredProjects = projects;
  // Apply search filter using debounced value (500ms delay) - works across ALL projects
  if (debouncedSearchTerm.trim()) {
    const searchLower = debouncedSearchTerm.toLowerCase();
    filteredProjects = filteredProjects.filter(project => {
      const title = locale === 'ar' ? project.title_ar : project.title_en;
      const location = locale === 'ar' ? project.location_ar : project.location_en;
      const categoryName = locale === 'ar' ? project.category?.name_ar : project.category?.name_en;

      return title.toLowerCase().includes(searchLower) ||
             location.toLowerCase().includes(searchLower) ||
             categoryName?.toLowerCase().includes(searchLower) ||
             project.client.toLowerCase().includes(searchLower);
    });
  } else {
    // Only apply category filter when NOT searching
    if (selectedCategory !== 'all') {
      filteredProjects = filteredProjects.filter(project => 
        project.category?.slug === selectedCategory || 
        project.category?.id === Number(selectedCategory)
      );
    }
  }

  // Calculate pagination (6 projects per page like blog)
  const PROJECTS_PER_PAGE = 6;
  const totalFilteredProjects = filteredProjects.length;
  const calculatedTotalPages = Math.ceil(totalFilteredProjects / PROJECTS_PER_PAGE);

  // Update totalPages when filters change
  if (calculatedTotalPages !== totalPages) {
    setTotalPages(calculatedTotalPages);
  }

  // Reset to page 1 if current page is beyond the new total pages
  if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
    setCurrentPage(1);
  }

  // Get paginated projects
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const formatNumber = (number: number | string) => {
    // Always return English numbers regardless of locale
    return String(number);
  };

  const handleViewAllProjects = () => {
    // Clear search first
    handleSearchChange('');
    // Then change category to all
    setSelectedCategory('all');
    // Reset to page 1
    setCurrentPage(1);

    // Update URL to remove both search and category params
    const params = new URLSearchParams();
    const newUrl = `/${locale}/projects`;
    router.push(newUrl, { scroll: false });
  };

  const handleCategoryChange = (category: string) => {
    isUserInputRef.current = true;
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when category changes
    setTimeout(() => {
      isUserInputRef.current = false;
    }, 100);
  };

  const handleSearchChange = (search: string) => {
    isUserInputRef.current = true;
    setSearchTerm(search);
    setCurrentPage(1); // Reset to page 1 when search changes
    
    // When searching, switch to 'all' category to show global search behavior
    if (search.trim()) {
      setSelectedCategory('all');
    }
    
    setTimeout(() => {
      isUserInputRef.current = false;
    }, 100);
  };

  const handlePageChange = (page: number) => {
    isUserInputRef.current = true;
    setCurrentPage(page);
    setTimeout(() => {
      isUserInputRef.current = false;
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-white pt-32">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-bg-light via-white to-primary-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-main leading-tight mb-6">
              <span className="bg-gradient-to-br from-text-main via-text-main to-text-main bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted leading-relaxed font-medium">
              {t.description}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      {!dataLoading && (
      <div className="bg-white/60 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <div className={`absolute inset-y-0 ${locale === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`block w-full ${locale === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-muted focus:outline-none focus:placeholder-muted focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base ${locale === 'ar' ? 'text-right' : 'text-left'}`}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                >
                  <svg className="h-5 w-5 text-muted hover:text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-sm font-semibold text-main uppercase tracking-wide">
              {locale === 'ar' ? 'تصفية حسب الفئة' : 'Filter by category'}
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category: { value: string; label: { en: string; ar: string } }) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                    selectedCategory === category.value
                      ? 'bg-primary text-white border-primary shadow-lg transform scale-105'
                      : 'bg-white text-neutral-700 border-gray-200 hover:bg-primary-light hover:border-primary hover:shadow-sm'
                  }`}
                >
                  {getLocalizedText(category.label)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {dataLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : paginatedProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {paginatedProjects.map((project: Project) => (
              <Link 
                key={project.id} 
                href={`/${locale}/projects/${project.slug}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2 block"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={project.image?.url || '/images/default-project.jpg'} 
                    alt={locale === 'ar' ? project.image?.alt_ar || project.title_ar : project.image?.alt_en || project.title_en}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {/* Hover overlay content */}
                  <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 ${getCategoryColors(project.category?.slug || '').text.replace('text-', 'bg-').replace('700', '500')} rounded-full animate-pulse`}></div>
                        <span className="text-sm font-medium uppercase tracking-wide">
                          {locale === 'ar' ? project.category?.name_ar : project.category?.name_en}
                        </span>
                      </div>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {locale === 'ar' ? `مشروع لصالح ${project.client} في ${project.location_ar}` : `Project for ${project.client} in ${project.location_en}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColors(project.category?.slug || '').bg} ${getCategoryColors(project.category?.slug || '').text} ${getCategoryColors(project.category?.slug || '').border} transition-all duration-300 group-hover:scale-105 ${getCategoryColors(project.category?.slug || '').hover}`}>
                      {locale === 'ar' ? project.category?.name_ar : project.category?.name_en}
                    </span>
                    <span className="text-sm text-muted transition-colors duration-300 group-hover:text-main">
                      {formatNumber(new Date(project.created_at).getFullYear())}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-main leading-tight transition-all duration-300 group-hover:text-primary group-hover:scale-105">
                    {locale === 'ar' ? project.title_ar : project.title_en}
                  </h3>
                  
                  <p className="text-muted leading-relaxed text-sm line-clamp-2 transition-all duration-300 group-hover:text-main">
                    {locale === 'ar' ? `مشروع لصالح ${project.client} في ${project.location_ar}` : `Project for ${project.client} in ${project.location_en}`}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-sm text-muted transition-all duration-300 group-hover:text-primary">
                      <svg className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {locale === 'ar' ? project.location_ar : project.location_en}
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {locale === 'ar' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                locale={locale}
              />
            </div>
          )}
          </>
        ) : (
          <EmptyState
            title={locale === 'ar' ? 'لا توجد مشاريع' : 'No projects available'}
            description={locale === 'ar' ? 'لم يتم العثور على مشاريع في هذه الفئة. جرب تحديد فئة مختلفة.' : 'No projects found for this category. Try selecting a different category.'}
            actionText={locale === 'ar' ? 'عرض جميع المشاريع' : 'View All Projects'}
            onAction={() => handleViewAllProjects()}
            icon="🏗️"
          />
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}
