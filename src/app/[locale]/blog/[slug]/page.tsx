import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { blogService } from '../../../../services/content/blog.service';
import BlogPostHero from '../../../../../components/blog/BlogPostHero';
import EditorRenderer from '../../../../../components/editor/SimpleEditorRenderer';
import RelatedPosts from '../../../../../components/blog/RelatedPosts';
import ShareButtons from '../../../../../components/blog/ShareButtons';
import Link from 'next/link';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Safety check: don't make API calls if slug is undefined
  if (!slug) {
    return {
      title: 'Article Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
  
  // Get blog post using public service
  const post = await blogService.getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const title = locale === 'ar' ? (post as any).title_ar || (post as any).title?.ar || '' : (post as any).title_en || (post as any).title?.en || '';
  const description = locale === 'ar' ? (post as any).excerpt_ar || (post as any).excerpt?.ar || '' : (post as any).excerpt_en || (post as any).excerpt?.en || '';
  const coverImage = post.cover_image?.url || '';

  // Get SEO fields - prioritize user's custom SEO over default content
  const seoTitle = (post as any).seo?.og_title || (post as any).seo?.social_title || title;
  const seoDescription = (post as any).seo?.og_description || (post as any).seo?.social_description || (post as any).seo?.meta_description || description;

  return {
    title,        // ? Use content title for tab title
    description,
    openGraph: {
      title: seoTitle,  // ? Use SEO title for social sharing
      description: seoDescription,
      images: coverImage ? [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,  // ? Use SEO title for social sharing
      description: seoDescription,
      images: [coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  
  // Validate locale
  if (!['en', 'ar'].includes(locale)) {
    notFound();
  }
  
  // Get blog post using public service
  const post = await blogService.getPublishedPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            {locale === 'en' ? 'Article Not Found' : 'المقال غير موجود'}
          </h1>
          <p className="text-neutral-600 mb-8">
            {locale === 'en' 
              ? 'The requested blog post could not be found.' 
              : 'المقال المطلوب غير موجود'}
          </p>
          <Link 
            href={`/${locale}/blog`}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {locale === 'en' ? 'Back to Blog' : 'العودة إلى المدونة'}
          </Link>
        </div>
      </div>
    );
  }

  // Fetch author information if author_id exists
  let authorData = null;
  if (post.author_id) {
    try {
      const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
      const authorResponse = await fetch(`${baseUrl}/authors/${post.author_id}/`);
      if (authorResponse.ok) {
        authorData = await authorResponse.json();
      }
    } catch (error) {
      console.error('Failed to fetch author data:', error);
    }
  }

  // Get content from post
  const content = post.content;
  
  // Get localized content blocks - handle both localized and direct structures
  let contentBlocks: any[] = [];
  if (content && typeof content === 'object') {
    if ('en' in content || 'ar' in content) {
      // Localized content structure: {en: {...}, ar: {...}}
      const localizedContent = (content as any)[locale as 'en' | 'ar'] || (content as any).en || {};
      contentBlocks = localizedContent?.blocks || [];
    } else {
      // Direct content structure: {time: ..., blocks: [...], version: ...}
      contentBlocks = (content as any)?.blocks || [];
    }
  }

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

  // Get related posts using public service
  const relatedPosts = await blogService.getPublishedRelatedPosts(post.category?.id || 0, post.id, 3);

  const isRTL = locale === 'ar';
  const title = locale === 'ar' ? (post as any).title_ar || (post as any).title?.ar || '' : (post as any).title_en || (post as any).title?.en || '';
  const excerpt = locale === 'ar' ? (post as any).excerpt_ar || (post as any).excerpt?.ar || '' : (post as any).excerpt_en || (post as any).excerpt?.en || '';

  // Transform post data to match component expectations
  const transformedPost = {
    id: post.id.toString(),
    slug: post.slug,
    title: {
      en: (post as any).title_en || (post as any).title?.en || '',
      ar: (post as any).title_ar || (post as any).title?.ar || ''
    },
    excerpt: {
      en: (post as any).excerpt_en || (post as any).excerpt?.en || '',
      ar: (post as any).excerpt_ar || (post as any).excerpt?.ar || ''
    },
    description: {
      en: content,
      ar: content
    },
    coverImage: post.cover_image?.url || '',
    coverImageAlt: {
      en: (post as any).cover_image?.alt_en || (post as any).title_en || (post as any).title?.en || '',
      ar: (post as any).cover_image?.alt_ar || (post as any).title_ar || (post as any).title?.ar || ''
    },
    category: post.category?.name || { en: '', ar: '' },
    author: post.author ? {
      name: post.author.name,
      avatar: post.author.avatar || ''
    } : { name: '', avatar: '' },
    publishedAt: post.published_at || '',
    readingTime: post.reading_time,
    tags: (post as any).tags?.[locale as 'en' | 'ar'] || (post as any).tags_en || [],
    // Add missing required properties
    content: post.content,
    is_featured: post.is_featured || false,
    status: post.status || 'published'
  };

  // Transform related posts to match component expectations
  const transformedRelatedPosts = await Promise.all(relatedPosts.map(async (relatedPost) => {
    // Fetch the actual image URL from the API endpoint
    let actualImageUrl = '';
    if (relatedPost.cover_image?.url) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
        const fullImageUrl = relatedPost.cover_image.url.startsWith('http') 
          ? relatedPost.cover_image.url 
          : `${baseUrl}${relatedPost.cover_image.url}`;
        const response = await fetch(fullImageUrl);
        const imageData = await response.json();
        actualImageUrl = imageData.url || '';
      } catch (error) {
        console.error('Error fetching image URL for post', relatedPost.id, ':', error);
        actualImageUrl = relatedPost.cover_image.url || '';
      }
    }

    return {
      id: relatedPost.id.toString(),
      slug: relatedPost.slug,
      title: {
        en: (relatedPost as any).title_en || (relatedPost as any).title?.en || '',
        ar: (relatedPost as any).title_ar || (relatedPost as any).title?.ar || ''
      },
      excerpt: {
        en: (relatedPost as any).excerpt_en || (relatedPost as any).excerpt?.en || '',
        ar: (relatedPost as any).excerpt_ar || (relatedPost as any).excerpt?.ar || ''
      },
      description: {
        en: '',
        ar: ''
      },
      coverImage: actualImageUrl,
      category: relatedPost.category?.name || { en: '', ar: '' },
      author: relatedPost.author ? {
        name: relatedPost.author.name,
        avatar: relatedPost.author.avatar || ''
      } : { name: '', avatar: '' },
      publishedAt: relatedPost.published_at || '',
      readingTime: relatedPost.reading_time || 5,
      tags: (relatedPost as any).tags?.[locale as 'en' | 'ar'] || (relatedPost as any).tags_en || []
    };
  }));

  const currentCategory = getLocalizedValue(post.category?.name || { en: '', ar: '' }, locale);

  return (
  <>
    <article className={`min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <BlogPostHero
        post={transformedPost}
        locale={locale as 'en' | 'ar'}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Article Metadata */}
        <div className="mb-8 md:mb-16 pb-8 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            {/* Author Info */}
            <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              {authorData?.image?.url ? (
                <img
                  src={authorData.image.url}
                  alt={authorData[`name_${locale}`] || authorData.name_en}
                  className="w-14 h-14 rounded-full object-cover ring-3 ring-primary/10 shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-3 ring-primary/10 shadow-lg">
                  <span className="text-primary font-bold text-lg">
                    {(authorData?.[`name_${locale}`] || authorData?.name_en || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {authorData?.[`name_${locale}`] || authorData?.name_en || 'Super Arc Group'}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    numberingSystem: 'latn'
                  }) : ''}
                </p>
              </div>
            </div>
            
            {/* Reading Time & Category */}
            <div className="flex items-center space-x-8 space-x-reverse text-sm text-gray-600">
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-medium ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>{post.reading_time || 5} {locale === 'ar' ? 'دقائق قراءة' : 'min read'}</span>
              </div>
              {post.category && (
                <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className={`font-medium text-primary ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>{getLocalizedValue(post.category.name, locale)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tags */}
          {(post as any).tags?.[locale as 'en' | 'ar'] && (post as any).tags[locale as 'en' | 'ar'].length > 0 && (
            <div className="flex flex-wrap gap-3">
              {((post as any).tags[locale as 'en' | 'ar'] || (post as any).tags_en || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary/5 to-primary/10 text-primary hover:from-primary/10 hover:to-primary/20 transition-all duration-200 border border-primary/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Article Content */}
        <div className="prose prose-lg prose-primary max-w-none">
          <EditorRenderer 
            blocks={contentBlocks}
            locale={locale as 'en' | 'ar'}
          />
        </div>
        
        {/* Share Section */}
        <div className="bg-gradient-to-r from-primary/5 via-white to-primary/5 rounded-2xl p-8 shadow-sm border border-primary/10 mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {locale === 'ar' ? 'شارك المقال' : 'Share this article'}
              </h3>
              <p className="text-gray-600 font-medium">
                {locale === 'ar' ? 'إذا وجدت هذا المقال مفيداً، شاركه مع الآخرين' : 'If you found this article helpful, share it with others'}
              </p>
            </div>
            <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <ShareButtons 
                title={title}
                slug={slug}
                locale={locale as 'en' | 'ar'}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
    
    {/* Related Posts - Full Width Section */}
    {transformedRelatedPosts.length > 0 && (
      <RelatedPosts 
        posts={transformedRelatedPosts} 
        locale={locale as 'en' | 'ar'} 
        currentPostCategory={currentCategory}
      />
    )}
  </>
);
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    // Fetch all published blog posts from API
    const posts = await blogService.getPublishedPosts();
    
    // Generate params for both English and Arabic versions
    const params: { slug: string; locale: string }[] = [];
    posts.forEach(post => {
      // Add English version
      params.push({ 
        slug: post.slug, 
        locale: 'en' 
      });
      
      // Add Arabic version
      params.push({ 
        slug: post.slug, 
        locale: 'ar' 
      });
    });
    
    return params;
  } catch (error) {
    console.error('Error generating static params for blog posts:', error);
    // Return empty array to fallback to dynamic generation
    return [];
  }
}
