'use client';

import { useState, useEffect, use } from 'react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

interface Category {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  type: string;
}

interface ClientImage {
  id: number;
  url: string;
  alt_en: string;
  alt_ar: string;
}

interface ClientCategory {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  type: string;
}

interface Client {
  id: number;
  name_en: string;
  name_ar: string;
  image?: ClientImage | null;
  category?: ClientCategory;
}

interface ClientsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

function ClientsPageContent({ locale }: { locale: string }) {
  const { isVisible, setElement } = useScrollAnimation(0.1);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        
        // Fetch clients
        const clientsResponse = await fetch(`${API_BASE_URL}/clients/`);
        if (!clientsResponse.ok) throw new Error('Failed to fetch clients');
        const clientsData = await clientsResponse.json();
        const clientsArray = clientsData.results || clientsData.data || clientsData;
        setClients(clientsArray);
        
        // Fetch categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories/`);
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        const categoriesArray = categoriesData.results || categoriesData.data || categoriesData;
        
        // Filter categories to only include those with clients
        const clientCategoryIds = new Set(clientsArray.map((c: Client) => c.category?.id).filter(Boolean));
        const filteredCategories = categoriesArray.filter((cat: Category) => 
          cat.type === 'client' && clientCategoryIds.has(cat.id)
        );
        setCategories(filteredCategories);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter clients by selected category
  const filteredClients = selectedCategory === 'all' || selectedCategory === ''
    ? clients
    : clients.filter(client => client.category?.id.toString() === selectedCategory);

  // Helper to get localized category name
  const getCategoryDisplayName = (categoryId: string) => {
    if (categoryId === 'all' || categoryId === '') {
      return locale === 'ar' ? 'الكل' : 'All';
    }
    const category = categories.find(c => c.id.toString() === categoryId);
    return category ? (locale === 'ar' ? category.name_ar : category.name_en) : categoryId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-white pt-32">
      <div ref={setElement} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-32">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 border-[1px] rounded-full px-4 py-2 backdrop-blur-[16px] mb-6" style={{ borderColor: '#fff3', backgroundColor: '#ffffff1a', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease-out' }}>
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">
              {locale === 'ar' ? 'عملاؤنا' : 'Our Clients'}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-main leading-tight mb-6 relative" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease-out 0.2s' }}>
            <span className="bg-gradient-to-br from-text-main via-text-main to-text-main bg-clip-text text-transparent">
              {locale === 'ar' ? 'موثوق بنا من قبل رواد الصناعة' : 'Trusted by Industry Leaders'}
            </span>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-secondary rounded-full"></div>
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted leading-relaxed font-medium" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease-out 0.4s' }}>
            {locale === 'ar' 
              ? 'لقد نجحنا في تسليم مشاريع لجهات حكومية ومطورين رائدين وشركات هندسية عالمية عبر المنطقة'
              : 'We have successfully delivered projects for government entities, leading developers, and global engineering firms across the region.'
            }
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-col items-center gap-4 mb-8" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease-out 0.5s' }}>
            <h2 className="text-sm font-semibold text-main uppercase tracking-wide">
              {locale === 'ar' ? 'تصفية حسب الفئة' : 'Filter by category'}
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                  selectedCategory === 'all' || selectedCategory === ''
                    ? 'bg-primary text-white border-primary shadow-lg transform scale-105'
                    : 'bg-white text-neutral-700 border-gray-200 hover:bg-primary-light hover:border-primary hover:shadow-sm'
                }`}
              >
                {locale === 'ar' ? 'الكل' : 'All'}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                    selectedCategory === category.id.toString()
                      ? 'bg-primary text-white border-primary shadow-lg transform scale-105'
                      : 'bg-white text-neutral-700 border-gray-200 hover:bg-primary-light hover:border-primary hover:shadow-sm'
                  }`}
                >
                  {locale === 'ar' ? category.name_ar : category.name_en}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clients Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-8 lg:gap-10" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease-out 0.6s' }}>
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex items-center justify-center aspect-square border border-gray-100 hover:border-primary/30 hover:scale-105"
              >
                <div className="w-full h-full flex items-center justify-center">
                  {/* Client Name on Hover */}
                  <div className="text-gray-600 text-sm font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center p-2">
                    {locale === 'ar' ? client.name_ar : client.name_en}
                  </div>
                  {/* Client Logo */}
                  {client.image?.url ? (
                    <img
                      src={client.image.url}
                      alt={locale === 'ar' ? client.image.alt_ar : client.image.alt_en}
                      className="max-w-full max-h-full object-contain opacity-100 group-hover:opacity-10 transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center opacity-100 group-hover:opacity-10 transition-opacity duration-300">
                      <span className="text-2xl font-bold text-gray-400">
                        {(locale === 'ar' ? client.name_ar : client.name_en).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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

export default function ClientsPage({ params }: ClientsPageProps) {
  const { locale } = use(params);
  return <ClientsPageContent locale={locale} />;
}
