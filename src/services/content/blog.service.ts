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
  content: {
    time: number;
    blocks: Array<{
      id?: string;
      type: string;
      data: any;
    }>;
    version: string;
  };
  cover_image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
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
  reading_time: number;
  tags: {
    en: string[];
    ar: string[];
  };
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  seo?: {
    meta_description: string;
    keywords: string;
    og_title: string;
    og_description: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface BlogFormData {
  title: {
    en: string;
    ar: string;
  };
  excerpt: {
    en: string;
    ar: string;
  };
  content: {
    time: number;
    blocks: Array<{
      id?: string;
      type: string;
      data: any;
    }>;
    version: string;
  };
  cover_image_id?: number | null;
  category_id?: number;
  author_id?: number;
  reading_time?: number;
  tags?: {
    en: string[];
    ar: string[];
  };
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  seo?: {
    meta_description: string;
    keywords: string;
    og_title: string;
    og_description: string;
  };
}

class BlogService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/blogs`;

  /**
   * Get all blog posts
   */
  async getPosts(): Promise<BlogPost[]> {
    try {
      const response = await fetchWithTokenRefresh(this.baseUrl, {
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
      const postsArray = result.results || result.data || result;
      
      if (!Array.isArray(postsArray)) {
        throw new Error('Invalid response from server');
      }
      
      // Transform backend format to frontend format
      return postsArray.map((post: any) => {
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
      
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  }

  /**
   * Get published blog posts (public access, no authentication required)
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
      const postsArray = result.results || result.data || result;
      
      if (!Array.isArray(postsArray)) {
        throw new Error('Invalid response from server');
      }
      
      // Transform backend format to frontend format (same as getPosts)
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
            url: `/api/images/${post.cover_image.id}/`, // Use Next.js API route
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
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
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
      
      const posts = await this.getPosts();
      const post = posts.find(p => p.slug === slug);
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
      
      // Use the public method to fetch published posts
      const posts = await this.getPublishedPosts();
      const post = posts.find(p => p.slug === slug);
      return post || null;
    } catch (error) {
      console.error('Error fetching published blog post by slug:', error);
      throw error;
    }
  }

  /**
   * Create new blog post
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
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  /**
   * Update blog post by slug
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
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  /**
   * Delete blog post by slug
   */
  async deletePost(slug: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/${slug}/`;
      
      const response = await fetchWithTokenRefresh(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to delete blog post (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {
            // Use status text if available
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }
      
    } catch (error: any) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  /**
   * Get related posts (requires authentication)
   */
  async getRelatedPosts(categoryId: number, currentId: number, limit: number = 3): Promise<BlogPost[]> {
    try {
      const posts = await this.getPosts();
      return posts
        .filter(post => 
          post.category_id === categoryId && 
          post.id !== currentId &&
          post.status === 'published'
        )
        .slice(0, limit);
    } catch (error: any) {
      console.error('Error fetching related posts:', error);
      return [];
    }
  }

  /**
   * Get published related posts (public access, no authentication required)
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
export default blogService;
