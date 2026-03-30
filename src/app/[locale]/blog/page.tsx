'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { blogService, type BlogPost } from '../../../services/content/blog.service';
import LoadingSpinner from '../../../../components/ui/admin/LoadingSpinner';
import EmptyState from '../../../../components/ui/admin/EmptyState';
import Alert from '../../../../components/ui/admin/Alert';
import Pagination from '../../../../components/ui/public/Pagination';

const translations = {
  en: {
    title: "Our Blog",
    description: "Latest insights, news, and technical perspectives from our team.",
    searchPlaceholder: "Search articles...",
    noPosts: "No articles found for this category.",
    readTime: "min read"
  },
  ar: {
    title: "مدونتنا",
    description: "أحدث الرؤى والأخبار والوجهات التقنية من فريقنا.",
    searchPlaceholder: "ابحث في المقالات...",
    noPosts: "لم يتم العثور على مقالات لهذه الفئة.",
    readTime: "دقيقة قراءة"
  }
};

function BlogPageContent() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Array<{ value: string; label: { en: string; ar: string } }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0
  });
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Inline debouncing for search term
  const debouncedSearchTermRef = useRef<string>(searchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);
  
  // Track previous values to prevent unnecessary updates
  const prevValuesRef = useRef({
    search: '',
    category: 'all'
  });
  
  // Track if this is initial load to prevent URL updates during sync
  const isInitialLoadRef = useRef(true);
  
  // Initialize prevValuesRef after component mounts
  useEffect(() => {
    prevValuesRef.current = {
      search: searchTerm,
      category: selectedCategory
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
    const finalCategory = categoryFromUrl || 'all';
    const finalSearch = searchFromUrl || '';
    
    // Check if either value needs to change
    const categoryChanged = finalCategory !== selectedCategory;
    const searchChanged = finalSearch !== searchTerm;
    
    if (categoryChanged || searchChanged) {
      // Set both values atomically to prevent flashing
      setSelectedCategory(finalCategory);
      setSearchTerm(finalSearch);
      setDebouncedSearchTerm(finalSearch); // Set immediately, no debounce delay
      setCurrentPage(1); // Reset to page 1 when URL params change
      
      // Update previous values to prevent URL update on next effect
      prevValuesRef.current = {
        search: finalSearch,
        category: finalCategory
      };
    }
    
    // Mark initial load as complete after first sync
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [searchParams, mounted, selectedCategory, searchTerm]);

  // Load blog posts and categories
  useEffect(() => {
    if (!mounted || isInitialLoadRef.current) return; // Don't load during initial sync
    
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use paginated method to fetch posts with category and search filters
        const result = await blogService.getPosts(currentPage, 6, selectedCategory, debouncedSearchTerm);
        setPosts(result.posts);
        setPagination(result.pagination);
        
        // Extract categories from posts only on first load
        if (categories.length <= 1) {
          // Load all posts once to get all categories
          const allPostsResult = await blogService.getPosts(1, 1000, 'all');
          const categoryMap = new Map<string, { en: string; ar: string }>();
          categoryMap.set("all", { en: "All", ar: "الكل" });
          
          allPostsResult.posts.forEach(post => {
            if (post.category) {
              const categoryValue = String(post.category?.name?.en || 
                                       (typeof post.category?.name === 'string' ? post.category?.name : post.category?.name?.en) || 
                                       post.category?.slug || 
                                       post.category?.id || '');
              
              const getCategoryName = (name: any) => {
                if (typeof name === 'string') return name;
                if (name && typeof name === 'object' && 'en' in name && 'ar' in name) return name;
                return { en: '', ar: '' };
              };
              
              const categoryLabel = getCategoryName(post.category?.name);
              
              if (!categoryMap.has(categoryValue)) {
                categoryMap.set(categoryValue, categoryLabel);
              }
            }
          });
          
          const formattedCategories = Array.from(categoryMap.entries()).map(([value, label]) => ({
            value,
            label
          }));
          
          setCategories(formattedCategories);
        }
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError(locale === 'ar' ? 'فشل تحميل المقالات' : 'Failed to load blog posts');
        // Set fallback categories on error
        setCategories([{ value: "all", label: { en: "All", ar: "الكل" } }]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [mounted, currentPage, selectedCategory, debouncedSearchTerm, isInitialLoadRef.current]);

  // Debounce search term effect
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
    
    // Only update if values actually changed from previous values
    const searchChanged = prevValuesRef.current.search !== debouncedSearchTerm.trim();
    const categoryChanged = prevValuesRef.current.category !== selectedCategory;
    
    if (!searchChanged && !categoryChanged) return;
    
    // Set flag to prevent URL sync from overriding user input
    isUserInputRef.current = true;
    
    // Update previous values
    prevValuesRef.current = {
      search: debouncedSearchTerm.trim(),
      category: selectedCategory
    };
    
    const params = new URLSearchParams();
    
    // Update search parameter with debounced value
    if (debouncedSearchTerm.trim()) {
      params.set('search', debouncedSearchTerm);
    }
    
    // Update category parameter
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    const newUrl = `/${locale}/blog${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl, { scroll: false });
    
    // Clear flag after a short delay to allow URL sync to work again
    setTimeout(() => {
      isUserInputRef.current = false;
    }, 100);
  }, [debouncedSearchTerm, selectedCategory, locale, mounted, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-light to-white flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const t = translations[locale];

  // Helper function to get localized text
  const getLocalizedText = (text: { en: string; ar: string } | string | undefined | null) => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text[locale] || text.en || text.ar || '';
    }
    return '';
  };

  // Helper function to get category colors
  const getCategoryColors = (categoryValue: string) => {
    // Dynamic color assignment based on category name hash
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

    // Use a simple hash to assign consistent colors
    let hash = 0;
    for (let i = 0; i < categoryValue.length; i++) {
      hash = categoryValue.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colorOptions.length;
    return colorOptions[colorIndex];
  };

  const getCoverImageAlt = (post: BlogPost): string => {
    // Try to get alt text from cover_image, fallback to title
    if (post.cover_image?.alt_en || post.cover_image?.alt_ar) {
      const alt = locale === 'ar' ? (post.cover_image.alt_ar || post.cover_image.alt_en) : (post.cover_image.alt_en || post.cover_image.alt_ar);
      return alt || getLocalizedText(post.title);
    }
    return getLocalizedText(post.title);
  };

  const getCategoryDisplayName = (categoryValue: string) => {
    const category = categories.find((cat: { value: string; label: { en: string; ar: string } }) => cat.value === categoryValue);
    if (category) {
      return getLocalizedText(category.label);
    }
    return categoryValue;
  };

  const handleViewAllPosts = () => {
    // Clear search first
    handleSearchChange('');
    // Then change category to all
    setSelectedCategory('all');
    setCurrentPage(1); // Reset to page 1

    // Update URL to remove both search and category params
    const params = new URLSearchParams();
    const newUrl = `/${locale}/blog`;
    router.push(newUrl, { scroll: false });
  };

  const handleCategoryChange = (category: string) => {
    isUserInputRef.current = true;
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when changing category
    setTimeout(() => {
      isUserInputRef.current = false;
    }, 100);
  };

  const handleSearchChange = (search: string) => {
    isUserInputRef.current = true;
    setSearchTerm(search);
    setCurrentPage(1); // Reset to page 1 when searching
    setTimeout(() => {
      isUserInputRef.current = false;
    }, 100);
  };

const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

// Posts are already filtered on backend (category and search)
const filteredPosts = posts;

return (
  <>
    {/* SEO Meta Tags - In production, these would be handled by next/head or metadata API */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": locale === 'ar' ? "المدونة - مجموعة سوبر آرك" : "Blog - Super Arc Group",
          "description": locale === 'ar' 
            ? "أحدث الأخبار والرؤى والمقالات الفنية من مجموعة سوبر آرك" 
            : "Latest news, insights, and technical perspectives from Super Arc Group",
          "url": `https://superarcgroup.com/${locale}/blog`,
          "inLanguage": locale,
          "publisher": {
            "@type": "Organization",
            "name": "Super Arc Group"
          }
        })
      }}
    />
    
    <div className={`min-h-screen bg-gradient-to-br from-bg-light to-white pt-32 ${locale === 'ar' ? 'rtl' : 'ltr'}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
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
      {!isLoading && (
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

          {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredPosts.map((post: BlogPost, index: number) => (
                <Link 
                  key={post.id} 
                  href={`/${locale}/blog/${post.slug}`}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2 block relative ${
                    post.is_featured 
                      ? 'ring-2 ring-primary/50 ring-offset-2 shadow-xl hover:shadow-3xl' 
                      : ''
                  }`}
                >
                  {/* Featured Badge */}
                  {post.is_featured && (
                    <div className="absolute top-0 left-0 right-0 z-10">
                      <div className="bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold px-4 py-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <span>{locale === 'ar' ? 'مميز' : 'Featured'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Image */}
                  <div className={`relative h-56 overflow-hidden ${post.is_featured ? 'mt-8' : ''}`}>
                    {post.cover_image?.url ? (
                      <Image 
                        src={post.cover_image.url} 
                        alt={getCoverImageAlt(post)}
                        fill
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 ${
                          post.is_featured ? 'group-hover:brightness-125' : ''
                        }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading={index < 3 ? "eager" : "lazy"}
                        priority={index < 3 || post.is_featured}
                        unoptimized={true}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        post.is_featured 
                          ? 'bg-gradient-to-br from-primary/20 to-primary/30' 
                          : 'bg-gradient-to-br from-primary/10 to-primary/20'
                      }`}>
                        <div className="text-center">
                          <svg className={`w-16 h-16 mx-auto mb-2 ${
                            post.is_featured ? 'text-primary/40' : 'text-primary/30'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className={`text-sm ${post.is_featured ? 'text-primary/60' : 'text-primary/50'}`}>No image</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* Category badge */}
                    <div className={`absolute top-4 ${locale === 'ar' ? 'right-4' : 'left-4'}`}>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        post.is_featured 
                          ? 'bg-white/95 text-primary border border-primary/30' 
                          : `bg-white/90 ${getCategoryColors(String(post.category?.name?.en || post.category?.name || post.category?.slug || post.category?.id || '')).text}`
                      }`}>
                        {getCategoryDisplayName(String(post.category?.name?.en || post.category?.name || post.category?.slug || post.category?.id || ''))}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-6 space-y-4 ${post.is_featured ? 'bg-gradient-to-b from-primary/5 to-white' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${post.is_featured ? 'text-primary font-medium' : 'text-muted'}`}>
                        {new Date(post.published_at || post.created_at || '').toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          numberingSystem: 'latn'
                        })}
                      </span>
                    </div>

                    <h3 className={`text-xl leading-tight transition-all duration-300 group-hover:scale-105 ${
                      post.is_featured 
                        ? 'text-primary font-bold' 
                        : 'font-semibold text-main group-hover:text-primary'
                    }`}>
                      {getLocalizedText(post.title)}
                    </h3>
                    
                    <p className={`leading-relaxed line-clamp-3 transition-all duration-300 ${
                      post.is_featured 
                        ? 'text-main font-medium' 
                        : 'text-muted group-hover:text-main'
                    }`}>
                      {getLocalizedText(post.excerpt)}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className={`flex items-center text-sm ${
                        post.is_featured ? 'text-primary font-medium' : 'text-muted'
                      }`}>
                        <svg className={`w-4 h-4 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.reading_time} {t.readTime}
                      </div>
                      
                      {/* Arrow indicator */}
                      <div className={`transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ${
                        post.is_featured ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <svg className={`w-5 h-5 ${post.is_featured ? 'text-primary' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={locale === 'ar' ? "M7 8l-4 4m0 0l4 4m-4-4h21" : "M17 8l4 4m0 0l-4 4m4-4H3"} />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title={locale === 'ar' ? 'لا توجد مقالات' : 'No blog posts yet'}
              description={locale === 'ar' ? 'لم يتم نشر أي مقالات حتى الآن' : 'No blog posts have been published yet'}
              actionText={locale === 'ar' ? 'عرض جميع المقالات' : 'View All Posts'}
              onAction={() => handleViewAllPosts()}
              icon="📝"
            />
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                locale={locale}
                showPrevNext={true}
                maxVisiblePages={5}
              />
            </div>
          )}
        </div>
      </div>
      
    </>

  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}>
      <BlogPageContent />
    </Suspense>
  );
}