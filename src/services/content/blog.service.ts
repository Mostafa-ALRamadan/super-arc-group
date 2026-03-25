import { fetchWithTokenRefresh, handleAuthError } from '../auth/auth-fetch';

export interface BlogPost {
  id: number;
  title: {
    en: string;
    ar: string;
  };
  slug: string;
  excerpt: {
    en: string;
    ar: string;
  };
  content: string;
  cover_image?: {
    id: number;
    url: string;
    alt_en?: string;
    alt_ar?: string;
  };
  cover_image_id?: number | null;
  category?: {
    id: number;
    name: {
      en: string;
      ar: string;
    };
    slug: string;
  };
  category_id?: number;
  author?: {
    id: number;
    name: string;
    avatar?: string;
  };
  author_id?: number;
  published_at?: string;
  reading_time?: number;
  tags: {
    en: string[];
    ar: string[];
  };
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface BlogFormData {
  title_en: string;
  title_ar: string;
  slug: string;
  excerpt_en: string;
  excerpt_ar: string;
  content: string;
  category_id: number;
  author_id: number;
  cover_image_id?: number;
  tags_en: string[];
  tags_ar: string[];
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export class BlogService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/blogs`;
  }

  /**
   * Get all blog posts (for admin - includes drafts and archived)
   */
  async getAllPosts(page: number = 1, limit: number = 1000, category?: string, search?: string): Promise<{
    posts: BlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Try authenticated endpoint first
      try {
        // Always fetch all posts for client-side pagination consistency
        let url = `${this.baseUrl}?page=1&limit=1000`;
        if (category && category !== 'all') {
          url += `&category=${encodeURIComponent(category)}`;
        }
        if (search && search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        const response = await fetchWithTokenRefresh(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        
        const result = await response.json();
        
        // Handle paginated response format
        let posts = result.results || result.data || result;
        
        // If backend has pagination and we didn't get all posts, fetch remaining pages
        if (result.next && (result.count > posts.length)) {
          let currentPage = 2;
          let currentResult = result;
          while (currentResult.next) {
            const nextPageUrl = currentResult.next;
            
            const pageResponse = await fetchWithTokenRefresh(nextPageUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (pageResponse.ok) {
              const pageResult = await pageResponse.json();
              const pagePosts = pageResult.results || pageResult.data || pageResult;
              posts = [...posts, ...pagePosts];
              currentResult = pageResult; // Update currentResult for next iteration
            } else {
              break;
            }
            currentPage++;
          }
        }
        
        // Transform the data to match our BlogPost interface
        const transformedPosts = posts.map((post: any) => {
          return {
            id: post.id,
            title: {
              en: post.title_en,
              ar: post.title_ar
            },
            slug: post.slug,
            excerpt: {
              en: post.excerpt_en,
              ar: post.excerpt_ar
            },
            content: post.content,
            cover_image: post.cover_image ? {
              id: post.cover_image.id,
              url: post.cover_image.url,
              alt_en: post.cover_image.alt_en,
              alt_ar: post.cover_image.alt_ar
            } : undefined,
            cover_image_id: post.cover_image?.id || post.cover_image_id || null,
            category: post.category ? {
              id: post.category.id,
              name: {
                en: post.category.name_en,
                ar: post.category.name_ar
              },
              slug: post.category.slug
            } : undefined,
            category_id: post.category?.id || post.category_id,
            author: post.author ? {
              id: post.author.id,
              name: post.author.name,
              avatar: post.author.avatar
            } : undefined,
            author_id: post.author?.id || post.author_id,
            published_at: post.published_at,
            reading_time: post.reading_time,
            tags: {
              en: post.tags_en || [],
              ar: post.tags_ar || []
            },
            is_featured: post.is_featured || false,
            status: post.status || 'draft',
            seo: post.seo,
            created_at: post.created_at,
            updated_at: post.updated_at
          };
        });
        
        // Sort posts: featured posts first, then by date
        transformedPosts.sort((a: BlogPost, b: BlogPost) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          const dateA = new Date(a.published_at || a.created_at || '').getTime();
          const dateB = new Date(b.published_at || b.created_at || '').getTime();
          return dateB - dateA;
        });
        
        // For admin use case (large limit), return all posts without pagination
        if (limit >= 1000) {
          return {
            posts: transformedPosts,
            pagination: {
              page: 1,
              limit: transformedPosts.length,
              total: transformedPosts.length,
              totalPages: 1
            }
          };
        }
        
        // Client-side pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = transformedPosts.slice(startIndex, endIndex);
        
        return {
          posts: paginatedPosts,
          pagination: {
            page,
            limit,
            total: transformedPosts.length,
            totalPages: Math.ceil(transformedPosts.length / limit)
          }
        };
      } catch (authError) {
        // If authentication fails, fall back to public endpoint
        // This handles cases where user is not logged in or token is invalid
        
        // Fallback to public endpoint
        const allPosts = await this.getPublishedPosts();
        
        // Apply category filter if specified
        let filteredPosts = allPosts;
        if (category && category !== 'all') {
          filteredPosts = allPosts.filter((post: any) => {
            const postCategoryValue = String(post.category?.name?.en || 
                                     post.category?.name || 
                                     post.category?.slug || 
                                     post.category?.id || '');
            return postCategoryValue === category || 
                   postCategoryValue.toLowerCase() === category.toLowerCase();
          });
        }
        
        // Apply search filter if specified
        if (search && search.trim()) {
          const searchLower = search.toLowerCase();
          filteredPosts = filteredPosts.filter(post => {
            const title = (typeof post.title === 'string' ? post.title : post.title?.en || post.title?.ar || '').toLowerCase();
            const excerpt = (typeof post.excerpt === 'string' ? post.excerpt : post.excerpt?.en || post.excerpt?.ar || '').toLowerCase();
            const category = String(post.category?.name?.en || post.category?.name || '').toLowerCase();
            
            return title.includes(searchLower) ||
                   excerpt.includes(searchLower) ||
                   category.includes(searchLower);
          });
        }
        
        // Sort posts: featured posts first, then by date
        filteredPosts.sort((a: BlogPost, b: BlogPost) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          const dateA = new Date(a.published_at || a.created_at || '').getTime();
          const dateB = new Date(b.published_at || b.created_at || '').getTime();
          return dateB - dateA;
        });
        
        // Client-side pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
        
        return {
          posts: paginatedPosts,
          pagination: {
            page,
            limit,
            total: filteredPosts.length,
            totalPages: Math.ceil(filteredPosts.length / limit)
          }
        };
      }
    } catch (error: any) {
      console.error('Error fetching all blog posts:', error);
      throw error;
    }
  }

  /**
   * Get blog posts with pagination (public access)
   */
  async getPosts(page: number = 1, limit: number = 6, category?: string, search?: string): Promise<{
    posts: BlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // For public blog, use public endpoint directly (no authentication needed)
      const allPosts = await this.getPublishedPosts();
      
      // Start with all posts
      let filteredPosts = allPosts;
      
      // Apply search filter first (global search across all posts)
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredPosts = allPosts.filter((post: any) => {
          const title = (typeof post.title === 'string' ? post.title : post.title?.en || post.title?.ar || '').toLowerCase();
          const excerpt = (typeof post.excerpt === 'string' ? post.excerpt : post.excerpt?.en || post.excerpt?.ar || '').toLowerCase();
          const category = String(post.category?.name?.en || post.category?.name || '').toLowerCase();
          
          return title.includes(searchLower) ||
                 excerpt.includes(searchLower) ||
                 category.includes(searchLower);
        });
        
        // When searching, ignore category filter for true global search
      } else {
        // Only apply category filter when NOT searching
        if (category && category !== 'all') {
          filteredPosts = filteredPosts.filter((post: any) => {
            const postCategoryValue = String(post.category?.name?.en || 
                                     post.category?.name || 
                                     post.category?.slug || 
                                     post.category?.id || '');
            const matches = postCategoryValue === category || 
                   postCategoryValue.toLowerCase() === category.toLowerCase();
            
            return matches;
          });
        }
      }
      
      // Sort posts: featured posts first, then by date
      filteredPosts.sort((a: BlogPost, b: BlogPost) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        const dateA = new Date(a.published_at || a.created_at || '').getTime();
        const dateB = new Date(b.published_at || b.created_at || '').getTime();
        return dateB - dateA;
      });
      
      // Client-side pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      return {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: filteredPosts.length,
          totalPages: Math.ceil(filteredPosts.length / limit)
        }
      };
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  }

  /**
   * Get published posts only
   */
  async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      const url = this.baseUrl;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch published blog posts');
      }
      
      const result = await response.json();
      
      // Handle paginated response format
      let postsArray = result.results || result.data || result;
      
      // If backend has pagination and we didn't get all posts, fetch remaining pages
      if (result.next && (result.count > postsArray.length)) {
        let currentPage = 2;
        let currentResult = result;
        while (currentResult.next) {
          const nextPageUrl = currentResult.next;
          
          const pageResponse = await fetch(nextPageUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (pageResponse.ok) {
            const pageResult = await pageResponse.json();
            const pagePosts = pageResult.results || pageResult.data || pageResult;
            postsArray = [...postsArray, ...pagePosts];
            currentResult = pageResult;
          } else {
            break;
          }
          currentPage++;
        }
      }
      
      if (!Array.isArray(postsArray)) {
        throw new Error('Invalid response from server');
      }
      
      // Transform backend format to frontend format
      const transformedPosts = postsArray.map((post: any) => {
        return {
          id: post.id,
          title: {
            en: post.title_en,
            ar: post.title_ar
          },
          slug: post.slug,
          excerpt: {
            en: post.excerpt_en,
            ar: post.excerpt_ar
          },
          content: post.content,
          cover_image: post.cover_image ? {
            id: post.cover_image.id,
            url: `/api/images/${post.cover_image.id}/`,
            alt_en: post.cover_image.alt_en,
            alt_ar: post.cover_image.alt_ar
          } : undefined,
          cover_image_id: post.cover_image?.id || post.cover_image_id || null,
          category: post.category ? {
            id: post.category.id,
            name: {
              en: post.category.name_en,
              ar: post.category.name_ar
            },
            slug: post.category.slug
          } : undefined,
          category_id: post.category?.id || post.category_id,
          author: post.author ? {
            id: post.author.id,
            name: post.author.name,
            avatar: post.author.avatar
          } : undefined,
          author_id: post.author?.id || post.author_id,
          published_at: post.published_at,
          reading_time: post.reading_time,
          tags: {
            en: post.tags_en || [],
            ar: post.tags_ar || []
          },
          is_featured: post.is_featured || false,
          status: post.status || 'draft',
          seo: post.seo,
          created_at: post.created_at,
          updated_at: post.updated_at
        };
      });
      
      // Filter to only return published posts
      const publishedPosts = transformedPosts.filter(post => post.status === 'published');
      
      return publishedPosts;
    } catch (error: any) {
      console.error('Error fetching published blog posts:', error);
      throw error;
    }
  }

  /**
   * Get blog post by slug
   */
  async getPostById(slug: string): Promise<BlogPost | null> {
    try {
      if (!slug) {
        return null;
      }
      
      const response = await fetchWithTokenRefresh(`${this.baseUrl}/${slug}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch blog post: ${response.status} ${errorText}`);
      }
      
      const post = await response.json();
      
      // Transform backend format to frontend format
      return {
        id: post.id,
        title: {
          en: post.title_en,
          ar: post.title_ar
        },
        slug: post.slug,
        excerpt: {
          en: post.excerpt_en,
          ar: post.excerpt_ar
        },
        content: post.content,
        cover_image: post.cover_image ? {
          id: post.cover_image.id,
          url: post.cover_image.url,
          alt_en: post.cover_image.alt_en,
          alt_ar: post.cover_image.alt_ar
        } : undefined,
        cover_image_id: post.cover_image?.id || post.cover_image_id || null,
        category: post.category ? {
          id: post.category.id,
          name: {
            en: post.category.name_en,
            ar: post.category.name_ar
          },
          slug: post.category.slug
        } : undefined,
        category_id: post.category?.id || post.category_id,
        author: post.author ? {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.avatar
        } : undefined,
        author_id: post.author?.id || post.author_id,
        published_at: post.published_at,
        reading_time: post.reading_time,
        tags: {
          en: post.tags_en || [],
          ar: post.tags_ar || []
        },
        is_featured: post.is_featured || false,
        status: post.status || 'draft',
        seo: post.seo,
        created_at: post.created_at,
        updated_at: post.updated_at
      };
      
    } catch (error) {
      if (handleAuthError(error)) {
        throw error;
      }
      console.error('Error fetching blog post:', error);
      throw error;
    }
  }

  /**
   * Get blog post by slug (requires authentication)
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      if (!slug) {
        return null;
      }
      
      const result = await this.getPosts(1, 1000);
      const post = result.posts.find((p: BlogPost) => p.slug === slug);
      return post || null;
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      throw error;
    }
  }

  /**
   * Get published blog post by slug (public access, no authentication required)
   */
  async getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      if (!slug) {
        return null;
      }
      
      const posts = await this.getPublishedPosts();
      const post = posts.find((p: BlogPost) => p.slug === slug);
      return post || null;
    } catch (error) {
      console.error('Error fetching published blog post by slug:', error);
      throw error;
    }
  }

  /**
   * Delete a blog post
   */
  async deletePost(slug: string): Promise<void> {
    try {
      if (!slug) {
        throw new Error('Post slug is required');
      }
      
      const response = await fetchWithTokenRefresh(`${this.baseUrl}/${slug}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post not found');
        }
        const errorText = await response.text();
        throw new Error(`Failed to delete blog post: ${response.status} ${errorText}`);
      }
    } catch (error) {
      if (handleAuthError(error)) {
        throw error;
      }
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  /**
   * Create a blog post
   */
  async createPost(data: BlogFormData): Promise<BlogPost> {
    try {
      const response = await fetchWithTokenRefresh('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create blog post (${response.status})`);
      }
      
      const post = await response.json();
      
      // Transform backend format to frontend format
      return {
        id: post.id,
        title: {
          en: post.title_en,
          ar: post.title_ar
        },
        slug: post.slug,
        excerpt: {
          en: post.excerpt_en,
          ar: post.excerpt_ar
        },
        content: post.content,
        cover_image: post.cover_image ? {
          id: post.cover_image.id,
          url: post.cover_image.url,
          alt_en: post.cover_image.alt_en,
          alt_ar: post.cover_image.alt_ar
        } : undefined,
        cover_image_id: post.cover_image?.id || post.cover_image_id || null,
        category: post.category ? {
          id: post.category.id,
          name: {
            en: post.category.name_en,
            ar: post.category.name_ar
          },
          slug: post.category.slug
        } : undefined,
        category_id: post.category?.id || post.category_id,
        author: post.author ? {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.avatar
        } : undefined,
        author_id: post.author?.id || post.author_id,
        published_at: post.published_at,
        reading_time: post.reading_time,
        tags: {
          en: post.tags_en || [],
          ar: post.tags_ar || []
        },
        is_featured: post.is_featured || false,
        status: post.status || 'draft',
        seo: post.seo,
        created_at: post.created_at,
        updated_at: post.updated_at
      };
      
    } catch (error) {
      if (handleAuthError(error)) {
        throw error;
      }
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  /**
   * Update a blog post
   */
  async updatePost(slug: string, data: Partial<BlogFormData>): Promise<BlogPost> {
    try {
      const response = await fetchWithTokenRefresh(`/api/blogs/${slug}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }
      
      const post = await response.json();
      
      // Transform backend format to frontend format
      return {
        id: post.id,
        title: {
          en: post.title_en,
          ar: post.title_ar
        },
        slug: post.slug,
        excerpt: {
          en: post.excerpt_en,
          ar: post.excerpt_ar
        },
        content: post.content,
        cover_image: post.cover_image ? {
          id: post.cover_image.id,
          url: post.cover_image.url,
          alt_en: post.cover_image.alt_en,
          alt_ar: post.cover_image.alt_ar
        } : undefined,
        cover_image_id: post.cover_image?.id || post.cover_image_id || null,
        category: post.category ? {
          id: post.category.id,
          name: {
            en: post.category.name_en,
            ar: post.category.name_ar
          },
          slug: post.category.slug
        } : undefined,
        category_id: post.category?.id || post.category_id,
        author: post.author ? {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.avatar
        } : undefined,
        author_id: post.author?.id || post.author_id,
        published_at: post.published_at,
        reading_time: post.reading_time,
        tags: {
          en: post.tags_en || [],
          ar: post.tags_ar || []
        },
        is_featured: post.is_featured || false,
        status: post.status || 'draft',
        seo: post.seo,
        created_at: post.created_at,
        updated_at: post.updated_at
      };
      
    } catch (error) {
      if (handleAuthError(error)) {
        throw error;
      }
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  /**
   * Get published related posts
   */
  async getPublishedRelatedPosts(categoryId: number, currentId: number, limit: number = 3): Promise<BlogPost[]> {
    try {
      const posts = await this.getPublishedPosts();
      return posts
        .filter(post => 
          post.category_id === categoryId && 
          post.id !== currentId &&
          post.status === 'published'
        )
        .slice(0, limit);
    } catch (error: any) {
      console.error('Error fetching published related posts:', error);
      return [];
    }
  }
}

export const blogService = new BlogService();
